import { supabaseAdmin } from '@/lib/supabase';
import { findOrUpsertGhlContact } from '@/lib/integrations/highlevel/contacts';
import { syncGhlSupportTicketObject } from '@/lib/integrations/highlevel/objects';
import { syncGhlSupportOpportunity } from '@/lib/integrations/highlevel/opportunities';

export async function processOutboxBatch(limit = 10) {
  // 1. Obtener eventos pendientes listos para procesar
  const { data: events, error } = await supabaseAdmin
    .from('integration_outbox')
    .select('*')
    .in('status', ['PENDING', 'FAILED'])
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
      const recordId = await syncGhlSupportTicketObject({
        existingRecordId: ticket.ghl_record_id,
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

      // Paso D: Persistir IDs de GHL en support_tickets
      const { error: updateTicketErr } = await supabaseAdmin
        .from('support_tickets')
        .update({
          ghl_contact_id: contactId,
          ghl_record_id: recordId,
          ghl_opportunity_id: opportunityId,
          sync_status: 'SYNCED',
        })
        .eq('id', ticket.id);

      if (updateTicketErr) {
        throw new Error(`Error actualizando support_tickets: ${updateTicketErr.message}`);
      }

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
      console.error('Fallo procesando outbox event:', event.id, err);
      const attemptCount = (event.attempts || 0) + 1;

      await supabaseAdmin
        .from('integration_outbox')
        .update({
          status: attemptCount >= 5 ? 'DEAD_LETTER' : 'FAILED',
          last_error: err?.message || 'Error desconocido sincronizando con GHL',
        })
        .eq('id', event.id);

      await supabaseAdmin
        .from('support_tickets')
        .update({
          sync_status: 'ERROR',
        })
        .eq('id', event.aggregate_id);
    }
  }

  return { processed: events.length, succeeded, failed };
}