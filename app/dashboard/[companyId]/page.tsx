'use client';

import React, { useState, use } from 'react';

interface PageProps {
  params: Promise<{ companyId?: string; experienceId?: string }>;
}

const PROGRAM_CATALOG = [
  'Pro Sales Training — Membresía General',
  'Entrenamiento Intensivo de Ventas',
  'Acompañamiento & Roleplays con Marcelo Gutierrez',
  'Dudas de Facturación o Acceso a Whop',
  'Otro / Consulta General',
];

const FAQ_ITEMS = [
  {
    q: '¿Dónde encuentro las grabaciones de las sesiones?',
    a: 'Todas las llamadas y entrenamientos semanales se suben en la sección "Módulos y Grabaciones" dentro de Whop en un plazo máximo de 24 horas tras finalizar la sesión.',
  },
  {
    q: '¿Cómo descargo los guiones y plantillas de prospección?',
    a: 'Encuentras las hojas de cálculo, scripts de llamadas y plantillas de mensajes fijadas en la pestaña "Recursos" o en la descripción de cada módulo del programa.',
  },
  {
    q: '¿Qué días y horas son los roleplays en vivo?',
    a: 'Las dinámicas grupales de roleplay se llevan a cabo de lunes a jueves en la sala Zoom oficial. Consulta el horario fijado arriba y el calendario en Whop.',
  },
  {
    q: '¿Tengo problemas para acceder a un módulo específico?',
    a: 'Selecciona "Dudas de Facturación o Acceso a Whop" en el formulario, indícanos tu correo de compra y el equipo docente te habilitará el acceso.',
  },
];

