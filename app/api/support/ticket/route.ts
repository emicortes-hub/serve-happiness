import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      caseId,
      name,
      email,
      whatsapp,
      program,
      message,
      type,
      companyId,
      experienceId,
      whopUserId,
    } = body;

    const resolvedCompanyId = companyId || 'biz_jbDM2ID0GqGW3z';

    // 1. Asegurar registro del tenant en company_settings para evitar violación de clave foránea
    await supabaseAdmin
      .from('company_settings')
      .upsert({ company_id: resolvedCompanyId }, { onConflict: 'company_id' });

    // 2. Guardar o actualizar el ticket en Supabase (public.support_tickets)
    if (type === 'escalation' || type === 'resolved') {
      const newStatus = type === 'resolved' ? 'resolved' : 'escalated';
      const { error: updateError } = await supabaseAdmin
        .from('support_tickets')
        .update({ status: newStatus })
        .eq('case_id', caseId);

      if (updateError) {
        console.error('Error actualizando estado del ticket en Supabase:', updateError);
      }
    } else {
      const { error: insertError } = await supabaseAdmin
        .from('support_tickets')
        .insert({
          case_id: caseId,
          company_id: resolvedCompanyId,
          experience_id: experienceId || null,
          whop_user_id: whopUserId || null,
          user_name: name,
          user_email: email,
          whatsapp: whatsapp || null,
          program: program || null,
          message,
          status: 'open',
        });

      if (insertError) {
        console.error('Error insertando ticket en Supabase:', insertError);
      }
    }

    // 3. Obtener configuración personalizada del tenant (si existe) o usar variables de entorno
    const { data: settings } = await supabaseAdmin
      .from('company_settings')
      .select('telegram_chat_id, zoom_link')
      .eq('company_id', resolvedCompanyId)
      .maybeSingle();

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = settings?.telegram_chat_id || process.env.TELEGRAM_CHAT_ID;
    const zoomUrl =
      settings?.zoom_link ||
      'https://us02web.zoom.us/j/9272409073?pwd=feP7nGIvZidKJBcqb6v3roewaQrQX1.1';

    if (!token || !chatId) {
      console.error('Faltan variables de entorno: TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID');
      return NextResponse.json({ ok: false, error: 'Configuración incompleta' }, { status: 500 });
    }

    const cleanPhone = (whatsapp || '').replace(/\D/g, '');

    let header = '🚨 <b>NUEVO TICKET REGISTRADO</b>';
    if (type === 'escalation') {
      header = '⚡ <b>TICKET ESCALADO A MENTOR HUMANO</b>';
    } else if (type === 'resolved') {
      header = '✅ <b>TICKET MARCADO COMO RESUELTO</b>';
    }

    const text = `
${header}

<b>Folio:</b> <code>${caseId}</code>
<b>Alumno:</b> ${name}
<b>Programa:</b> ${program}
<b>Correo:</b> <code>${email}</code>
<b>WhatsApp:</b> <code>${whatsapp}</code>

<b>Consulta comercial:</b>
<i>"${message}"</i>
    `.trim();

    const inlineKeyboard: any[] = [];
    const actionRow = [];

    if (cleanPhone) {
      actionRow.push({
        text: '💬 Abrir WhatsApp',
        url: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
          `Hola ${name}, te contacto del equipo de Pro Sales Training respecto a tu consulta (${caseId}).`
        )}`,
      });
    }

    actionRow.push({
      text: '🎥 Sala Zoom',
      url: zoomUrl,
    });

    inlineKeyboard.push(actionRow);

    const telegramRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: inlineKeyboard,
        },
      }),
    });

    const telegramData = await telegramRes.json();

    if (!telegramData.ok) {
      console.error('Error devuelto por Telegram API:', telegramData);
      return NextResponse.json({ ok: false, error: telegramData.description }, { status: 400 });
    }

    return NextResponse.json({ ok: true, data: telegramData.result });
  } catch (error: any) {
    console.error('Excepción al procesar ticket:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}