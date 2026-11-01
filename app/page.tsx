'use client';

import React from 'react';
import AIChatBox from '@/components/AIChatBox';

export default function ServeLandingPage() {
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
        <div style={{ display: 'inline-block', marginBottom: '20px' }}>
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
            Plataforma Operativa & IA
          </span>
        </div>

        {/* Título Principal de la plataforma */}
        <div style={{ margin: '0 0 24px' }}>
          <h1
            style={{
              fontSize: 'clamp(40px, 7vw, 68px)',
              fontWeight: 900,
              lineHeight: 1,
              margin: 0,
              letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, #0076f5 0%, #00c3ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            SERVE
          </h1>

          <p
            style={{
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#94a3b8',
              margin: '14px 0 0',
            }}
          >
            Soporte & Asistencia Táctica para Comunidades
          </p>
        </div>

        {/* Descripción vinculada a Pro Sales Training */}
        <p
          style={{
            color: '#8b9bb4',
            fontSize: '16px',
            lineHeight: 1.6,
            margin: '0 auto 34px',
            maxWidth: '560px',
          }}
        >
          Infraestructura de soporte inteligente y entrenamiento comercial en tiempo real para miembros de <strong style={{ color: '#ffffff' }}>Pro Sales Training</strong>. Consulta tácticas de venta inmediatas con nuestro asistente de IA en la esquina inferior derecha.
        </p>

        {/* Botón de acceso a Whop */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <a
            href="https://whop.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'linear-gradient(135deg, #0076f5 0%, #0099ff 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '14px',
              padding: '14px 30px',
              borderRadius: '10px',
              textDecoration: 'none',
              boxShadow: '0 10px 28px rgba(0, 118, 245, 0.38)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
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
            Acceder a Whop App ↗
          </a>
        </div>
      </div>

      {/* Widget flotante de IA */}
      <AIChatBox />
    </main>
  );
}
