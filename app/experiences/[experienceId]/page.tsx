'use client';

import React, { useState, use } from 'react';

interface PageProps {
  params: Promise<{ experienceId: string }>;
  searchParams?: Promise<{ user_id?: string }>;
}

const PROGRAM_CATALOG = [
  'Pro Sales Training — Membresía General',
  'Entrenamiento Intensivo de Ventas',
  'Acompañamiento & Roleplays con Marcelo Gutierrez',
  'Dudas de Facturación o Acceso a Whop',
  'Otro / Consulta General',
];

export default function StudentExperiencePage(props: PageProps) {
  const resolvedParams = use(props.params);
  const experienceId = resolvedParams.experienceId;

  const [program, setProgram] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [caseId, setCaseId] = useState('');
  const [submittedName, setSubmittedName] = useState('');
  const [submittedProgram, setSubmittedProgram] = useState('');
  const [botAnswer, setBotAnswer] = useState('');
  const [status, setStatus] = useState<'initial' | 'resolved' | 'escalated'>('initial');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

    showToast('Solicitud registrada correctamente.');
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
      {/* Barra superior de anuncio */}
      <div
        style={{
          backgroundColor: '#08101e',
          borderBottom: '1px solid #16243d',
          color: '#70b8ff',
          textAlign: 'center',
          padding: '10px 16px',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        <span style={{ color: '#00a2ff', marginRight: '6px' }}>PRO SALES TRAINING</span> El mejor entrenamiento en ventas de habla hispana
      </div>

      {/* Cabecera y Navegación */}
      <header
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          height: '84px',
          padding: '0 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #101c31',
        }}
      >
        {/* Identidad visual Pro Sales Training */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0076f5 0%, #00a8ff 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 18px rgba(0, 118, 245, 0.45)',
            }}
          >
            <svg
              viewBox="0 0 24 24"
              style={{
                width: '24px',
                height: '24px',
                fill: 'none',
                stroke: '#ffffff',
                strokeWidth: 2.4,
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
              }}
            >
              <circle cx="12" cy="12" r="9" />
              <polyline points="10 14 14 10 17 13" />
              <line x1="8" y1="16" x2="16" y2="8" />
              <polyline points="12 8 16 8 16 12" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '21px', fontWeight: 900, lineHeight: 1 }}>
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
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '4px',
                fontSize: '9.5px',
                fontWeight: 800,
                letterSpacing: '0.34em',
                color: '#00a2ff',
              }}
            >
              TRAINING
            </div>
          </div>
        </div>

        {/* Acceso a Zoom */}
        <a
          href="https://us02web.zoom.us/j/9272409073?pwd=feP7nGIvZidKJBcqb6v3roewaQrQX1.1"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '9px',
            background: 'linear-gradient(135deg, #0076f5 0%, #00a8ff 100%)',
            color: '#ffffff',
            textDecoration: 'none',
            padding: '10px 18px',
            borderRadius: '12px',
            fontSize: '12.5px',
            fontWeight: 800,
            boxShadow: '0 4px 18px rgba(0, 118, 245, 0.4)',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              boxShadow: '0 0 10px #22c55e',
            }}
          />
          Sala de Zoom
        </a>
      </header>

      {/* Contenedor Principal */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '42px 28px 80px' }}>
        <section style={{ marginBottom: '38px' }}>
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
              padding: '6px 16px',
              borderRadius: '99px',
              marginBottom: '16px',
            }}
          >
            Acompañamiento Comercial Activo
          </span>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, margin: '0 0 12px', color: '#ffffff' }}>
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
          <p style={{ color: '#8b9bb4', fontSize: '15.5px', lineHeight: 1.6, margin: 0, maxWidth: '720px' }}>
            El mejor entrenamiento en ventas de habla hispana. Plantea tus dudas sobre cierres, roleplays en vivo con el equipo de Marcelo Gutierrez o reporta incidentes de acceso.
          </p>
        </section>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 0.9fr)',
            gap: '32px',
            alignItems: 'start',
          }}
        >
          {/* Columna Izquierda: Formulario Espacioso */}
          <section>
            <div
              style={{
                backgroundColor: '#0c1527',
                border: '1px solid #1c2e4d',
                borderRadius: '20px',
                padding: '40px 36px',
                boxShadow: '0 20px 45px -15px rgba(0, 0, 0, 0.75)',
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
                  borderTopLeftRadius: '20px',
                  borderTopRightRadius: '20px',
                }}
              />

              {/* Cabecera del formulario */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(0, 118, 245, 0.14)',
                    border: '1px solid rgba(0, 162, 255, 0.35)',
                    color: '#00a2ff',
                    fontWeight: 900,
                    fontSize: '15px',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  01
                </div>
                <div>
                  <h2 style={{ fontSize: '21px', fontWeight: 800, margin: '0 0 5px', color: '#ffffff' }}>
                    Abre una solicitud
                  </h2>
                  <p style={{ margin: 0, fontSize: '13.5px', color: '#8b9bb4', lineHeight: 1.4 }}>
                    Selecciona tu programa para derivar tu caso con la prioridad correcta.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Selector Programa */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '10px', color: '#e2ecf9' }}>
                    Programa o Mentoría activa
                  </label>
                  <select
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      border: '1px solid #1d3254',
                      borderRadius: '12px',
                      backgroundColor: '#070f1e',
                      padding: '15px 18px',
                      color: '#ffffff',
                      outline: 'none',
                      fontSize: '13.5px',
                      height: '52px',
                    }}
                  >
                    <option value="" disabled>Selecciona tu programa…</option>
                    {PROGRAM_CATALOG.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Campos Fila */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '10px', color: '#e2ecf9' }}>
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
                        border: '1px solid #1d3254',
                        borderRadius: '12px',
                        backgroundColor: '#070f1e',
                        padding: '15px 18px',
                        color: '#ffffff',
                        outline: 'none',
                        fontSize: '13.5px',
                        height: '52px',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '10px', color: '#e2ecf9' }}>
                      Correo registrado en Whop
                    </label>
                    <input
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        border: '1px solid #1d3254',
                        borderRadius: '12px',
                        backgroundColor: '#070f1e',
                        padding: '15px 18px',
                        color: '#ffffff',
                        outline: 'none',
                        fontSize: '13.5px',
                        height: '52px',
                      }}
                    />
                  </div>
                </div>

                {/* Textarea */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '10px', color: '#e2ecf9' }}>
                    Detalle de tu consulta o bloqueo comercial
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Ej: Tengo una objeción recurrente de presupuesto o requiero soporte con las grabaciones del entrenamiento…"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      border: '1px solid #1d3254',
                      borderRadius: '12px',
                      backgroundColor: '#070f1e',
                      padding: '16px 18px',
                      color: '#ffffff',
                      outline: 'none',
                      fontSize: '13.5px',
                      lineHeight: '1.6',
                      resize: 'vertical',
                      minHeight: '130px',
                    }}
                  />

                  {/* Sugerencias Rápidas */}
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#7285a2', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Consultas habituales de alumnos:
                    </div>
                    <div style={{ display: 'flex', gap: '9px', flexWrap: 'wrap' }}>
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
                            border: '1px solid #1f3354',
                            borderRadius: '99px',
                            padding: '7px 14px',
                            backgroundColor: '#070f1e',
                            color: '#a3b7d4',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Botón de Enviar */}
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    border: 'none',
                    background: 'linear-gradient(135deg, #0076f5 0%, #00a8ff 100%)',
                    color: '#ffffff',
                    padding: '17px 24px',
                    borderRadius: '14px',
                    fontWeight: 800,
                    fontSize: '14.5px',
                    letterSpacing: '0.02em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 8px 24px rgba(0, 118, 245, 0.4)',
                    cursor: 'pointer',
                    marginTop: '8px',
                  }}
                >
                  Enviar Solicitud
                </button>
              </form>
            </div>

            {/* Resultado Dinámico */}
            {hasSubmitted && (
              <div
                style={{
                  marginTop: '28px',
                  backgroundColor: '#091222',
                  border: '1px solid #1c2e4d',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 16px 36px -12px rgba(0, 0, 0, 0.7)',
                }}
              >
                <div
                  style={{
                    padding: '18px 24px',
                    backgroundColor: '#0d1a31',
                    borderBottom: '1px solid #1c2e4d',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 3px', color: '#fff' }}>
                      Solicitud registrada para {submittedName}
                    </h3>
                    <p style={{ margin: 0, fontSize: '12.5px', color: '#8b9bb4' }}>
                      {submittedProgram} · ID: {experienceId}
                    </p>
                  </div>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      color: '#00a2ff',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      backgroundColor: 'rgba(0, 118, 245, 0.12)',
                      border: '1px solid rgba(0, 162, 255, 0.28)',
                      padding: '6px 12px',
                      borderRadius: '8px',
                    }}
                  >
                    {caseId}
                  </span>
                </div>

                <div style={{ padding: '24px' }}>
                  <div
                    style={{
                      backgroundColor: '#0d1b33',
                      border: '1px solid #1c3257',
                      borderRadius: '10px',
                      padding: '18px',
                      fontSize: '13.5px',
                      lineHeight: 1.6,
                      marginBottom: '18px',
                      color: '#dbe7f7',
                    }}
                  >
                    <div style={{ color: '#00a2ff', fontSize: '10.5px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
                      Pro Sales Training · Respuesta
                    </div>
                    {botAnswer}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setStatus('resolved');
                        showToast('Caso marcado como resuelto.');
                      }}
                      style={{
                        backgroundColor: '#111d33',
                        border: '1px solid #1d2f4d',
                        color: status === 'resolved' ? '#34d399' : '#e2ecf9',
                        borderRadius: '10px',
                        padding: '10px 16px',
                        fontSize: '12.5px',
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
                        showToast('Ticket transferido al equipo docente.');
                      }}
                      style={{
                        backgroundColor: '#111d33',
                        border: '1px solid #1d2f4d',
                        color: status === 'escalated' ? '#fbbf24' : '#e2ecf9',
                        borderRadius: '10px',
                        padding: '10px 16px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Escalar a Mentor Humano
                    </button>
                  </div>

                  {status === 'escalated' && (
                    <div
                      style={{
                        marginTop: '18px',
                        backgroundColor: '#1a1506',
                        border: '1px solid #3d2b07',
                        borderRadius: '12px',
                        padding: '16px',
                        fontSize: '12.5px',
                        lineHeight: 1.55,
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

          {/* Columna Derecha: Tarjetas de Información Lateral */}
          <aside style={{ display: 'grid', gap: '24px' }}>
            <div
              style={{
                backgroundColor: '#0c1527',
                border: '1px solid #1c2e4d',
                borderRadius: '18px',
                padding: '28px',
                boxShadow: '0 16px 36px -12px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(0, 118, 245, 0.12)',
                  border: '1px solid rgba(0, 162, 255, 0.28)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#00a2ff',
                  marginBottom: '16px',
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ width: '20px', height: '20px' }}>
                  <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '0 0 8px', color: '#ffffff' }}>
                Atención & Roleplays
              </h3>
              <p style={{ fontSize: '13.5px', lineHeight: 1.6, color: '#8b9bb4', margin: 0 }}>
                Acompañamiento táctico para acelerar tu conversión en llamadas, destrabar objeciones complejas y dominar cierres de alto valor.
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#0c1527',
                border: '1px solid #1c2e4d',
                borderRadius: '18px',
                padding: '28px',
                boxShadow: '0 16px 36px -12px rgba(0, 0, 0, 0.5)',
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 20px', color: '#ffffff' }}>
                Ruta de tu consulta
              </h3>
              <div style={{ display: 'grid', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '14px' }}>
                  <div style={{ width: '13px', height: '13px', borderRadius: '50%', backgroundColor: '#0076f5', marginTop: '3px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '13px', display: 'block', color: '#f0f6fc', marginBottom: '2px' }}>Registro del caso</strong>
                    <small style={{ fontSize: '12px', color: '#8b9bb4' }}>Indexado con tu perfil de Whop</small>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '14px' }}>
                  <div style={{ width: '13px', height: '13px', borderRadius: '50%', backgroundColor: '#0076f5', marginTop: '3px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '13px', display: 'block', color: '#f0f6fc', marginBottom: '2px' }}>Diagnóstico táctico</strong>
                    <small style={{ fontSize: '12px', color: '#8b9bb4' }}>Guías y mejores prácticas</small>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '14px' }}>
                  <div style={{ width: '13px', height: '13px', borderRadius: '50%', backgroundColor: '#1c2e4d', marginTop: '3px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '13px', display: 'block', color: '#f0f6fc', marginBottom: '2px' }}>Intervención de Mentor</strong>
                    <small style={{ fontSize: '12px', color: '#8b9bb4' }}>Revisión en vivo vía Zoom</small>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Toast Flotante */}
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
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: '13px',
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