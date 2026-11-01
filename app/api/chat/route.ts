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

    const systemInstruction = `
Eres el Asistente Táctico Oficial de "Pro Sales Training" (academia de ventas liderada por Marcelo Gutiérrez).
Tu objetivo es resolver dudas de alumnos sobre manejo de objeciones comerciales y la dinámica del programa.
Reglas:
- Sé directo, práctico y profesional con tono de mentor de ventas.
- Explica de forma concisa cómo abordar objeciones como "no tengo presupuesto", "tengo que consultarlo" o "es caro".
- Recuerda que las sesiones de roleplay en vivo son los martes y jueves a las 18:00 (Hora CDMX).
- Si reportan fallos técnicos o problemas con pagos en Whop, oriéntalos a abrir la solicitud en el formulario contiguo.
    `.trim();

    // Historial de conversación formateado para Gemini
    const contents = (history || []).map((msg: { role: string; content: string }) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Mensaje actual del usuario
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey.trim()}`;

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
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
      console.error('Error detallado de Gemini API:', JSON.stringify(data));
      const errorMsg = data?.error?.message || "Error al conectar con Gemini API";
      return NextResponse.json({
        reply: `Aviso del sistema: ${errorMsg}`
      });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No obtuve una respuesta válida.";
    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error('Error en /api/chat:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}