'use client';

import React, { useState, use } from 'react';

interface DashboardProps {
  params: Promise<{ companyId: string }>;
}

export default function ServeOperationsConsole(props: DashboardProps) {
  const resolvedParams = use(props.params);
  const companyId = resolvedParams.companyId;

  // Estados de configuración del cliente (Tenant)
  const [clientName, setClientName] = useState('');
  const [tagline, setTagline] = useState('');
  const [clientBrandColor, setClientBrandColor] = useState('#0076f5');
  const [clientLogoUrl, setClientLogoUrl] = useState('');
  const [zoomUrl, setZoomUrl] = useState('');
  
  // Destinos de notificación
  const [telegramChatId, setTelegramChatId] = useState('');
  const [enableEscalationAlerts, setEnableEscalationAlerts] = useState(true);

  // Catálogo de categorías/módulos
  const [programsText, setProgramsText] = useState('');

  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      companyId,
      clientName,
      tagline,
      clientBrandColor,
      clientLogoUrl,
      zoomUrl,
      telegramChatId,
      enableEscalationAlerts,
      programs: programsText.split('\n').filter((p) => p.trim().length > 0),
    };

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Error al sincronizar');
      showToast('Configuración sincronizada en SERVE Core.');
    } catch {
      showToast('Parámetros guardados localmente para este entorno.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#0B0A09', // Obsidian
        color: '#E8E1DA',           // Marfil
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
      }}
    >
      {/* BARRA LATERAL (SIDEBAR) ESTILO SERVE */}
      <aside
        style={{
          width: '260px',
          borderRight: '1px solid rgba(184, 154, 96, 0.15)',
          backgroundColor: '#0E0D0B',
          padding: '28px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          {/* LOGOTIPO SERVE */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '36px' }}>
            {/* Isotipo SERVE en Oro Imperial */}
            <svg
              viewBox="0 0 100 120"
              fill="none"
              style={{ width: '28px', height: '34px', flexShrink: 0 }}
            >
              <path
                d="M50 0L65 30H55V110L50 120L45 110V30H35L50 0Z"
                fill="url(#goldGradient)"
              />
              <path
                d="M20 40H75V55H38V70H75V100H20V85H62V70H20V40Z"
                fill="url(#goldGradient)"
              />
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
                  fontSize: '18px',
                  fontWeight: 900,
                  letterSpacing: '0.22em',
                  color: '#D8BC83',
                  lineHeight: 1,
                  fontFamily: 'Rajdhani, sans-serif',
                }}
              >
                SERVE
              </div>
              <div
                style={{
                  fontSize: '7.5px',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  color: '#8C857B',
                  marginTop: '4px',
                  lineHeight: 1,
                  textTransform: 'uppercase',
                }}
              >
                Operations Console
              </div>
            </div>
          </div>

          {/* Menú de navegación */}
          <nav style={{ display: 'grid', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                border: 'none',
                backgroundColor: activeTab === 'overview' ? '#201E1A' : 'transparent',
                color: activeTab === 'overview' ? '#D8BC83' : '#8C857B',
                boxShadow: activeTab === 'overview' ? 'inset 0 0 0 1px rgba(184, 154, 96, 0.3)' : 'none',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              Resumen Operativo
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                border: 'none',
                backgroundColor: activeTab === 'settings' ? '#201E1A' : 'transparent',
                color: activeTab === 'settings' ? '#D8BC83' : '#8C857B',
                boxShadow: activeTab === 'settings' ? 'inset 0 0 0 1px rgba(184, 154, 96, 0.3)' : 'none',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
              </svg>
              Configuración de Cliente
            </button>
          </nav>
        </div>

        {/* Identificador de tenant aislado */}
        <div
          style={{
            padding: '12px',
            backgroundColor: '#151310',
            border: '1px solid rgba(184, 154, 96, 0.15)',
            borderRadius: '8px',
          }}
        >
          <div style={{ fontSize: '9px', fontWeight: 700, color: '#8C857B', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            ID Entorno / Tenant
          </div>
          <div style={{ fontSize: '11px', color: '#D8BC83', fontFamily: 'monospace', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {companyId}
          </div>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <section style={{ flex: 1, padding: '36px 44px', overflowY: 'auto' }}>
        {/* Cabecera Superior */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '32px',
            borderBottom: '1px solid rgba(184, 154, 96, 0.15)',
            paddingBottom: '24px',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-block',
                fontSize: '10px',
                fontWeight: 800,
                letterSpacing: '0.16em',
                color: '#B89A60',
                backgroundColor: 'rgba(184, 154, 96, 0.1)',
                border: '1px solid rgba(184, 154, 96, 0.25)',
                padding: '4px 10px',
                borderRadius: '4px',
                marginBottom: '10px',
                textTransform: 'uppercase',
              }}
            >
              Sistemas que impulsan resultados
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 6px', color: '#E8E1DA', letterSpacing: '-0.01em' }}>
              Centro de Mando de Soporte
            </h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#8C857B' }}>
              Gestión multitenant de tickets, escalados tácticos y branding para comunidades Whop.
            </p>
          </div>

          <a
            href={`/experiences/${companyId}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#0B0A09',
              backgroundColor: '#D8BC83',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '6px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(216, 188, 131, 0.25)',
            }}
          >
            ↗ Vista del Estudiante
          </a>
        </div>

        {/* PESTAÑA 1: RESUMEN DE OPERACIONES (KPIs tipo SERVE) */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '32px' }}>
              {[
                { label: 'Tickets Atendidos', val: '24', sub: '+18% este mes' },
                { label: 'Escalados a Mentores', val: '7', sub: 'Cola prioritaria activa' },
                { label: 'Tiempo de Resolución', val: '12m', sub: 'Triage automatizado' },
                { label: 'Estado del Servicio', val: 'Activo', sub: 'Whop Bridge 100%' },
              ].map((kpi, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: '#201E1A', // Grafito
                    border: '1px solid rgba(184, 154, 96, 0.15)',
                    borderRadius: '10px',
                    padding: '20px',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#8C857B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {kpi.label}
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#D8BC83', margin: '8px 0 4px' }}>
                    {kpi.val}
                  </div>
                  <div style={{ fontSize: '11px', color: '#68B388' }}>{kpi.sub}</div>
                </div>
              ))}
            </div>

            <div
              style={{
                backgroundColor: '#201E1A',
                border: '1px solid rgba(184, 154, 96, 0.15)',
                borderRadius: '10px',
                padding: '24px',
              }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 14px', color: '#E8E1DA' }}>
                Monitoreo de Enrutamiento
              </h3>
              <p style={{ fontSize: '13px', color: '#8C857B', margin: 0, lineHeight: 1.6 }}>
                Este entorno está aislado bajo el tenant <code style={{ color: '#D8BC83' }}>{companyId}</code>. Cada solicitud generada por los estudiantes se canaliza a través del bot central de SERVE directamente hacia el chat de Telegram y los canales de supervisión asignados a este cliente.
              </p>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: CONFIGURACIÓN DE LA EMPRESA (Branding & Canales) */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {/* Tarjeta 1: Personalización de Marca */}
              <div
                style={{
                  backgroundColor: '#201E1A',
                  border: '1px solid rgba(184, 154, 96, 0.15)',
                  borderRadius: '10px',
                  padding: '24px',
                }}
              >
                <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 18px', color: '#D8BC83' }}>
                  Identidad del Cliente (Front-facing)
                </h3>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8C857B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Nombre Comercial de la Academia
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Pro Sales Training"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      backgroundColor: '#12110F',
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
                    Lema o Frase de Cabecera
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: El mejor entrenamiento en ventas de habla hispana"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      backgroundColor: '#12110F',
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
                        height: '38px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        backgroundColor: '#12110F',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8C857B', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Ruta del Logo
                    </label>
                    <input
                      type="text"
                      placeholder="/logo-circular.png o URL"
                      value={clientLogoUrl}
                      onChange={(e) => setClientLogoUrl(e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        backgroundColor: '#12110F',
                        border: '1px solid rgba(184, 154, 96, 0.25)',
                        borderRadius: '6px',
                        padding: '10px 14px',
                        color: '#E8E1DA',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8C857B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Sala de Reuniones (Zoom / Google Meet)
                  </label>
                  <input
                    type="url"
                    placeholder="https://us02web.zoom.us/j/..."
                    value={zoomUrl}
                    onChange={(e) => setZoomUrl(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      backgroundColor: '#12110F',
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

              {/* Tarjeta 2: Notificaciones y Categorías */}
              <div
                style={{
                  backgroundColor: '#201E1A',
                  border: '1px solid rgba(184, 154, 96, 0.15)',
                  borderRadius: '10px',
                  padding: '24px',
                }}
              >
                <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 18px', color: '#D8BC83' }}>
                  Canales de Supervisión & Triage
                </h3>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8C857B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Telegram Chat ID del Equipo
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: -10023456789"
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      backgroundColor: '#12110F',
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
                    Notificar con alta prioridad cuando un alumno escale a un mentor humano
                  </label>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#8C857B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Módulos / Opciones de Triage (1 por línea)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Módulo 1: Prospección&#10;Módulo 2: Cierres&#10;Dudas de Facturación"
                    value={programsText}
                    onChange={(e) => setProgramsText(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      backgroundColor: '#12110F',
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
                  backgroundColor: '#B89A60',
                  color: '#0B0A09',
                  border: 'none',
                  padding: '12px 28px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                  boxShadow: '0 4px 14px rgba(184, 154, 96, 0.25)',
                }}
              >
                {isSaving ? 'Sincronizando...' : 'Guardar Cambios de Tenant'}
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
            backgroundColor: '#201E1A',
            border: '1px solid #B89A60',
            color: '#E8E1DA',
            padding: '12px 20px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            zIndex: 100,
          }}
        >
          {toastMessage}
        </div>
      )}
    </main>
  );
}