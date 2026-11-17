import { NextResponse } from 'next/server';
import { getVerifiedWhopSession } from '@/lib/whop';
import { supabaseAdmin } from '@/lib/supabase';
import { processOutboxBatch } from '@/lib/queues/outbox';

export async function POST(
  req: Request,
  context: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await context.params;
    const session = await getVerifiedWhopSession(req.headers);
    const body = await req.json();

    const messageText = String(body?.message || '').trim();
    const studentWhopId = session?.userId || body?.studentWhopId;

    if (!messageText) {
      return NextResponse.json({ ok: false, error: 'El mensaje no puede estar vacío' }, { status: 400 });
    }

    const { data: ticket, error: ticketErr } = await supabaseAdmin
      .from('support_tickets')
      .select('*')
      .eq('id', ticketId)
      .single();

    if (ticketErr || !ticket) {
      return NextResponse.json({ ok: false, error: 'Ticket no encontrado' }, { status: 404 });
    }

    if (studentWhopId && ticket.student_whop_id !== studentWhopId) {
      return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 403 });
    }

    // 1. Insertar mensaje público del alumno
    const { data: savedMsg, error: msgErr } = await supabaseAdmin
      .from('support_messages')
      .insert({
        ticket_id: ticket.id,
        tenant_id: ticket.tenant_id,
        sender_role: 'student',
        sender_name: ticket.student_name,
        visibility: 'public',
        body: messageText,
      })
      .select()
      .single();

    if (msgErr) throw msgErr;

    // 2. Si el ticket esperaba respuesta del alumno o estaba resuelto, reactivarlo
    const nextStatus = ['WAITING_STUDENT', 'RESOLVED'].includes(ticket.status)
      ? 'IN_PROGRESS'
      : ticket.status;

    if (nextStatus !== ticket.status) {
      await supabaseAdmin
        .from('support_tickets')
        .update({ status: nextStatus, sync_status: 'PENDING' })
        .eq('id', ticket.id);
    }

    // 3. Encolar evento hacia GoHighLevel Conversations
    await supabaseAdmin.from('integration_outbox').insert({
      tenant_id: ticket.tenant_id,
      aggregate_type: 'support_ticket',
      aggregate_id: ticket.id,
      event_type: 'ticket.message.added',
      idempotency_key: `ticket.message.added:${savedMsg.id}`,
      payload: {
        ticket_number: ticket.ticket_number,
        message_id: savedMsg.id,
        message_body: messageText,
      },
      status: 'PENDING',
    });

    // 4. Procesar outbox de inmediato
    try {
      await processOutboxBatch(5);
    } catch (syncErr) {
      console.error('Error sincronizando nuevo mensaje con GHL:', syncErr);
    }

    return NextResponse.json({ ok: true, message: savedMsg, status: nextStatus });
  } catch (error: any) {
    console.error('Error en POST /api/support/tickets/[ticketId]/messages:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}