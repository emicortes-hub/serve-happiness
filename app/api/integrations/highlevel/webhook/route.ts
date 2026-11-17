import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function mapStageToTicketStatus(stageIdOrName: string): string | null {
  if (!stageIdOrName) return null;
  const val = stageIdOrName.trim();
  const lower = val.toLowerCase();

  // Mapeo por Stage ID (UUID)
  if (val === process.env.GHL_STAGE_NEW_ID) return 'IN_REVIEW';
  if (val === process.env.GHL_STAGE_IN_PROGRESS_ID) return 'IN_PROGRESS';
  if (val === process.env.GHL_STAGE_WAITING_ID) return 'WAITING_STUDENT';
  if (val === process.env.GHL_STAGE_ESCALATED_ID) return 'ESCALATED';
  if (val === process.env.GHL_STAGE_RESOLVED_ID) return 'RESOLVED';

  // Mapeo por Stage Name (desde Workflow GHL)
  if (lower === 'new / triage') return 'IN_REVIEW';
  if (lower === 'in progress') return 'IN_PROGRESS';
  if (lower === 'waiting student') return 'WAITING_STUDENT';
  if (lower === 'escalated') return 'ESCALATED';
  if (lower === 'resolved') return 'RESOLVED';

  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const eventType = body?.type || body?.event || '';

    // 1. Respuesta saliente de un mentor desde GHL -> Alumno en Whop
    if (
      eventType === 'OutboundMessage' ||
      (body?.direction === 'outbound' && (body?.body || body?.message))
    ) {
      const contactId = body?.contactId || body?.contact_id;
      const conversationId = body?.conversationId || body?.conversation_id;
      const rawText: string = (body?.body || body?.message || '').trim();

      if (!rawText || (!contactId && !conversationId)) {
        return NextResponse.json({ ok: true, ignored: 'missing_fields' });
      }

      // Buscar folio explícito [PST-2026-XXXXXX] si el mentor lo incluyó, o el ticket abierto más reciente del contacto
      const folioMatch = rawText.match(/\[(PST-\d{4}-\d{6})\]/i);
      let ticket: any = null;

      if (folioMatch?.[1]) {
        const { data } = await supabaseAdmin
          .from('support_tickets')
          .select('*')
          .eq('ticket_number', folioMatch[1].toUpperCase())
          .maybeSingle();
        ticket = data;
      }

      if (!ticket && conversationId) {
        const { data } = await supabaseAdmin
          .from('support_tickets')
          .select('*')
          .eq('ghl_conversation_id', conversationId)
          .not('status', 'in', '("CLOSED")')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        ticket = data;
      }

      if (!ticket && contactId) {
        const { data } = await supabaseAdmin
          .from('support_tickets')
          .select('*')
          .eq('ghl_contact_id', contactId)
          .not('status', 'in', '("CLOSED")')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        ticket = data;
      }

      if (!ticket) {
        return NextResponse.json({ ok: true, ignored: 'no_matching_ticket' });
      }

      // Limpiar prefijo [PST-2026-XXXXXX] si venía en el mensaje para mostrar limpio al alumno
      const cleanMessage = rawText.replace(/^\[PST-\d{4}-\d{6}\]\s*/i, '').trim();

      // Insertar mensaje público del mentor en support_messages
      await supabaseAdmin.from('support_messages').insert({
        ticket_id: ticket.id,
        tenant_id: ticket.tenant_id,
        sender_role: 'mentor',
        sender_name: body?.userName || 'Equipo Pro Sales Training',
        visibility: 'public',
        body: cleanMessage,
      });

      // Mover ticket a WAITING_STUDENT si estaba abierto/en progreso
      if (['NEW', 'IN_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'ESCALATED'].includes(ticket.status)) {
        await supabaseAdmin
          .from('support_tickets')
          .update({
            status: 'WAITING_STUDENT',
            ...(conversationId && !ticket.ghl_conversation_id
              ? { ghl_conversation_id: conversationId }
              : {}),
          })
          .eq('id', ticket.id);

        await supabaseAdmin.from('support_ticket_events').insert({
          ticket_id: ticket.id,
          tenant_id: ticket.tenant_id,
          actor_role: 'mentor',
          event_type: 'mentor.replied',
          payload: { source: 'ghl_conversation', conversationId },
        });
      }

      return NextResponse.json({ ok: true, action: 'mentor_reply_recorded', ticketId: ticket.id });
    }

    // 2. Cambio de etapa en el Pipeline PST | Support Operations -> Estado en Supabase
    if (
      eventType === 'OpportunityStageUpdate' ||
      eventType === 'OpportunityUpdate' ||
      body?.pipelineStageId ||
      body?.stageName
    ) {
      const opportunityId = body?.id || body?.opportunityId || body?.opportunity_id;
      const pipelineId = body?.pipelineId || body?.pipeline_id;
      const newStageValue =
        body?.pipelineStageId || body?.pipeline_stage_id || body?.stageName || '';

      if (pipelineId && pipelineId !== process.env.GHL_PIPELINE_ID) {
        return NextResponse.json({ ok: true, ignored: 'other_pipeline' });
      }

      const mappedStatus = mapStageToTicketStatus(newStageValue);
      if (!opportunityId || !mappedStatus) {
        return NextResponse.json({ ok: true, ignored: 'unmapped_stage' });
      }

      const { data: ticket } = await supabaseAdmin
        .from('support_tickets')
        .select('*')
        .eq('ghl_opportunity_id', opportunityId)
        .maybeSingle();

      if (!ticket || ticket.status === mappedStatus) {
        return NextResponse.json({ ok: true, ignored: 'already_synced_or_not_found' });
      }

      await supabaseAdmin
        .from('support_tickets')
        .update({
          status: mappedStatus,
          ...(mappedStatus === 'RESOLVED' ? { resolved_at: new Date().toISOString() } : {}),
        })
        .eq('id', ticket.id);

      await supabaseAdmin.from('support_ticket_events').insert({
        ticket_id: ticket.id,
        tenant_id: ticket.tenant_id,
        actor_role: 'mentor',
        event_type: 'ticket.status_changed_from_ghl',
        payload: { from: ticket.status, to: mappedStatus, stage: newStageValue },
      });

      return NextResponse.json({
        ok: true,
        action: 'status_synced_from_ghl',
        ticketId: ticket.id,
        status: mappedStatus,
      });
    }

    return NextResponse.json({ ok: true, ignored: 'unhandled_event_type', eventType });
  } catch (error: any) {
    console.error('Error en webhook de GoHighLevel:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}