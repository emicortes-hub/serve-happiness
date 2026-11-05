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
        reply: 'El asistente de IA está en configuración. Por favor, utiliza el formulario de ticket para que un mentor te asista de inmediato.',
      });
    }

    // 1. Detección temporal en zona horaria Miami / Eastern
    const now = new Date();
    const miamiDayName = new Intl.DateTimeFormat('es-US', {
      timeZone: 'America/New_York',
      weekday: 'long',
    }).format(now).toLowerCase();

    // Obtener día de la semana (0 = Dom, 1 = Lun, 2 = Mar, 3 = Mié, 4 = Jue, 5 = Vie, 6 = Sáb) en Miami
    const miamiDateStr = now.toLocaleDateString('en-US', { timeZone: 'America/New_York' });
    const dayOfWeek = new Date(miamiDateStr).getDay();

    // 2. Avisos con los nuevos horarios de Marcelo
    let scheduleNotice = '';

    if (dayOfWeek === 2) { // Martes
      scheduleNotice = 'Hoy MARTES a las 10:00 AM (Hora Miami / ET) tenemos sesión en vivo de PRO SCRIPT LAB con Marcelo Gutiérrez.';
    } else if (dayOfWeek === 3) { // Miércoles
      scheduleNotice = 'Hoy MIÉRCOLES a las 9:00 PM (Hora Miami / ET) tenemos sesión en vivo de PRO HOT SEAT con Marcelo Gutiérrez.';
    } else if (dayOfWeek === 4) { // Jueves
      scheduleNotice = 'Hoy JUEVES a las 10:00 AM (Hora Miami / ET) tenemos sesión en vivo de PRO ROLE PLAY con Marcelo Gutiérrez.';
    } else if (dayOfWeek === 1) { // Lunes
      scheduleNotice = 'Mañana MARTES a las 10:00 AM (Hora Miami / ET) es la próxima sesión: PRO SCRIPT LAB.';
    } else { // Viernes, Sábado o Domingo
      scheduleNotice = 'La próxima sesión en vivo es el MARTES a las 10:00 AM (Hora Miami / ET): PRO SCRIPT LAB.';
    }

    // 3. System Prompt unificado
    const systemPrompt = `Eres el Asistente Táctico IA de Pro Sales Training (entrenamiento de Marcelo Gutiérrez).
Tu objetivo es resolver objeciones de ventas y consultas tácticas de alumnos de alto valor.

CONTEXTO TEMPORAL ACTUAL:
- Hoy es día: ${miamiDayName} (Hora Miami / ET).
- Información de sesiones: ${scheduleNotice}

CALENDARIO OFICIAL DE SESIONES EN VIVO (HORA MIAMI / ET):
1. Martes 10:00 AM (Miami / ET) - PRO SCRIPT LAB (pulido táctico de aperturas y objeciones).
2. Miércoles 9:00 PM (Miami / ET) - PRO HOT SEAT (auditoría de llamadas en vivo).
3. Jueves 10:00 AM (Miami / ET) - PRO ROLE PLAY (simulación intensiva de cierre y debate).

REGLAS DE TIEMPO ESTRICTAS:
- Todas las referencias horarias deben expresarse en Hora Miami / ET.
- NUNCA digas que mañana hay sesión a menos que hoy sea lunes (para la del martes), o martes (para la del miércoles), o miércoles (para la del jueves).
- Si hoy es viernes, sábado o domingo, la próxima sesión es hasta el MARTES.
- Si incluyes un recordatorio al final, usa exactamente la información de "Información de sesiones" calculada para hoy.

REGLAS DE FORMATO Y ESTILO:
- Responde EXCLUSIVAMENTE en español.
- NUNCA generes ni expongas notas de planificación ni esquemas en inglés ("User input:", "Diagnosis:", "Persona:", etc.).
- Tu salida debe ser directamente el mensaje final para el alumno.
- Cuando pregunten sobre una objeción de venta:
  1. Diagnóstico breve de la objeción en una sola frase.
  2. Dos o tres opciones concretas de qué responder textualmente (entre comillas).
  3. Un consejo táctico de cierre.

SOPORTE Y ACCESOS:
- Para fallos técnicos, facturación o problemas de acceso en Whop, indícales utilizar el formulario contiguo para contactar a soporte humano.`.trim();

    // 4. Historial limpio
    const contents = (history || [])
      .filter((msg: { role: string; content: string }) => !msg.content?.startsWith('Aviso del sistema:'))
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
        parts: [{ text: systemPrompt }],
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
      return NextResponse.json({ reply: 'Inconveniente temporal de conexión con el asistente.' });
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
          const cleanReply = chosenPart?.text?.trim() || '';

          if (cleanReply) {
            return NextResponse.json({ reply: cleanReply });
          }
        }
      } catch {
        // Intentar siguiente modelo
      }
    }

    return NextResponse.json({
      reply: 'No pude procesar la consulta en este instante. Por favor intenta de nuevo en unos segundos.',
    });
  } catch (error: any) {
    console.error('Error en /api/chat:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}