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
Tu objetivo es resolver dudas de alumnos sobre manejo de objeciones comerciales y la dinámica del programa.
Reglas:
- Sé directo, práctico y profesional con tono de mentor de ventas.
- Explica de forma concisa cómo abordar objeciones como "no tengo presupuesto", "tengo que consultarlo" o "es caro".
- Recuerda que las sesiones de roleplay en vivo son los martes y jueves a las 18:00 (Hora CDMX).
- Si reportan fallos técnicos o problemas con pagos en Whop, oriéntalos a abrir la solicitud en el formulario contiguo.
    `.trim();

    const contents = (history || []).map((msg: { role: string; content: string }) => ({
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
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    };

    // 1. Obtener la lista real de modelos disponibles para tu API Key
    const listRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const listData = await listRes.json();

    if (!listRes.ok) {
      const errorMsg = listData?.error?.message || "No se pudo consultar la lista de modelos de Gemini.";
      return NextResponse.json({ reply: `Aviso del sistema: ${errorMsg}` });
    }

    // 2. Filtrar solo los modelos que soportan generateContent
    const availableModels: string[] = (listData.models || [])
      .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m: any) => m.name.replace(/^models\//, ''));

    if (availableModels.length === 0) {
      return NextResponse.json({
        reply: "Aviso del sistema: No hay modelos con generateContent habilitados en esta cuenta."
      });
    }

    // 3. Probar en orden los modelos compatibles encontrados
    let lastError = 'No se pudo generar respuesta.';

    for (const model of availableModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
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

        lastError = data?.error?.message || lastError;
      } catch (err: any) {
        lastError = err.message;
      }
    }

    return NextResponse.json({
      reply: `Aviso del sistema: ${lastError} (Modelos detectados: ${availableModels.join(', ')})`,
    });

  } catch (error: any) {
    console.error('Error en /api/chat:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}