export default function ProSalesTrainingExperience(props: PageProps) {
  const resolvedParams = use(props.params);
  const currentId = resolvedParams.companyId || resolvedParams.experienceId || 'PST-ACADEMY';

  const [program, setProgram] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [message, setMessage] = useState('');

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [caseId, setCaseId] = useState('');
  const [submittedName, setSubmittedName] = useState('');
  const [submittedProgram, setSubmittedProgram] = useState('');
  const [botAnswer, setBotAnswer] = useState('');
  const [status, setStatus] = useState<'initial' | 'resolved' | 'escalated'>('initial');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const getBotOrientation = (text: string) => {
    const s = text.toLowerCase();
    if (/pitch|script|guion|guión|mensaje|prospeccion|prospección/.test(s)) {
      return 'Regla clave de Pro Sales: no intentes vender el servicio en el primer contacto, vende únicamente la llamada de diagnóstico de 15 minutos. Si buscas feedback táctico sobre tu redacción exacta, escala este ticket a un mentor del equipo de Marcelo Gutierrez.';
    }
    if (/socio|pensar|revisar|objecion|objeción|precio|caro/.test(s)) {
      return 'Si el prospecto menciona "lo tengo que pensar con mi socio", valida la objeción: "¿Si dependiera solo de ti, avanzarías hoy?". Aísla la causa real antes de cerrar la llamada y consulta el módulo de aislamiento de objeciones.';
    }
    if (/horario|calendario|sesion|sesión|roleplay|zoom|directo|vivo/.test(s)) {
      return 'Nuestras sesiones y roleplays en directo se realizan mediante la sala oficial de Zoom (puedes ingresar directamente desde el botón superior). El calendario semanal detallado está en los anuncios fijados dentro de Whop.';
    }
    if (/grabacion|grabaciones|acceso|drive|modulo|módulo/.test(s)) {
      return 'Las grabaciones se indexan en tu sección de cursos en Whop dentro de las 24 horas siguientes a la llamada en vivo. Si tu suscripción no muestra los módulos actualizados, escala el ticket para sincronizar tu acceso.';
    }
    return 'Hemos registrado tu consulta comercial. Te sugerimos revisar las plantillas del repositorio de Pro Sales Training; si requieres apoyo de un mentor para una llamada próxima, pulsa "Escalar a Mentor Humano".';
  };

  const notifyTelegram = async (payloadType: 'ticket' | 'escalation' | 'resolved', currentCode: string) => {
    try {
      const res = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: currentCode,
          name: name.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim(),
          program,
          message: message.trim(),
          type: payloadType,
        }),
      });
      await res.json();
    } catch (e) {
      console.error('Error al notificar a Telegram', e);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !program || !message.trim()) return;

    const code = 'PST-' + Math.random().toString(36).slice(2, 7).toUpperCase();
    setCaseId(code);
    setSubmittedName(name.trim().split(/\s+/)[0]);
    setSubmittedProgram(program);
    setBotAnswer(getBotOrientation(message));
    setStatus('initial');
    setHasSubmitted(true);

    notifyTelegram('ticket', code);
    showToast('Solicitud enviada al equipo docente.');
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#060b14',
        color: '#f0f6fc',
        fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          backgroundColor: '#08101e',
          borderBottom: '1px solid #16243d',
          color: '#70b8ff',
          textAlign: 'center',
          padding: '8px 16px',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        <span style={{ color: '#00a2ff', marginRight: '6px' }}>PRO SALES TRAINING</span> El mejor entrenamiento en ventas de habla hispana
      </div>

      <header
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          height: '80px',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #101c31',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src="/logo-circular.png"
            alt="Pro Sales Training"
            style={{ width: '46px', height: '46px', objectFit: 'contain', display: 'block' }}
          />
          <div>
            <div style={{ fontSize: '20px', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.02em' }}>
              <span
                style={{
                  background: 'linear-gradient(135deg, #0076f5 0%, #00b4ff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                PRO
              </span>{' '}
              <span style={{ color: '#ffffff' }}>SALES</span>
            </div>
            <div
              style={{
                marginTop: '4px',
                fontSize: '9px',
                fontWeight: 800,
                letterSpacing: '0.34em',
                color: '#00a2ff',
                lineHeight: 1,
              }}
            >
              TRAINING
            </div>
          </div>
        </div>

        <a
          href="https://us02web.zoom.us/j/9272409073?pwd=feP7nGIvZidKJBcqb6v3roewaQrQX1.1"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #0076f5 0%, #00a8ff 100%)',
            color: '#ffffff',
            textDecoration: 'none',
            padding: '9px 16px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 800,
            boxShadow: '0 4px 16px rgba(0, 118, 245, 0.35)',
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              boxShadow: '0 0 8px #22c55e',
            }}
          />
          Sala de Zoom
        </a>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '38px 24px 72px' }}>
        {/* HORARIO DE ZOOM VISIBLE */}
        <div
          style={{
            backgroundColor: '#0a1426',
            border: '1px solid #1a2f52',
            borderRadius: '12px',
            padding: '14px 20px',
            marginBottom: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>⏰</span>
            <div>
              <strong style={{ fontSize: '12px', color: '#ffffff', display: 'block' }}>
                Horarios oficiales de Sala Zoom y Roleplays en vivo
              </strong>
              <span style={{ fontSize: '11px', color: '#8b9bb4' }}>
                Lunes a Jueves · 11:00 AM y 6:00 PM (Hora CDMX / GMT-6)
              </span>
            </div>
          </div>
          <a
            href="https://us02web.zoom.us/j/9272409073?pwd=feP7nGIvZidKJBcqb6v3roewaQrQX1.1"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#00a2ff',
              textDecoration: 'none',
              padding: '6px 12px',
              backgroundColor: 'rgba(0, 118, 245, 0.12)',
              border: '1px solid rgba(0, 162, 255, 0.3)',
              borderRadius: '8px',
            }}
          >
            Entrar ahora ↗
          </a>
        </div>

        <section style={{ marginBottom: '34px' }}>
          <span
            style={{
              display: 'inline-block',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: '#00a2ff',
              backgroundColor: 'rgba(0, 118, 245, 0.12)',
              border: '1px solid rgba(0, 162, 255, 0.28)',
              padding: '5px 14px',
              borderRadius: '99px',
              marginBottom: '14px',
            }}
          >
            Acompañamiento Comercial Activo
          </span>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, margin: '0 0 10px', color: '#ffffff' }}>
            Soporte Operativo ·{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #0076f5 0%, #00a8ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Pro Sales Training
            </span>
          </h1>
          <p style={{ color: '#8b9bb4', fontSize: '15px', lineHeight: 1.6, margin: 0, maxWidth: '720px' }}>
            El mejor entrenamiento en ventas de habla hispana. Plantea tus dudas sobre cierres, roleplays en vivo con el equipo de Marcelo Gutierrez o reporta incidentes de acceso.
          </p>
        </section>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          {/* COLUMNA FORMULARIO */}
          <section>
            <div
              style={{
                backgroundColor: '#0f192d',
                border: '1px solid #1a2a47',
                borderRadius: '14px',
                padding: '30px',
                boxShadow: '0 16px 36px -12px rgba(0, 0, 0, 0.7)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'linear-gradient(135deg, #0076f5 0%, #00a8ff 100%)',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(0, 118, 245, 0.12)',
                    border: '1px solid rgba(0, 162, 255, 0.28)',
                    color: '#00a2ff',
                    fontWeight: 900,
                    fontSize: '14px',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  01
                </div>
                <div>
                  <h2 style={{ fontSize: '19px', fontWeight: 800, margin: '0 0 4px', color: '#ffffff' }}>
                    Abre una solicitud
                  </h2>
                  <p style={{ margin: 0, fontSize: '13px', color: '#8b9bb4' }}>
                    Selecciona tu programa para derivar tu caso con la prioridad correcta.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: '#d1dced' }}>
                    Programa o Mentoría activa
                  </label>
                  <select
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      border: '1px solid #1a2a47',
                      borderRadius: '11px',
                      backgroundColor: '#081120',
                      padding: '13px 15px',
                      color: '#ffffff',
                      outline: 'none',
                      fontSize: '13px',
                    }}
                  >
                    <option value="" disabled>Selecciona tu programa…</option>
                    {PROGRAM_CATALOG.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    columnGap: '14px',
                    rowGap: '16px',
                    marginBottom: '18px',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: '#d1dced' }}>
                      Nombre y Apellido
                    </label>
                    <input
                      type="text"
                      placeholder="Tu nombre completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        border: '1px solid #1a2a47',
                        borderRadius: '11px',
                        backgroundColor: '#081120',
                        padding: '13px 15px',
                        color: '#ffffff',
                        outline: 'none',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: '#d1dced' }}>
                      Correo en Whop
                    </label>
                    <input
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        border: '1px solid #1a2a47',
                        borderRadius: '11px',
                        backgroundColor: '#081120',
                        padding: '13px 15px',
                        color: '#ffffff',
                        outline: 'none',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: '#d1dced' }}>
                      WhatsApp (con código país)
                    </label>
                    <input
                      type="tel"
                      placeholder="+52 55 1234 5678"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        border: '1px solid #1a2a47',
                        borderRadius: '11px',
                        backgroundColor: '#081120',
                        padding: '13px 15px',
                        color: '#ffffff',
                        outline: 'none',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: '#d1dced' }}>
                    Detalle de tu consulta o bloqueo comercial
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Ej: Tengo una objeción recurrente de presupuesto o requiero soporte con las grabaciones del entrenamiento…"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      border: '1px solid #1a2a47',
                      borderRadius: '11px',
                      backgroundColor: '#081120',
                      padding: '13px 15px',
                      color: '#ffffff',
                      outline: 'none',
                      fontSize: '13px',
                      resize: 'vertical',
                    }}
                  />

                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#72849e', margin: '10px 0 8px', textTransform: 'uppercase' }}>
                    Consultas habituales de alumnos:
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[
                      { label: 'Feedback de Pitch', val: 'Revisión y feedback para mi pitch de prospección en frío' },
                      { label: 'Horario de Roleplay', val: '¿Cuál es el calendario de las próximas sesiones de roleplay en vivo?' },
                      { label: 'Acceso a Grabaciones', val: 'Problema de visualización en las grabaciones de Whop' },
                      { label: 'Objeción de Socio', val: 'El prospecto me dice que lo tiene que pensar con su socio, ¿cómo lo destrabo?' },
                    ].map((btn) => (
                      <button
                        type="button"
                        key={btn.label}
                        onClick={() => setMessage(btn.val)}
                        style={{
                          border: '1px solid #1a2944',
                          borderRadius: '99px',
                          padding: '5px 11px',
                          backgroundColor: '#081120',
                          color: '#9cb0cc',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    border: 'none',
                    background: 'linear-gradient(135deg, #0076f5 0%, #00a8ff 100%)',
                    color: '#ffffff',
                    padding: '15px 20px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '13px',
                    letterSpacing: '0.02em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 6px 18px rgba(0, 118, 245, 0.35)',
                    cursor: 'pointer',
                  }}
                >
                  Enviar Solicitud
                </button>
              </form>
            </div>

            {hasSubmitted && (
              <div
                style={{
                  marginTop: '24px',
                  backgroundColor: '#091222',
                  border: '1px solid #1a2a47',
                  borderRadius: '14px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '16px 20px',
                    backgroundColor: '#0d1a31',
                    borderBottom: '1px solid #1a2a47',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 2px', color: '#fff' }}>
                      Solicitud registrada para {submittedName}
                    </h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#8b9bb4' }}>
                      {submittedProgram} · ID: {currentId}
                    </p>
                  </div>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      color: '#00a2ff',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: 'rgba(0, 118, 245, 0.12)',
                      border: '1px solid rgba(0, 162, 255, 0.28)',
                      padding: '5px 10px',
                      borderRadius: '8px',
                    }}
                  >
                    {caseId}
                  </span>
                </div>

                <div style={{ padding: '20px' }}>
                  <div
                    style={{
                      backgroundColor: '#0d1b33',
                      border: '1px solid #1c3257',
                      borderRadius: '8px',
                      padding: '15px',
                      fontSize: '13px',
                      lineHeight: 1.6,
                      marginBottom: '16px',
                      color: '#dbe7f7',
                    }}
                  >
                    <div style={{ color: '#00a2ff', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
                      Pro Sales Training · Respuesta
                    </div>
                    {botAnswer}
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setStatus('resolved');
                        notifyTelegram('resolved', caseId);
                        showToast('Caso marcado como resuelto.');
                      }}
                      style={{
                        backgroundColor: '#111d33',
                        border: '1px solid #1d2f4d',
                        color: status === 'resolved' ? '#34d399' : '#e2ecf9',
                        borderRadius: '9px',
                        padding: '9px 14px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      ✓ Duda Aclarada
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStatus('escalated');
                        notifyTelegram('escalation', caseId);
                        showToast('Ticket transferido al equipo docente.');
                      }}
                      style={{
                        backgroundColor: '#111d33',
                        border: '1px solid #1d2f4d',
                        color: status === 'escalated' ? '#fbbf24' : '#e2ecf9',
                        borderRadius: '9px',
                        padding: '9px 14px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Escalar a Mentor Humano
                    </button>
                  </div>

                  {status === 'resolved' && (
                    <div
                      style={{
                        marginTop: '16px',
                        backgroundColor: '#071d15',
                        border: '1px solid #144934',
                        borderRadius: '10px',
                        padding: '14px',
                        fontSize: '12px',
                        lineHeight: 1.5,
                        color: '#6ee7b7',
                      }}
                    >
                      <strong style={{ color: '#34d399', display: 'block', marginBottom: '4px' }}>
                        ¡Consulta aclarada con éxito!
                      </strong>
                      Has confirmado que la orientación resolvió tu duda. El registro ha sido actualizado para el equipo docente.
                    </div>
                  )}

                  {status === 'escalated' && (
                    <div
                      style={{
                        marginTop: '16px',
                        backgroundColor: '#1a1506',
                        border: '1px solid #3d2b07',
                        borderRadius: '10px',
                        padding: '14px',
                        fontSize: '12px',
                        lineHeight: 1.5,
                        color: '#e2c56a',
                      }}
                    >
                      <strong style={{ color: '#fbbf24', display: 'block', marginBottom: '4px' }}>
                        Ticket transferido al equipo docente de Pro Sales Training
                      </strong>
                      Tu consulta ha entrado a la cola de atención comercial prioritaria. La revisaremos directamente con Marcelo Gutierrez o en la siguiente sesión de práctica en Zoom.
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* COLUMNA LATERAL + FAQ */}
          <aside style={{ display: 'grid', gap: '20px' }}>
            <div
              style={{
                backgroundColor: '#0f192d',
                border: '1px solid #1a2a47',
                borderRadius: '14px',
                padding: '24px',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(0, 118, 245, 0.12)',
                  border: '1px solid rgba(0, 162, 255, 0.28)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#00a2ff',
                  marginBottom: '14px',
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ width: '18px', height: '18px' }}>
                  <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 6px', color: '#ffffff' }}>
                Atención & Roleplays
              </h3>
              <p style={{ fontSize: '13px', lineHeight: 1.55, color: '#8b9bb4', margin: 0 }}>
                Acompañamiento táctico para acelerar tu conversión en llamadas, destrabar objeciones complejas y dominar cierres de alto valor.
              </p>
            </div>

            {/* SECCIÓN PREGUNTAS FRECUENTES (FAQ) */}
            <div
              style={{
                backgroundColor: '#0f192d',
                border: '1px solid #1a2a47',
                borderRadius: '14px',
                padding: '24px',
              }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 14px', color: '#ffffff' }}>
                Preguntas Frecuentes
              </h3>

              <div style={{ display: 'grid', gap: '8px' }}>
                {FAQ_ITEMS.map((item, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div
                      key={index}
                      style={{
                        backgroundColor: '#081120',
                        border: '1px solid #16243d',
                        borderRadius: '9px',
                        overflow: 'hidden',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => toggleFaq(index)}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#e2ecf9',
                          fontSize: '12px',
                          fontWeight: 700,
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        <span>{item.q}</span>
                        <span style={{ fontSize: '14px', color: '#00a2ff', fontWeight: 800, marginLeft: '8px' }}>
                          {isOpen ? '−' : '+'}
                        </span>
                      </button>

                      {isOpen && (
                        <div
                          style={{
                            padding: '0 14px 12px 14px',
                            fontSize: '12px',
                            color: '#8b9bb4',
                            lineHeight: 1.55,
                            borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                            paddingTop: '8px',
                          }}
                        >
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#14223b',
            border: '1px solid #20355a',
            color: '#ffffff',
            padding: '10px 20px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 700,
            boxShadow: '0 12px 30px -10px rgba(0,0,0,0.6)',
            zIndex: 100,
          }}
        >
          {toastMessage}
        </div>
      )}
    </main>
  );
}