import { ghlRequest, getGhlLocationId } from './client';

export interface SyncContactInput {
  name: string;
  email: string;
  phone?: string | null;
  whopUserId: string;
  program?: string | null;
}

const STUDENT_TAG = 'Whop-Student';

function splitName(fullName: string): { firstName: string; lastName: string } {
  const clean = (fullName || 'Alumno SERVE').trim();
  const parts = clean.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

export async function findOrUpsertGhlContact(input: SyncContactInput): Promise<string> {
  const locationId = getGhlLocationId();
  const isPlaceholderEmail =
    !input.email || input.email.endsWith('@prosales.local') || !input.email.includes('@');

  // 1. Buscar contacto existente por email real
  if (!isPlaceholderEmail) {
    const searchRes = await ghlRequest<{ contacts?: Array<{ id: string }> }>('/contacts/', {
      method: 'GET',
      query: {
        locationId,
        query: input.email.trim().toLowerCase(),
        limit: 5,
      },
    });

    const existing = searchRes?.contacts?.[0];
    if (existing?.id) {
      await ghlRequest(`/contacts/${existing.id}`, {
        method: 'PUT',
        body: {
          tags: [STUDENT_TAG],
          ...(input.phone ? { phone: input.phone } : {}),
        },
      }).catch(() => null);
      return existing.id;
    }
  }

  // 2. Si no hubo match por email, buscar por teléfono si existe
  if (input.phone && input.phone.trim().length >= 8) {
    const phoneSearch = await ghlRequest<{ contacts?: Array<{ id: string }> }>('/contacts/', {
      method: 'GET',
      query: {
        locationId,
        query: input.phone.trim(),
        limit: 5,
      },
    });

    const existingByPhone = phoneSearch?.contacts?.[0];
    if (existingByPhone?.id) {
      await ghlRequest(`/contacts/${existingByPhone.id}`, {
        method: 'PUT',
        body: {
          tags: [STUDENT_TAG],
        },
      }).catch(() => null);
      return existingByPhone.id;
    }
  }

  // 3. Crear o hacer upsert del contacto
  const { firstName, lastName } = splitName(input.name);
  const upsertRes = await ghlRequest<{ contact?: { id: string }; id?: string }>(
    '/contacts/upsert',
    {
      method: 'POST',
      body: {
        locationId,
        firstName,
        ...(lastName ? { lastName } : {}),
        ...(!isPlaceholderEmail ? { email: input.email.trim().toLowerCase() } : {}),
        ...(input.phone ? { phone: input.phone.trim() } : {}),
        source: 'SERVE Support 2.0',
        tags: [STUDENT_TAG],
      },
    }
  );

  const contactId = upsertRes?.contact?.id || upsertRes?.id;
  if (!contactId) {
    throw new Error('GoHighLevel no devolvió contact.id tras upsert');
  }

  return contactId;
}