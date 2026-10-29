import React from 'react';

interface PageProps {
  params: Promise<{ experienceId: string }>;
  searchParams?: Promise<{ user_id?: string }>;
}

export default async function StudentExperiencePage(props: PageProps) {
  const params = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const experienceId = params.experienceId;

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#020617',
        color: '#f8fafc',
        padding: '2.5rem 1.5rem',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div style={{ maxWidth: '896px', margin: '0 auto' }}>
        <header style={{ marginBottom: '2rem' }}>
          <span
            style={{
              display: 'inline-block',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#60a5fa',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              border: '1px solid rgba(59, 130, 246, 0.2)',
            }}
          >
            Pro Sales Training Hub
          </span>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginTop: '0.75rem', color: '#ffffff' }}>
            Mi espacio de ventas y soporte
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '0.25rem', fontSize: '0.95rem' }}>
            Tu centro de acompañamiento directo con el equipo y recursos.
          </p>
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {/* Tarjeta Solicitudes */}
          <div
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              padding: '1.5rem',
              borderRadius: '1rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: '#ffffff' }}>
              Mis Solicitudes
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1.25rem', lineHeight: '1.4' }}>
              Revisa el estado de tus dudas y soporte técnico con los asesores.
            </p>
            <button
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: 500,
                padding: '0.5rem 1rem',
                borderRadius: '0.75rem',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Nueva Solicitud
            </button>
          </div>

          {/* Tarjeta Zoom */}
          <div
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              padding: '1.5rem',
              borderRadius: '1rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: '#ffffff' }}>
              Sesiones en Vivo
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1.25rem', lineHeight: '1.4' }}>
              Consulta los horarios de mentoría y accesos directos a Zoom.
            </p>
            <a
              href="https://us02web.zoom.us/j/9272409073?pwd=feP7nGIvZidKJBcqb6v3roewaQrQX1.1"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: 500,
                padding: '0.5rem 1rem',
                borderRadius: '0.75rem',
                textDecoration: 'none',
              }}
            >
              Unirme a la Sala
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
