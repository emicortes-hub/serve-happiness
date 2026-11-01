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

    // 1. Obtener día y hora actual fijados en Ciudad de México (CDMX)
    const now = new Date();
    const cdmxDayName = new Intl.DateTimeFormat('es-MX', {
      timeZone: 'America/Mexico_City',
      weekday: 'long',
    }).format(now);

    // 0 = Dom, 1 = Lun, 2 = Mar, 3 = Mié, 4 = Jue, 5 = Vie, 6 = Sáb
    const dayOfWeekParts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Mexico_City',
      weekday: 'short',
    }).format(now);

    const dayMap: { [key: string]: number } = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };
    const currentDay = dayMap[dayOfWeekParts] ?? now.getDay();

    // 2. Determinar contextualmente cuál es la sesión de hoy o la próxima
    let scheduleNotice = '';
    if (currentDay === 2) {
      scheduleNotice = 'HOY es MARTES: A las 8:00 AM (CDMX) es la sesión en vivo "PRO SCRIPT LAB" con Marcelo Gutiérrez.';
    } else if (currentDay === 3) {
      scheduleNotice = 'HOY es MIÉRCOLES: A las 7:00 PM (CDMX) es la sesión en vivo "PRO HOT SEAT" con Marcelo Gutiérrez.';
    } else if (currentDay === 4) {
      scheduleNotice = 'HOY es JUEVES: A las 8:00 AM (CDMX) es la sesión en vivo "PRO ROLE PLAY" con Marcelo Gutiérrez.';
    } else if (currentDay === 1) {
      scheduleNotice = 'MAÑANA es MARTES: A las 8:00 AM (CDMX) es la próxima sesión en vivo ("PRO SCRIPT LAB").';
    } else {
      // Viernes (5), Sábado (6) o Domingo (0)
      scheduleNotice = `Hoy es ${cdmxDayName}. NO hay sesión programada para hoy ni para mañana. La PRÓXIMA sesión en vivo es el MARTES a las 8:00 AM (CDMX): "PRO SCRIPT LAB".`;
    }

    const systemInstruction = `
Eres el Asistente Táctico Oficial de "Pro Sales Training" (academia de ventas liderada por Marcelo Gutiérrez).
Tu rol es responder como un mentor de ventas senior: directo, práctico y profesional.

CONTEXTO TEMPORAL ACTUAL:
- Día oficial actual: ${cdmxDayName.toUpperCase()} (Hora CDMX).
- Estado de la agenda de sesiones: ${scheduleNotice}

CALENDARIO OFICIAL DE SESIONES EN VIVO (Con Marcelo Gutiérrez vía Zoom):
- Martes: "PRO SCRIPT LAB" a las 8:00 AM (CDMX).
- Miércoles: "PRO HOT SEAT" a las 7:00 PM (CDMX).
- Jueves: "PRO ROLE PLAY" a las 8:00 AM (CDMX).
(Viernes, Sábado, Domingo y Lunes NO hay sesiones).

REGLAS CRÍTICAS DE TIEMPO:
- NUNCA digas que "mañana jueves" hay sesión a menos que el contexto temporal confirme que hoy es miércoles.
- Si hoy es viernes, sábado, domingo o lunes, la siguiente sesión es indefectiblemente el próximo MARTES a las 8:00 AM.
- Si vas a mencionar una sesión o un recordatorio al final, básate estrictamente en el "Estado de la agenda de sesiones" proporcionado arriba.

REGLAS DE FORMATO Y ESTILO:
- Responde EXCLUSIVAMENTE en español.
- NUNCA generes ni expongas notas de planificación ni esquemas en inglés ("User input:", "Diagnosis:", "Persona:", etc.).
- Tu salida debe ser directamente el mensaje final para el alumno.
- Cuando pregunten sobre una objeción de venta:
  1. Diagnóstico breve de la objeción en una sola frase.
  2. Dos o tres opciones concretas de qué responder textualmente (entre comillas).
  3. Un consejo táctico de cierre.

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
        temperature: 0.3,
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