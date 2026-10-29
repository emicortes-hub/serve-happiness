'use client';

import React, { useState, useEffect, use } from 'react';

interface DashboardProps {
  params: Promise<{ companyId: string }>;
}

export default function ServeOperationsConsole(props: DashboardProps) {
  const resolvedParams = use(props.params);
  const companyId = resolvedParams.companyId;

  // Estados de configuración del Tenant
  const [clientName, setClientName] = useState('');
  const [tagline, setTagline] = useState('');
  const [clientBrandColor, setClientBrandColor] = useState('#B89A60');
  const [clientLogoUrl, setClientLogoUrl] = useState('');
  const [zoomUrl, setZoomUrl] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [enableEscalationAlerts, setEnableEscalationAlerts] = useState(true);
  const [programsText, setProgramsText] = useState('');

  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Cargar configuración existente desde Supabase
  useEffect(() => {
    async function fetchTenantSettings() {
      try {
        const res = await fetch(`/api/settings?companyId=${companyId}`);
        const data = await res.json();
        if (data) {
          setClientName(data.client_name || '');
          setTagline(data.tagline || '');
          setClientBrandColor(data.brand_color || '#B89A60');
          setClientLogoUrl(data.logo_url || '');
          setZoomUrl(data.zoom_url || '');
          setTelegramChatId(data.telegram_chat_id || '');
          setEnableEscalationAlerts(data.enable_escalation ?? true);
          if (Array.isArray(data.programs)) {
            setProgramsText(data.programs.join('\n'));
          }
        }
      } catch (err) {
        console.error('Error al obtener tenant:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTenantSettings();
  }, [companyId]);

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
      showToast('Error al conectar con la base de datos.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#0B0A09',
        backgroundImage: 'radial-gradient(ellipse at 20% 0%, rgba(184, 154, 96, 0.08) 0%, transparent 60%)',
        color: '#E8E1DA',
        fontFamily: 'Inter, -apple-system, sans-serif',
        display: 'flex',
      }}
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Rajdhani:wght@600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* BARRA LATERAL */}
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

        <div
          style={{
            padding: '14px',
            backgroundColor: '#141310',
            border: '1px solid rgba(184, 154, 96, 0.2)',
            borderRadius: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#B89A60', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Tenant Activo
            </span>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#68B388', boxShadow: '0 0 6px #68B388' }} />
          </div>
          <div style={{ fontSize: '12px', color: '#E8E1DA', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {isLoading ? 'Cargando...' : clientName || 'Sin asignar'}
          </div>
          <div style={{ fontSize: '10px', color: '#6A6358', fontFamily: 'monospace', marginTop: '2px' }}>
            ID: {companyId}
          </div>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO */}
      <section style={{ flex: 1, padding: '36px 44px', overflowY: 'auto' }}>
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

        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '28px' }}>
              {[
                { label: 'Tickets Gestionados', val: '128', change: '+24%' },
                { label: 'Tasa de Autoresolución', val: '74.2%', change: '+8.1%' },
                { label: 'Escalados a Mentores', val: '19', change: '-5%' },
                { label: 'Tiempo Promedio', val: '3m 12s', change: 'Óptimo' },
              ].map((card, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: '#161411',
                    border: '1px solid rgba(184, 154, 96, 0.2)',
                    borderRadius: '10px',
                    padding: '22px',
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

            <div
              style={{
                backgroundColor: '#161411',
                border: '1px solid rgba(184, 154, 96, 0.2)',
                borderRadius: '10px',
                padding: '28px',
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 4px', color: '#E8E1DA' }}>
                Monitoreo Multitenant
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#8C857B', lineHeight: 1.6 }}>
                Base de datos activa con Supabase. Las configuraciones registradas en la pestaña «Configuración Tenant» se aplicarán inmediatamente a los alumnos que ingresen con el ID <code style={{ color: '#D8BC83' }}>{companyId}</code>.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              <div
                style={{
                  backgroundColor: '#161411',
                  border: '1px solid rgba(184, 154, 96, 0.2)',
                  borderRadius: '10px',
                  padding: '26px',
                }}
              >
                <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 18px', color: '#D8BC83' }}>
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
                    placeholder="Ej: Pro Sales Training"
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

              <div
                style={{
                  backgroundColor: '#161411',
                  border: '1px solid rgba(184, 154, 96, 0.2)',
                  borderRadius: '10px',
                  padding: '26px',
                }}
              >
                <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 18px', color: '#D8BC83' }}>
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
                    Emitir alerta con alta prioridad cuando el estudiante escale a un mentor
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