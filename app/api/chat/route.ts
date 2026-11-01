import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({
        reply: "El asistente de IA está en configuración. Por favor, utiliza el formulario de ticket para que un mentor te asista de inmediato."
      });
    }

    const systemInstruction = `
Eres el Asistente Táctico Oficial de "Pro Sales Training" (academia de ventas liderada por Marcelo Gutiérrez).
Tu rol es responder como un mentor de ventas senior: directo, práctico, profesional y empático con el cerrador.

REGLAS OBLIGATORIAS:
- RESPONDE SIEMPRE EN ESPAÑOL. Está estrictamente prohibido responder en inglés.
- NO muestres razonamiento interno, procesos de pensamiento, metas ni metadatos ("Goal:", "Persona:", "Step 1:").
- Ve directo al grano: 1 breve diagnóstico de la objeción, seguido de 2 o 3 opciones prácticas de qué decir exactamente entre comillas, y cierra con 1 tip clave.
- Respuestas breves, directas y con saltos de línea claros.
- Si preguntan por las sesiones en vivo: son martes y jueves a las 18:00 (Hora CDMX).
- Si reportan fallos técnicos o pagos en Whop: indícales usar el formulario de soporte de la izquierda.
    `.trim();

    // Historial limpio
    const contents = (history || [])
      .filter((msg: { role: string; content: string }) => !msg.content.startsWith('Aviso del sistema:'))
      .map((msg: { role: string; content: string }) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

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
        temperature: 0.5,
        maxOutputTokens: 600,
      },
    };

    // Consultamos los modelos disponibles para la key
    const listRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const listData = await listRes.json();

    if (!listRes.ok) {
      return NextResponse.json({ reply: "Inconveniente temporal de conexión con el asistente." });
    }

    const availableModels: string[] = (listData.models || [])
      .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m: any) => m.name.replace(/^models\//, ''));

    for (const model of availableModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (res.ok && data.candidates?.[0]?.content?.parts) {
          // Extraer únicamente la parte de texto final del modelo
          const parts = data.candidates[0].content.parts;
          const textPart = parts.find((p: any) => p.text && !p.thought) || parts[parts.length - 1];
          const replyText = textPart?.text?.trim();

          if (replyText) {
            return NextResponse.json({ reply: replyText });
          }
        }
      } catch {
        // Intentar siguiente modelo si falla
      }
    }

    return NextResponse.json({
      reply: "No pude procesar la consulta en este instante. Por favor intenta de nuevo en unos segundos."
    });

  } catch (error: any) {
    console.error('Error en /api/chat:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}