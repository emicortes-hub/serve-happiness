import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  return NextResponse.json({ ok: true, status: 'API de soporte operativa' }, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { caseId, name, email, program, message, type } = body;

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.warn("Faltan variables TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID");
      return NextResponse.json(
        { ok: false, error: "Credenciales de Telegram no configuradas" },
        { status: 500, headers: corsHeaders }
      );
    }

    const isEscalation = type === 'escalation';

    const text = isEscalation
      ? `🚨 <b>¡TICKET ESCALADO A MENTOR!</b> 🚨\n\n` +
        `🆔 <b>Caso:</b> <code>${caseId}</code>\n` +
        `👤 <b>Alumno:</b> ${name}\n` +
        `📧 <b>Email:</b> ${email}\n` +
        `📚 <b>Programa:</b> ${program}\n` +
        `📝 <b>Consulta / Bloqueo:</b>\n<i>"${message}"</i>\n\n` +
        `⚠️ <i>Requiere revisión directa de mentores.</i>`
      : `📩 <b>NUEVA CONSULTA - PRO SALES TRAINING</b>\n\n` +
        `🆔 <b>Caso:</b> <code>${caseId}</code>\n` +
        `👤 <b>Alumno:</b> ${name}\n` +
        `📧 <b>Email:</b> ${email}\n` +
        `📚 <b>Programa:</b> ${program}\n` +
        `📝 <b>Detalle:</b>\n<i>"${message}"</i>`;

    const telegramRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
      }),
    });

    const data = await telegramRes.json();

    if (!telegramRes.ok) {
      return NextResponse.json({ ok: false, error: data.description }, { status: 500, headers: corsHeaders });
    }

    return NextResponse.json({ ok: true }, { headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500, headers: corsHeaders });
  }
}