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
Tu rol es responder como un mentor de ventas senior: directo, práctico y profesional.

REGLAS CRÍTICAS:
- Responde EXCLUSIVAMENTE en español.
- NUNCA generes ni expongas notas de planificación ni esquemas en inglés ("User input:", "Diagnosis:", "Persona:", etc.).
- Tu salida debe ser directamente el mensaje final para el alumno.
- Cuando pregunten sobre una objeción de venta:
  1. Diagnóstico breve de la objeción en una sola frase.
  2. Dos o tres opciones concretas de qué responder textualmente (entre comillas).
  3. Un consejo táctico de cierre.

CALENDARIO OFICIAL DE SESIONES EN VIVO (Con Marcelo Gutiérrez):
Todas las sesiones son vía Zoom (Online):
- Martes: "PRO SCRIPT LAB" a las 8:00 AM.
- Miércoles: "PRO HOT SEAT" a las 7:00 PM.
- Jueves: "PRO ROLE PLAY" a las 8:00 AM.
(Si preguntan por el enlace de acceso, recuérdales que los links de Zoom están disponibles en el calendario de la comunidad de Whop / canal de anuncios).

SOPORTE Y ACCESOS:
- Para fallos técnicos, facturación o problemas de acceso en Whop, indícales utilizar el formulario contiguo para contactar a soporte humano.
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
        temperature: 0.4,
        maxOutputTokens: 800,
        thinkingConfig: {
          thinkingBudget: 0,
        },
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

    const sortedModels = availableModels.sort((a, b) => {
      const isFlashA = a.includes('flash') && !a.includes('thinking');
      const isFlashB = b.includes('flash') && !b.includes('thinking');
      if (isFlashA && !isFlashB) return -1;
      if (!isFlashA && isFlashB) return 1;
      return 0;
    });

    for (const model of sortedModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (res.ok && data.candidates?.[0]?.content?.parts) {
          const parts = data.candidates[0].content.parts;
          const nonThoughtParts = parts.filter((p: any) => !p.thought && p.text);
          const chosenPart = nonThoughtParts.length > 0 ? nonThoughtParts[nonThoughtParts.length - 1] : parts[parts.length - 1];
          let cleanReply = chosenPart?.text?.trim() || "";

          if (cleanReply) {
            return NextResponse.json({ reply: cleanReply });
          }
        }
      } catch {
        // Intentar siguiente modelo
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