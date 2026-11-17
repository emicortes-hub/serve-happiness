import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase'; // ajusta la ruta si tu cliente admin tiene otro nombre

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // Whop v2/v5 usa "type" y "id"; v1 usaba "action"
    const eventType = payload.type ?? payload.action ?? 'unknown';
    const whopEventId = payload.id ?? `evt_${Date.now()}`;
    const companyId =
      payload.data?.company_id ??
      payload.data?.company?.id ??
      payload.company_id ??
      null;

    console.log('Evento de Whop recibido:', eventType, { whopEventId, companyId });

    // 1. Registrar SIEMPRE el evento en whop_webhook_events para auditoría
    const { error: logError } = await supabaseAdmin
      .from('whop_webhook_events')
      .upsert(
        {
          whop_event_id: whopEventId,
          event_type: eventType,
          company_id: companyId,
          payload,
        },
        { onConflict: 'whop_event_id' }
      );

    if (logError) {
      console.error('Error guardando webhook en Supabase:', logError);
    }

    // 2. Si es instalación de app o activación con companyId, asegurar fila en company_settings
    if (
      companyId &&
      (eventType === 'app_installed' ||
        eventType === 'app.installed' ||
        eventType === 'membership.activated')
    ) {
      await supabaseAdmin
        .from('company_settings')
        .upsert({ company_id: companyId }, { onConflict: 'company_id' });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Error procesando webhook:', error);
    return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
  }
}