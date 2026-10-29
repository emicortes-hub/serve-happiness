'use client';

import React, { useState, use } from 'react';

interface DashboardProps {
  params: Promise<{ companyId: string }>;
}

export default function ServeOperationsConsole(props: DashboardProps) {
  const resolvedParams = use(props.params);
  const companyId = resolvedParams.companyId;

  // Configuración del Tenant
  const [clientName, setClientName] = useState('Pro Sales Training');
  const [tagline, setTagline] = useState('El mejor entrenamiento en ventas de habla hispana');
  const [clientBrandColor, setClientBrandColor] = useState('#0076f5');
  const [clientLogoUrl, setClientLogoUrl] = useState('/logo-circular.png');
  const [zoomUrl, setZoomUrl] = useState('https://us02web.zoom.us/j/9272409073');
  const [telegramChatId, setTelegramChatId] = useState('-10023456789');
  const [enableEscalationAlerts, setEnableEscalationAlerts] = useState(true);
  const [programsText, setProgramsText] = useState(
    'Módulo de Prospección en Frío\nObjeciones de Alto Valor\nRoleplays en Vivo con Mentores\nSoporte de Plataforma Whop'
  );

  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'tenants'>('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('Configuración sincronizada en la red central de SERVE.');
    }, 700);
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#0B0A09', // Obsidian
        backgroundImage: 'radial-gradient(ellipse at 20% 0%, rgba(184, 154, 96, 0.08) 0%, transparent 60%)',
        color: '#E8E1DA',           // Marfil
        fontFamily: 'Inter, -apple-system, sans-serif',
        display: 'flex',
      }}
    >
      {/* Import de fuentes oficiales SERVE: Rajdhani y Manrope */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Rajdhani:wght@600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* BARRA LATERAL (SIDEBAR) */}
      <aside
        style={{
          width: '270px',
          borderRight: '1px solid rgba(184, 154, 96, 0.16)',
          backgroundColor: '#0E0D0B',
          padding: '30px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          {/* Logo SERVE */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '40px' }}>
            <svg viewBox="0 0 100 120" fill="none" style={{ width: '30px', height: '36px', flexShrink: 0 }}>
              <path d="M50 0L65 30H55V110L50 120L45 110V30H35L50 0Z" fill="url(#goldGradient)" />
              <path d="M20 40H75V55H38V70H75V100H20V85H62V70H20V40Z" fill="url(#goldGradient)" />
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D8BC83" />
                  <stop offset="100%" stopColor="#B89A60" />
                </linearGradient>
              </defs>
            </svg>
            <div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  letterSpacing: '0.24em',
                  color: '#D8BC83',
                  lineHeight: 1,
                  fontFamily: 'Rajdhani, sans-serif',
                }}
              >
                SERVE
              </div>
              <div
                style={{
                  fontSize: '7px',
                  fontWeight: 700,
                  letterSpacing: '0.22em',
                  color: '#8C857B',
                  marginTop: '5px',
                  lineHeight: 1,
                  textTransform: 'uppercase',
                }}
              >
                Servicios Empresariales de Élite
              </div>
            </div>
          </div>

          {/* Menú de navegación */}
          <div style={{ fontSize: '9px', fontWeight: 700, color: '#6A6358', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '10px', paddingLeft: '8px' }}>
            Plataforma SaaS
          </div>
          <nav style={{ display: 'grid', gap: '6px' }}>
            {[
              { id: 'overview', label: 'Resumen Operativo', icon: '📊' },
              { id: 'settings', label: 'Configuración Tenant', icon: '⚙️' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  border: 'none',
                  backgroundColor: activeTab === tab.id ? 'rgba(184, 154, 96, 0.12)' : 'transparent',
                  color: activeTab === tab.id ? '#D8BC83' : '#8C857B',
                  boxShadow: activeTab === tab.id ? 'inset 0 0 0 1px rgba(184, 154, 96, 0.35)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ fontSize: '14px' }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tenant activo */}
        <div
          style={{
            padding: '14px',
            backgroundColor: '#141310',
            border: '1px solid rgba(184, 154, 96, 0.2)',
            borderRadius: '10px',
            background: 'linear-gradient(180deg, #181612 0%, #11100D 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#B89A60', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Tenant Activo
            </span>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#68B388', boxShadow: '0 0 6px #68B388' }} />
          </div>
          <div style={{ fontSize: '12px', color: '#E8E1DA', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {clientName || 'Sin asignar'}
          </div>
          <div style={{ fontSize: '10px', color: '#6A6358', fontFamily: 'monospace', marginTop: '2px' }}>
            ID: {companyId}
          </div>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO */}
      <section style={{ flex: 1, padding: '36px 44px', overflowY: 'auto' }}>
        {/* Cabecera superior */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '36px',
            borderBottom: '1px solid rgba(184, 154, 96, 0.16)',
            paddingBottom: '22px',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '10px',
                fontWeight: 800,
                letterSpacing: '0.2em',
                color: '#B89A60',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              <span>SISTEMA</span> · <span>ESTRATEGIA</span> · <span>RESULTADOS</span>
            </div>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 800,
                margin: 0,
                color: '#E8E1DA',
                fontFamily: 'Rajdhani, sans-serif',
                letterSpacing: '0.04em',
              }}
            >
              CENTRO DE MANDO OPERATIVO
            </h1>
          </div>

          <a
            href={`/experiences/${companyId}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#0B0A09',
              background: 'linear-gradient(135deg, #D8BC83 0%, #B89A60 100%)',
              border: 'none',
              padding: '11px 20px',
              borderRadius: '6px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 16px rgba(184, 154, 96, 0.25)',
            }}
          >
            ↗ Probar Experiencia de Alumno
          </a>
        </div>

        {/* PESTAÑA: RESUMEN ANALÍTICO */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '28px' }}>
              {[
                { label: 'Tickets Gestionados', val: '128', change: '+24%', positive: true },
                { label: 'Tasa de Autoresolución', val: '74.2%', change: '+8.1%', positive: true },
                { label: 'Escalados a Mentores', val: '19', change: '-5%', positive: true },
                { label: 'Tiempo Promedio de Respuesta', val: '3m 12s', change: 'Óptimo', positive: true },
              ].map((card, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: '#161411',
                    border: '1px solid rgba(184, 154, 96, 0.2)',
                    borderRadius: '10px',
                    padding: '22px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#8C857B', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {card.label}
                  </div>
                  <div
                    style={{
                      fontSize: '32px',
                      fontWeight: 800,
                      color: '#D8BC83',
                      margin: '10px 0 6px',
                      fontFamily: 'Rajdhani, sans-serif',
                    }}
                  >
                    {card.val}
                  </div>
                  <div style={{ fontSize: '11px', color: '#68B388', fontWeight: 600 }}>{card.change}</div>
                </div>
              ))}
            </div>

            {/* Gráfica de Triage */}
            <div
              style={{
                backgroundColor: '#161411',
                border: '1px solid rgba(184, 154, 96, 0.2)',
                borderRadius: '10px',
                padding: '28px',
                marginBottom: '28px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 4px', color: '#E8E1DA' }}>
                    Rendimiento de Atención Semanal
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#8C857B' }}>
                    Distribución de consultas resueltas por el bot vs. transferidas al equipo humano.
                  </p>
                </div>
                <span style={{ fontSize: '11px', color: '#D8BC83', border: '1px solid rgba(184, 154, 96, 0.3)', padding: '4px 10px', borderRadius: '4px' }}>
                  Últimos 7 días
                </span>
              </div>

              {/* Vector Sparkline */}
              <div style={{ width: '100%', height: '120px', display: 'flex', alignItems: 'flex-end', gap: '14px', paddingTop: '20px' }}>
                {[45, 62, 58, 80, 72, 95, 88].map((h, idx) => (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '100%',
                        height: `${h}px`,
                        background: 'linear-gradient(180deg, #D8BC83 0%, rgba(184, 154, 96, 0.15) 100%)',
                        borderRadius: '4px 4px 0 0',
                        borderTop: '2px solid #D8BC83',
                      }}
                    />
                    <span style={{ fontSize: '10px', color: '#6A6358', fontFamily: 'monospace' }}>Día {idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: CONFIGURACIÓN MULTITENANT */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {/* Tarjeta 1 */}
              <div
                style={{
                  backgroundColor: '#161411',
                  border: '1px solid rgba(184, 154, 96, 0.2)',
                  borderRadius: '10px',
                  padding: '26px',
                }}
              >
                <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 18px', color: '#D8BC83', letterSpacing: '0.04em' }}>
                  1. IDENTIDAD DE LA ACADEMIA CLIENTE
                </h3>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8C857B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Nombre Comercial
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      backgroundColor: '#0E0D0B',
                      border: '1px solid rgba(184, 154, 96, 0.25)',
                      borderRadius: '6px',
                      padding: '11px 14px',
                      color: '#E8E1DA',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8C857B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Eslogan o Subtítulo
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      backgroundColor: '#0E0D0B',
                      border: '1px solid rgba(184, 154, 96, 0.25)',
                      borderRadius: '6px',
                      padding: '11px 14px',
                      color: '#E8E1DA',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8C857B', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Color de Marca
                    </label>
                    <input
                      type="color"
                      value={clientBrandColor}
                      onChange={(e) => setClientBrandColor(e.target.value)}
                      style={{
                        width: '100%',
                        height: '40px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        backgroundColor: '#0E0D0B',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8C857B', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Ruta o URL del Logotipo
                    </label>
                    <input
                      type="text"
                      value={clientLogoUrl}
                      onChange={(e) => setClientLogoUrl(e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        backgroundColor: '#0E0D0B',
                        border: '1px solid rgba(184, 154, 96, 0.25)',
                        borderRadius: '6px',
                        padding: '11px 14px',
                        color: '#E8E1DA',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8C857B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Enlace de Sala Zoom / Videollamadas
                  </label>
                  <input
                    type="url"
                    value={zoomUrl}
                    onChange={(e) => setZoomUrl(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      backgroundColor: '#0E0D0B',
                      border: '1px solid rgba(184, 154, 96, 0.25)',
                      borderRadius: '6px',
                      padding: '11px 14px',
                      color: '#E8E1DA',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Tarjeta 2 */}
              <div
                style={{
                  backgroundColor: '#161411',
                  border: '1px solid rgba(184, 154, 96, 0.2)',
                  borderRadius: '10px',
                  padding: '26px',
                }}
              >
                <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 18px', color: '#D8BC83', letterSpacing: '0.04em' }}>
                  2. ENRUTAMIENTO TELEGRAM & CATEGORÍAS
                </h3>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8C857B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Telegram Chat ID Destino
                  </label>
                  <input
                    type="text"
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      backgroundColor: '#0E0D0B',
                      border: '1px solid rgba(184, 154, 96, 0.25)',
                      borderRadius: '6px',
                      padding: '11px 14px',
                      color: '#E8E1DA',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#E8E1DA', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={enableEscalationAlerts}
                      onChange={(e) => setEnableEscalationAlerts(e.target.checked)}
                      style={{ accentColor: '#B89A60' }}
                    />
                    Emitir alerta de prioridad roja cuando el estudiante escale a un mentor
                  </label>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8C857B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Opciones de Triage para el Alumno (1 por línea)
                  </label>
                  <textarea
                    rows={4}
                    value={programsText}
                    onChange={(e) => setProgramsText(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      backgroundColor: '#0E0D0B',
                      border: '1px solid rgba(184, 154, 96, 0.25)',
                      borderRadius: '6px',
                      padding: '11px 14px',
                      color: '#E8E1DA',
                      fontSize: '13px',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={isSaving}
                style={{
                  background: 'linear-gradient(135deg, #D8BC83 0%, #B89A60 100%)',
                  color: '#0B0A09',
                  border: 'none',
                  padding: '12px 30px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  letterSpacing: '0.06em',
                  boxShadow: '0 4px 16px rgba(184, 154, 96, 0.3)',
                }}
              >
                {isSaving ? 'Guardando en SERVE...' : 'GUARDAR CONFIGURACIÓN TENANT'}
              </button>
            </div>
          </form>
        )}
      </section>

      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#161411',
            border: '1px solid #B89A60',
            color: '#E8E1DA',
            padding: '12px 22px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
            zIndex: 100,
          }}
        >
          {toastMessage}
        </div>
      )}
    </main>
  );
}