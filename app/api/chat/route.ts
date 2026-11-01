import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 });
    }

    // Contexto operativo de Pro Sales Training
    const systemPrompt = `
Eres el Asistente Virtual Oficial de "Pro Sales Training". Tu objetivo es orientar a los alumnos en temas de ventas, dudas sobre la plataforma Whop, objeciones comerciales y horarios de coaching en vivo.
- Sé conciso, profesional y motivador.
- Las sesiones en vivo son los martes y jueves a las 18:00 (Hora CDMX).
- Si el alumno tiene un problema técnico grave de pagos o acceso, invítalo a generar un ticket con el botón de soporte para que el equipo humano lo atienda vía Telegram.
    `.trim();

    // Ejemplo usando fetch directo a la API de OpenAI (o Gemini compatible)
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Respuesta de contingencia si no hay API Key configurada
      return NextResponse.json({
        reply: "El asistente de IA está en configuración. Por favor, utiliza el formulario de ticket para que un mentor te asista de inmediato."
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...(history || []),
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 400,
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Hubo un problema al procesar tu consulta.";

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Error en /api/chat:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}