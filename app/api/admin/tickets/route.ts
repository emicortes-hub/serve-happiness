import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { processOutboxBatch } from '@/lib/queues/outbox';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId') || '';

    // 1. Obtener tenant asociado al companyId de Whop (o el tenant activo principal)
    let tenantQuery = supabaseAdmin.from('company_settings').select('*');
    if (companyId) {
      tenantQuery = tenantQuery.eq('whop_company_id', companyId);
    }
    const { data: tenants } = await tenantQuery.limit(1);
    const tenant = tenants?.[0] || null;

    // 2. Obtener tickets ordenados por actualización reciente
    let ticketsQuery = supabaseAdmin
      .from('support_tickets')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(100);

    if (tenant?.id) {
      ticketsQuery = ticketsQuery.eq('tenant_id', tenant.id);
    }

    const { data: tickets, error: ticketsErr } = await ticketsQuery;
    if (ticketsErr) throw ticketsErr;

    const ticketList = tickets || [];
    const ticketIds = ticketList.map((t) => t.id);

    // 3. Obtener mensajes asociados a esos tickets
    let messagesByTicket: Record<string, any[]> = {};
    if (ticketIds.length > 0) {
      const { data: messages } = await supabaseAdmin
        .from('support_messages')
        .select('*')
        .in('ticket_id', ticketIds)
        .order('created_at', { ascending: true });

      for (const msg of messages || []) {
        if (!messagesByTicket[msg.ticket_id]) {
          messagesByTicket[msg.ticket_id] = [];
        }
        messagesByTicket[msg.ticket_id].push(msg);
      }
    }

    // 4. Obtener conteo de eventos pendientes/fallidos en outbox
    const { count: outboxPendingCount } = await supabaseAdmin
      .from('integration_outbox')
      .select('*', { count: 'exact', head: true })
      .in('status', ['PENDING', 'FAILED']);

    // 5. Calcular métricas KPI
    const stats = {
      total: ticketList.length,
      open: ticketList.filter((t) =>
        ['NEW', 'IN_REVIEW', 'ASSIGNED', 'IN_PROGRESS'].includes(t.status)
      ).length,
      waitingStudent: ticketList.filter((t) => t.status === 'WAITING_STUDENT').length,
      escalated: ticketList.filter((t) => t.status === 'ESCALATED').length,
      resolved: ticketList.filter((t) => ['RESOLVED', 'CLOSED'].includes(t.status)).length,
      syncErrors: ticketList.filter((t) => t.sync_status === 'ERROR').length,
      outboxPending: outboxPendingCount || 0,
    };

    const enrichedTickets = ticketList.map((t) => ({
      ...t,
      messages: messagesByTicket[t.id] || [],
    }));

    return NextResponse.json({
      ok: true,
      tenant,
      stats,
      tickets: enrichedTickets,
    });
  } catch (error: any) {
    console.error('Error en GET /api/admin/tickets:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = body?.action;

    // Acción 1: Reprocesar cola de outbox manualmente
    if (action === 'process_outbox') {
      const result = await processOutboxBatch(20);
      return NextResponse.json({ ok: true, result });
    }

    // Acción 2: Responder a un ticket desde el panel admin de Whop
    if (action === 'reply') {
      const { ticketId, message, visibility = 'public', senderName = 'Equipo Pro Sales Training' } =
        body;
      if (!ticketId || !message?.trim()) {
        return NextResponse.json({ ok: false, error: 'Faltan datos' }, { status: 400 });
      }

      const { data: ticket, error: tErr } = await supabaseAdmin
        .from('support_tickets')
        .select('*')
        .eq('id', ticketId)
        .single();

      if (tErr || !ticket) {
        return NextResponse.json({ ok: false, error: 'Ticket no encontrado' }, { status: 404 });
      }

      const { data: savedMsg, error: mErr } = await supabaseAdmin
        .from('support_messages')
        .insert({
          ticket_id: ticket.id,
          tenant_id: ticket.tenant_id,
          sender_role: 'mentor',
          sender_name: senderName,
          visibility: visibility === 'internal' ? 'internal' : 'public',
          body: message.trim(),
        })
        .select()
        .single();

      if (mErr) throw mErr;

      if (visibility === 'public') {
        await supabaseAdmin
          .from('support_tickets')
          .update({ status: 'WAITING_STUDENT', sync_status: 'PENDING' })
          .eq('id', ticket.id);

        await supabaseAdmin.from('integration_outbox').insert({
          tenant_id: ticket.tenant_id,
          aggregate_type: 'support_ticket',
          aggregate_id: ticket.id,
          event_type: 'ticket.status_changed',
          idempotency_key: `admin.reply:${savedMsg.id}`,
          payload: {
            ticket_number: ticket.ticket_number,
            status: 'WAITING_STUDENT',
          },
          status: 'PENDING',
        });

        await processOutboxBatch(5).catch(() => null);
      }

      return NextResponse.json({ ok: true, message: savedMsg });
    }

    // Acción 3: Cambiar estado manualmente desde el panel admin y sincronizar con GHL
    if (action === 'update_status') {
      const { ticketId, status } = body;
      if (!ticketId || !status) {
        return NextResponse.json({ ok: false, error: 'Faltan datos' }, { status: 400 });
      }

      const { data: ticket, error: tErr } = await supabaseAdmin
        .from('support_tickets')
        .select('*')
        .eq('id', ticketId)
        .single();

      if (tErr || !ticket) {
        return NextResponse.json({ ok: false, error: 'Ticket no encontrado' }, { status: 404 });
      }

      await supabaseAdmin
        .from('support_tickets')
        .update({
          status,
          sync_status: 'PENDING',
          ...(status === 'RESOLVED' ? { resolved_at: new Date().toISOString() } : {}),
        })
        .eq('id', ticket.id);

      await supabaseAdmin.from('integration_outbox').insert({
        tenant_id: ticket.tenant_id,
        aggregate_type: 'support_ticket',
        aggregate_id: ticket.id,
        event_type: 'ticket.status_changed',
        idempotency_key: `admin.status:${ticket.id}:${status}:${Date.now()}`,
        payload: {
          ticket_number: ticket.ticket_number,
          status,
        },
        status: 'PENDING',
      });

      await processOutboxBatch(5).catch(() => null);

      return NextResponse.json({ ok: true, status });
    }

    return NextResponse.json({ ok: false, error: 'Acción no soportada' }, { status: 400 });
  } catch (error: any) {
    console.error('Error en POST /api/admin/tickets:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}