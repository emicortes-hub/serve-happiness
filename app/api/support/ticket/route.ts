import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { caseId, name, email, whatsapp, program, message, type } = body;

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

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

    // Solo botones con protocolo HTTPS válido para Telegram
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
      url: 'https://us02web.zoom.us/j/9272409073?pwd=feP7nGIvZidKJBcqb6v3roewaQrQX1.1',
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
    console.error('Excepción al enviar ticket a Telegram:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}