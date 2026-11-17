import { ghlRequest, getGhlLocationId } from './client';

export interface SyncConversationMessageInput {
  existingConversationId?: string | null;
  contactId: string;
  ticketNumber: string;
  program: string;
  subject: string;
  messageBody: string;
  isInitialTicket?: boolean;
}

export async function findOrCreateGhlConversation(
  contactId: string,
  existingConversationId?: string | null
): Promise<string> {
  if (existingConversationId) {
    return existingConversationId;
  }

  const locationId = getGhlLocationId();

  // 1. Buscar si ya existe conversación para este contacto
  const searchRes = await ghlRequest<{
    conversations?: Array<{ id: string }>;
  }>('/conversations/search', {
    method: 'GET',
    query: {
      locationId,
      contactId,
    },
  }).catch(() => ({ conversations: [] }));

  const existing = searchRes?.conversations?.[0];
  if (existing?.id) {
    return existing.id;
  }

  // 2. Crear nueva conversación vinculada al contacto
  const createRes = await ghlRequest<{
    conversation?: { id: string };
    id?: string;
  }>('/conversations/', {
    method: 'POST',
    body: {
      locationId,
      contactId,
    },
  });

  const convId = createRes?.conversation?.id || createRes?.id;
  if (!convId) {
    throw new Error('GoHighLevel no devolvió conversation.id');
  }

  return convId;
}

export async function postInboundStudentMessageToGhl(
  input: SyncConversationMessageInput
): Promise<string> {
  const conversationId = await findOrCreateGhlConversation(
    input.contactId,
    input.existingConversationId
  );

  const formattedMessage = input.isInitialTicket
    ? `📩 Nuevo ticket [${input.ticketNumber}] (${input.program})\nAsunto: ${input.subject}\n\n${input.messageBody}`
    : `💬 [${input.ticketNumber}] Respuesta del alumno:\n\n${input.messageBody}`;

  // Insertar mensaje entrante (inbound) en la conversación de GHL para que aparezca en Conversations
  await ghlRequest('/conversations/messages/inbound', {
    method: 'POST',
    body: {
      type: 'SMS',
      conversationId,
      message: formattedMessage,
      direction: 'inbound',
    },
  }).catch(async () => {
    // Fallback al endpoint estándar /conversations/messages si inbound requiere canal conectado
    await ghlRequest('/conversations/messages', {
      method: 'POST',
      body: {
        type: 'Custom',
        contactId: input.contactId,
        conversationId,
        message: formattedMessage,
      },
    });
  });

  return conversationId;
}