import { ghlRequest, getGhlLocationId } from './client';

export function mapTicketStatusToStageId(status: string): string {
  const normalized = (status || 'NEW').toUpperCase();

  switch (normalized) {
    case 'ASSIGNED':
    case 'IN_PROGRESS':
      return process.env.GHL_STAGE_IN_PROGRESS_ID!;
    case 'WAITING_STUDENT':
      return process.env.GHL_STAGE_WAITING_ID!;
    case 'ESCALATED':
      return process.env.GHL_STAGE_ESCALATED_ID!;
    case 'RESOLVED':
    case 'CLOSED':
      return process.env.GHL_STAGE_RESOLVED_ID!;
    case 'NEW':
    case 'IN_REVIEW':
    case 'REOPENED':
    default:
      return process.env.GHL_STAGE_NEW_ID!;
  }
}

export interface SyncOpportunityInput {
  existingOpportunityId?: string | null;
  contactId: string;
  ticketNumber: string;
  subject: string;
  program: string;
  status: string;
}

export async function syncGhlSupportOpportunity(
  input: SyncOpportunityInput
): Promise<string> {
  const locationId = getGhlLocationId();
  const pipelineId = process.env.GHL_PIPELINE_ID!;
  const pipelineStageId = mapTicketStatusToStageId(input.status);
  const opportunityStatus =
    input.status === 'RESOLVED' || input.status === 'CLOSED' ? 'won' : 'open';

  const title = `[${input.ticketNumber}] ${input.program} — ${input.subject}`.slice(0, 180);

  if (input.existingOpportunityId) {
    await ghlRequest(`/opportunities/${input.existingOpportunityId}`, {
      method: 'PUT',
      body: {
        pipelineId,
        pipelineStageId,
        name: title,
        status: opportunityStatus,
      },
    });
    return input.existingOpportunityId;
  }

  const createRes = await ghlRequest<{ opportunity?: { id: string }; id?: string }>(
    '/opportunities/',
    {
      method: 'POST',
      body: {
        locationId,
        pipelineId,
        pipelineStageId,
        contactId: input.contactId,
        name: title,
        status: opportunityStatus,
        source: 'SERVE Support 2.0',
      },
    }
  );

  const oppId = createRes?.opportunity?.id || createRes?.id;
  if (!oppId) {
    throw new Error('GoHighLevel no devolvió opportunity.id');
  }

  return oppId;
}