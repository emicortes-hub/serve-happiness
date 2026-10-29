import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: Cargar datos del tenant por companyId
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  if (!companyId) {
    return NextResponse.json({ error: 'Falta companyId' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('company_id', companyId)
    .single();

  if (error || !data) {
    // Configuración base de respaldo
    return NextResponse.json({
      company_id: companyId,
      client_name: 'Centro de Soporte',
      tagline: 'Mesa de ayuda y resolución de consultas',
      brand_color: '#B89A60',
      logo_url: '',
      zoom_url: '',
      telegram_chat_id: '',
      enable_escalation: true,
      programs: ['Consulta General', 'Soporte Técnico', 'Facturación'],
    });
  }

  return NextResponse.json(data);
}

// POST: Guardar o actualizar configuración desde el panel SERVE
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      companyId,
      clientName,
      tagline,
      clientBrandColor,
      clientLogoUrl,
      zoomUrl,
      telegramChatId,
      enableEscalationAlerts,
      programs,
    } = body;

    if (!companyId) {
      return NextResponse.json({ error: 'companyId es requerido' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('tenants')
      .upsert(
        {
          company_id: companyId,
          client_name: clientName,
          tagline,
          brand_color: clientBrandColor,
          logo_url: clientLogoUrl,
          zoom_url: zoomUrl,
          telegram_chat_id: telegramChatId,
          enable_escalation: enableEscalationAlerts,
          programs,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'company_id' }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al guardar' }, { status: 500 });
  }
}