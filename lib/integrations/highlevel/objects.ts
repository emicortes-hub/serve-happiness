import { ghlRequest, getGhlLocationId } from './client';

export interface SyncCustomObjectInput {
  existingRecordId?: string | null;
  contactId: string;
  ticketId: string;
  ticketNumber: string;
  program: string;
  status: string;
  priority: string;
  whopUserId: string;
  description: string;
}

export async function syncGhlSupportTicketObject(
  input: SyncCustomObjectInput
): Promise<string> {
  const locationId = getGhlLocationId();
  const objectKey = process.env.GHL_CUSTOM_OBJECT_KEY || 'custom_objects.support_tickets';

  const properties: Record<string, any> = {
    ticket_number: input.ticketNumber,
    serve_ticket_id: input.ticketId,
    program: input.program || 'Consulta General',
    status: input.status,
    priority: input.priority || 'P3',
    whop_user_id: input.whopUserId,
    ticket_description: input.description,
  };

  // Si ya tenemos el ID del Custom Object en Supabase, actualizamos directamente
  if (input.existingRecordId) {
    await ghlRequest(`/objects/${objectKey}/records/${input.existingRecordId}`, {
      method: 'PUT',
      query: { locationId },
      body: { properties },
    });
    return input.existingRecordId;
  }

  // Crear nuevo registro en Custom Object Support Tickets
  const createRes = await ghlRequest<{ record?: { id: string }; id?: string }>(
    `/objects/${objectKey}/records`,
    {
      method: 'POST',
      body: {
        locationId,
        properties,
      },
    }
  );

  const recordId = createRes?.record?.id || createRes?.id;
  if (!recordId) {
    throw new Error('GoHighLevel no devolvió record.id al crear Support Ticket');
  }

  // Asociar Support Ticket <-> Contact buscando la definición de asociación creada
  await linkTicketRecordToContact(locationId, objectKey, recordId, input.contactId).catch((err) => {
    console.warn('Advertencia vinculando Custom Object con Contact en GHL:', err?.message || err);
  });

  return recordId;
}

async function linkTicketRecordToContact(
  locationId: string,
  objectKey: string,
  recordId: string,
  contactId: string
) {
  const assocList = await ghlRequest<{
    associations?: Array<{ id: string; firstObjectKey: string; secondObjectKey: string }>;
  }>('/associations/', {
    method: 'GET',
    query: { locationId },
  });

  const match = assocList?.associations?.find(
    (a) =>
      (a.firstObjectKey === objectKey && a.secondObjectKey === 'contact') ||
      (a.firstObjectKey === 'contact' && a.secondObjectKey === objectKey)
  );

  if (!match?.id) return;

  const isTicketFirst = match.firstObjectKey === objectKey;

  await ghlRequest('/associations/relations', {
    method: 'POST',
    body: {
      locationId,
      associationId: match.id,
      firstRecordId: isTicketFirst ? recordId : contactId,
      secondRecordId: isTicketFirst ? contactId : recordId,
    },
  });
}