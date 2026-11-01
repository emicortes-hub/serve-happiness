'use client';

import React from 'react';
import AIChatBox from '@/components/AIChatBox';

export default function VercelLandingPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#070f1e',
        color: '#ffffff',
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
      {/* Resplandor decorativo de fondo */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '450px',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, rgba(7, 15, 30, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: '720px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Badge superior */}
        <div style={{ display: 'inline-block', marginBottom: '20px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: '#fbbf24',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              padding: '6px 16px',
              borderRadius: '99px',
            }}
          >
            Portal Oficial de Soporte & Entrenamiento
          </span>
        </div>

        {/* Título Principal */}
        <h1
          style={{
            fontSize: 'clamp(32px, 5vw, 54px)',
            fontWeight: 900,
            lineHeight: 1.15,
            margin: '0 0 18px',
          }}
        >
          Pro Sales Training ·{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Marcelo Gutiérrez
          </span>
        </h1>

        {/* Descripción */}
        <p
          style={{
            color: '#8b9bb4',
            fontSize: '16px',
            lineHeight: 1.6,
            margin: '0 auto 34px',
            maxWidth: '560px',
          }}
        >
          Bienvenido al centro de soporte comercial. Si eres alumno activo, accede a tu plataforma en Whop o utiliza la burbuja interactiva en la esquina inferior derecha para resolver objeciones en vivo con nuestro mentor de IA.
        </p>

        {/* Botón de acceso a Whop */}
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="https://whop.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#070f1e',
              fontWeight: 800,
              fontSize: '14.5px',
              padding: '13px 28px',
              borderRadius: '10px',
              textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(245, 158, 11, 0.25)',
              transition: 'transform 0.2s ease',
            }}
          >
            Acceder a la Comunidad en Whop ↗
          </a>
        </div>
      </div>

      {/* Asistente táctico IA en la esquina */}
      <AIChatBox />
    </main>
  );
}