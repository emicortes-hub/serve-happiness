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

    // Historial limpio
    const contents = (history || []).map((msg: { role: string; content: string }) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Mensaje actual del alumno
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const payload = {
      system_instruction: {
        parts: [{ text: systemInstruction }],
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    };

    // Lista de modelos ordenados por prioridad en la capa gratuita
    const candidateModels = [
      'gemini-2.5-flash',
      'gemini-3.8-flash',
      'gemini-1.5-flash-8b',
    ];

    let lastErrorMsg = 'Servicio temporalmente ocupado.';

    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return NextResponse.json({
            reply: data.candidates[0].content.parts[0].text,
          });
        }

        lastErrorMsg = data?.error?.message || lastErrorMsg;
      } catch {
        // Continuar al siguiente modelo disponible
      }
    }

    return NextResponse.json({
      reply: `Aviso del sistema: ${lastErrorMsg}`,
    });

  } catch (error: any) {
    console.error('Error en /api/chat:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}