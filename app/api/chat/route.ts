import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        reply: "El asistente de IA está en configuración. Por favor, utiliza el formulario de ticket para que un mentor te asista de inmediato."
      });
    }

    // Directrices operativas de Pro Sales Training
    const systemInstruction = `
Eres el Asistente Táctico Oficial de "Pro Sales Training" (academia de ventas de alto valor liderada por Marcelo Gutiérrez).
Tu objetivo es resolver dudas de los alumnos sobre el método de ventas, objeciones comerciales habituales y la dinámica del programa.
Reglas:
- Sé directo, práctico, profesional y con tono de mentor de ventas.
- Explica de forma concisa cómo abordar objeciones como "no tengo presupuesto", "tengo que consultarlo con mi socio" o "déjame pensarlo".
- Recuerda que las sesiones de roleplay y coaching en vivo son los martes y jueves a las 18:00 (Hora CDMX).
- Si el alumno reporta fallos técnicos de acceso a la plataforma o problemas con su pago en Whop, sugiérele abrir la solicitud de soporte en el formulario contiguo para que el equipo lo atienda por Telegram.
    `.trim();

    // Mapeo del historial al formato de Gemini (user / model)
    const contents = (history || []).map((msg: { role: string; content: string }) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Agregar el mensaje actual del alumno
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }],
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      }),
    });

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error('Error devuelto por Gemini API:', data);
      return NextResponse.json({
        reply: "Ocurrió un inconveniente al conectar con el tutor inteligente. Intenta de nuevo en unos momentos."
      });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No obtuve una respuesta válida.";

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Error en /api/chat con Gemini:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}