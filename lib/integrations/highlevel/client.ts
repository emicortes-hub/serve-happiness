const GHL_BASE_URL = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';

export class GhlApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'GhlApiError';
    this.status = status;
    this.details = details;
  }
}

export async function ghlRequest<T = any>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: Record<string, any>;
    query?: Record<string, string | number | undefined>;
  } = {}
): Promise<T> {
  const token = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  if (!token) {
    throw new Error('Falta GHL_PRIVATE_INTEGRATION_TOKEN en variables de entorno');
  }

  const url = new URL(`${GHL_BASE_URL}${path}`);
  if (options.query) {
    for (const [key, val] of Object.entries(options.query)) {
      if (val !== undefined && val !== '') {
        url.searchParams.set(key, String(val));
      }
    }
  }

  const res = await fetch(url.toString(), {
    method: options.method || 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Version: GHL_API_VERSION,
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    throw new GhlApiError(
      `GHL API ${options.method || 'GET'} ${path} falló (${res.status}): ${
        data?.message || data?.error || text
      }`,
      res.status,
      data
    );
  }

  return data as T;
}

export function getGhlLocationId(): string {
  const locationId = process.env.GHL_LOCATION_ID;
  if (!locationId) {
    throw new Error('Falta GHL_LOCATION_ID en variables de entorno');
  }
  return locationId;
}