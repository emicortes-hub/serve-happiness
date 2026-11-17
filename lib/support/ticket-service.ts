import { supabaseAdmin } from '@/lib/supabase';
import { canTransitionStatus, TicketStatus } from './ticket-validation';

export interface CreateTicketParams {
  tenantId: string;
  experienceId?: string | null;
  studentWhopId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string | null;
  program?: string | null;
  subject: string;
  description: string;
}

export async function createSupportTicket(params: CreateTicketParams) {
  const { data, error } = await supabaseAdmin.rpc('create_support_ticket_tx', {
    p_tenant_id: params.tenantId,
    p_experience_id: params.experienceId || null,
    p_student_whop_id: params.studentWhopId,
    p_student_name: params.studentName,
    p_student_email: params.studentEmail,
    p_student_phone: params.studentPhone || null,
    p_program: params.program || 'Consulta General',
    p_subject: params.subject,
    p_description: params.description,
  });

  if (error || !data) {
    throw new Error(`Error creando ticket en Supabase: ${error?.message || 'Sin respuesta RPC'}`);
  }

  return data;
}

export async function transitionSupportTicketStatus(params: {
  ticketIdentifier: string;
  nextStatus: TicketStatus;
  actorType: 'student' | 'agent' | 'AI' | 'system';
  actorId?: string | null;
  reason?: string;
  resolution?: string;
}) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    params.ticketIdentifier
  );

  const query = supabaseAdmin.from('support_tickets').select('*');
  const { data: ticket, error: fetchError } = await (
    isUuid
      ? query.eq('id', params.ticketIdentifier)
      : query.eq('ticket_number', params.ticketIdentifier)
  ).single();

  if (fetchError || !ticket) {
    throw new Error('Ticket no encontrado para actualizar estado');
  }

  const currentStatus = ticket.status as TicketStatus;
  if (!canTransitionStatus(currentStatus, params.nextStatus)) {
    throw new Error(`Transición de estado no permitida: ${currentStatus} -> ${params.nextStatus}`);
  }

  const nowIso = new Date().toISOString();
  const updatePayload: Record<string, any> = {
    status: params.nextStatus,
    updated_at: nowIso,
  };

  if (params.nextStatus === 'ESCALATED' && params.reason) {
    updatePayload.escalation_reason = params.reason;
  }
  if (params.nextStatus === 'RESOLVED') {
    updatePayload.resolved_at = nowIso;
    if (params.resolution) updatePayload.resolution = params.resolution;
  }
  if (params.nextStatus === 'CLOSED') {
    updatePayload.closed_at = nowIso;
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('support_tickets')
    .update(updatePayload)
    .eq('id', ticket.id)
    .select('*')
    .single();

  if (updateError || !updated) {
    throw new Error(`Error actualizando estado: ${updateError?.message}`);
  }

  // Registrar auditoría en support_ticket_events
  await supabaseAdmin.from('support_ticket_events').insert({
    ticket_id: ticket.id,
    actor_type: params.actorType,
    actor_id: params.actorId || null,
    event_type: `STATUS_CHANGED_TO_${params.nextStatus}`,
    payload: {
      from: currentStatus,
      to: params.nextStatus,
      reason: params.reason || null,
    },
  });

  // Encolar evento en Outbox si se escaló
  if (params.nextStatus === 'ESCALATED') {
    await supabaseAdmin.from('integration_outbox').insert({
      event_type: 'ticket.escalated',
      aggregate_id: ticket.id,
      payload: updated,
      idempotency_key: `ticket.escalated:${ticket.id}:${nowIso}`,
    });
  }

  return updated;
}

export async function sendTelegramFallbackAlert(params: {
  tenantId: string;
  ticketNumber: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string | null;
  program?: string | null;
  description: string;
  type: 'create' | 'escalation' | 'resolved';
}) {
  try {
    const { data: tenant } = await supabaseAdmin
      .from('tenants')
      .select('telegram_chat_id, zoom_url')
      .eq('company_id', params.tenantId)
      .maybeSingle();

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = tenant?.telegram_chat_id || process.env.TELEGRAM_CHAT_ID;
    const zoomUrl =
      tenant?.zoom_url ||
      'https://us02web.zoom.us/j/9272409073?pwd=feP7nGIvZidKJBcqb6v3roewaQrQX1.1';

    if (!token || !chatId) return;

    const cleanPhone = (params.studentPhone || '').replace(/\D/g, '');
    let header = '🚨 <b>NUEVO TICKET REGISTRADO</b>';
    if (params.type === 'escalation') header = '⚡ <b>TICKET ESCALADO A MENTOR HUMANO</b>';
    if (params.type === 'resolved') header = '✅ <b>TICKET MARCADO COMO RESUELTO</b>';

    const text = `
${header}

<b>Folio:</b> <code>${params.ticketNumber}</code>
<b>Alumno:</b> ${params.studentName}
<b>Programa:</b> ${params.program || 'Consulta General'}
<b>Correo:</b> <code>${params.studentEmail}</code>
<b>WhatsApp:</b> <code>${params.studentPhone || 'No proporcionado'}</code>

<b>Consulta comercial:</b>
<i>"${params.description}"</i>
    `.trim();

    const actionRow: any[] = [];
    if (cleanPhone) {
      actionRow.push({
        text: '💬 Abrir WhatsApp',
        url: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
          `Hola ${params.studentName}, te contacto del equipo de Pro Sales Training respecto a tu consulta (${params.ticketNumber}).`
        )}`,
      });
    }
    actionRow.push({ text: '🎥 Sala Zoom', url: zoomUrl });

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: [actionRow] },
      }),
    });
  } catch (err) {
    // Nunca fallar la creación del ticket si Telegram tiene un inconveniente temporal
    console.error('Aviso: fallo no bloqueante enviando alerta a Telegram:', err);
  }
}