'use client';

import React from 'react';

const SERVE_WHOP_URL = 'https://whop.com/serve-8db4';

export default function ServeLandingPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#05070d',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Grid de fondo tipo software developer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.05) 1px, transparent 0)',
          backgroundSize: '32px 32px',
          opacity: 0.6,
          pointerEvents: 'none',
        }}
      />

      {/* Aura de iluminación Esmeralda / Índigo */}
      <div
        style={{
          position: 'absolute',
          top: '-25%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '550px',
          background:
            'radial-gradient(circle, rgba(16, 185, 129, 0.14) 0%, rgba(99, 102, 241, 0.12) 40%, rgba(5, 7, 13, 0) 75%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: '760px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Badge distintivo de SERVE */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <span
            style={{
              fontSize: '11.5px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#34d399',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              padding: '6px 16px',
              borderRadius: '99px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 8px #10b981',
              }}
            />
            Customer Operations Platform
          </span>
        </div>

        {/* Título de SERVE */}
        <div style={{ margin: '0 0 20px' }}>
          <h1
            style={{
              fontSize: 'clamp(44px, 8vw, 76px)',
              fontWeight: 950,
              lineHeight: 0.95,
              margin: 0,
              letterSpacing: '-0.04em',
              background: 'linear-gradient(135deg, #ffffff 40%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            SERVE
          </h1>

          <p
            style={{
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: '#10b981',
              margin: '14px 0 0',
            }}
          >
            Intelligent Support & Experience Ops
          </p>
        </div>

        {/* Propuesta de valor */}
        <p
          style={{
            color: '#94a3b8',
            fontSize: '16.5px',
            lineHeight: 1.65,
            margin: '0 auto 36px',
            maxWidth: '580px',
          }}
        >
          Infraestructura de soporte automatizado, gestión de incidentes y agentes tácticos de IA embebidos para comunidades de alto rendimiento en Whop.
        </p>

        {/* Botones conectados a tu Whop */}
        <div
          style={{
            display: 'flex',
            gap: '14px',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <a
            href={SERVE_WHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#ffffff',
              color: '#05070d',
              fontWeight: 800,
              fontSize: '14px',
              padding: '13px 26px',
              borderRadius: '10px',
              textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(255, 255, 255, 0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.2s, background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.background = '#f1f5f9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = '#ffffff';
            }}
          >
            Explorar en Whop App Store ↗
          </a>

          <a
            href={SERVE_WHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: '#cbd5e1',
              fontWeight: 600,
              fontSize: '14px',
              padding: '13px 24px',
              borderRadius: '10px',
              textDecoration: 'none',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = '#cbd5e1';
            }}
          >
            Contacto en Whop ↗
          </a>
        </div>
      </div>
    </main>
  );
}