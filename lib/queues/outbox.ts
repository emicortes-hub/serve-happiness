import { supabaseAdmin } from '@/lib/supabase';
import { findOrUpsertGhlContact } from '@/lib/integrations/highlevel/contacts';
import { syncGhlSupportTicketObject } from '@/lib/integrations/highlevel/objects';
import { syncGhlSupportOpportunity } from '@/lib/integrations/highlevel/opportunities';

export async function processOutboxBatch(limit = 10) {
  const nowIso = new Date().toISOString();

  // 1. Obtener eventos pendientes listos para procesar
  const { data: events, error } = await supabaseAdmin
    .from('integration_outbox')
    .select('*')
    .in('status', ['PENDING', 'FAILED'])
    .lte('next_retry_at', nowIso)
    .lt('attempts', 5)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw error;
  if (!events || events.length === 0) {
    return { processed: 0, succeeded: 0, failed: 0 };
  }

  let succeeded = 0;
  let failed = 0;

  for (const event of events) {
    // Bloquear evento marcándolo como PROCESSING
    await supabaseAdmin
      .from('integration_outbox')
      .update({
        status: 'PROCESSING',
        attempts: (event.attempts || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', event.id);

    try {
      // Leer estado actual del ticket en Supabase (fuente de verdad)
      const { data: ticket, error: ticketErr } = await supabaseAdmin
        .from('support_tickets')
        .select('*')
        .eq('id', event.aggregate_id)
        .single();

      if (ticketErr || !ticket) {
        throw new Error(`Ticket ${event.aggregate_id} no encontrado en Supabase`);
      }

      // Paso A: Contacto en GHL
      const contactId =
        ticket.ghl_contact_id ||
        (await findOrUpsertGhlContact({
          name: ticket.student_name,
          email: ticket.student_email,
          phone: ticket.student_phone,
          whopUserId: ticket.student_whop_id,
          program: ticket.program,
        }));

      // Paso B: Custom Object Support Tickets en GHL
      const customObjectId = await syncGhlSupportTicketObject({
        existingRecordId: ticket.ghl_custom_object_id,
        contactId,
        ticketId: ticket.id,
        ticketNumber: ticket.ticket_number,
        program: ticket.program,
        status: ticket.status,
        priority: ticket.priority,
        whopUserId: ticket.student_whop_id,
        description: ticket.description,
      });

      // Paso C: Oportunidad en pipeline PST | Support Operations
      const opportunityId = await syncGhlSupportOpportunity({
        existingOpportunityId: ticket.ghl_opportunity_id,
        contactId,
        ticketNumber: ticket.ticket_number,
        subject: ticket.subject,
        program: ticket.program,
        status: ticket.status,
      });

      // Paso D: Persistir IDs de GHL en support_tickets y marcar SYNCED
      await supabaseAdmin
        .from('support_tickets')
        .update({
          ghl_contact_id: contactId,
          ghl_custom_object_id: customObjectId,
          ghl_opportunity_id: opportunityId,
          sync_status: 'SYNCED',
          last_synced_at: new Date().toISOString(),
          sync_error: null,
        })
        .eq('id', ticket.id);

      // Paso E: Marcar evento de outbox como PROCESSED
      await supabaseAdmin
        .from('integration_outbox')
        .update({
          status: 'PROCESSED',
          processed_at: new Date().toISOString(),
          last_error: null,
        })
        .eq('id', event.id);

      succeeded++;
    } catch (err: any) {
      failed++;
      const attemptCount = (event.attempts || 0) + 1;
      // Backoff exponencial: 1m, 4m, 9m, 16m...
      const backoffSeconds = Math.pow(attemptCount, 2) * 60;
      const nextRetry = new Date(Date.now() + backoffSeconds * 1000).toISOString();

      await supabaseAdmin
        .from('integration_outbox')
        .update({
          status: attemptCount >= 5 ? 'DEAD_LETTER' : 'FAILED',
          last_error: err?.message || 'Error desconocido sincronizando con GHL',
          next_retry_at: nextRetry,
          updated_at: new Date().toISOString(),
        })
        .eq('id', event.id);

      await supabaseAdmin
        .from('support_tickets')
        .update({
          sync_status: 'ERROR',
          sync_error: err?.message || 'Error sincronizando con GHL',
        })
        .eq('id', event.aggregate_id);
    }
  }

  return { processed: events.length, succeeded, failed };
}