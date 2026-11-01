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
      {/* Resplandor decorativo de fondo en azul eléctrico */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '750px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(0, 118, 245, 0.22) 0%, rgba(7, 15, 30, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: '780px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Badge superior */}
        <div style={{ display: 'inline-block', marginBottom: '24px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: '#00a8ff',
              backgroundColor: 'rgba(0, 118, 245, 0.12)',
              border: '1px solid rgba(0, 168, 255, 0.35)',
              padding: '6px 18px',
              borderRadius: '99px',
            }}
          >
            Portal Oficial de Soporte & Entrenamiento
          </span>
        </div>

        {/* Título Principal estructurado verticalmente */}
        <div style={{ margin: '0 0 24px' }}>
          <h1
            style={{
              fontSize: 'clamp(32px, 5vw, 54px)',
              fontWeight: 900,
              lineHeight: 1.1,
              margin: 0,
              color: '#ffffff',
              letterSpacing: '-0.02em',
            }}
          >
            Pro Sales Training
          </h1>

          {/* Punto central */}
          <div
            style={{
              fontSize: '28px',
              color: '#0084ff',
              lineHeight: 1,
              margin: '8px 0',
              fontWeight: 900,
            }}
          >
            ·
          </div>

          <h2
            style={{
              fontSize: 'clamp(28px, 4.5vw, 48px)',
              fontWeight: 900,
              lineHeight: 1.1,
              margin: 0,
              background: 'linear-gradient(135deg, #0076f5 0%, #00c3ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}
          >
            Marcelo Gutiérrez
          </h2>
        </div>

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

        {/* Botón de acceso con estilo Azul Eléctrico */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <a
            href="https://whop.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'linear-gradient(135deg, #0076f5 0%, #0099ff 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '14.5px',
              padding: '14px 30px',
              borderRadius: '10px',
              textDecoration: 'none',
              boxShadow: '0 10px 28px rgba(0, 118, 245, 0.38)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 14px 32px rgba(0, 118, 245, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 28px rgba(0, 118, 245, 0.38)';
            }}
          >
            Acceder a la Comunidad en Whop ↗
          </a>
        </div>
      </div>

      {/* Burbuja flotante de la IA */}
      <AIChatBox />
    </main>
  );
}