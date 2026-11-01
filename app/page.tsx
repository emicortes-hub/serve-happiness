'use client';

import React from 'react';

const SERVE_WHOP_URL = 'https://whop.com/serve-8db4';

export default function ServeLandingPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0c',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Resplandor ambiental oro cálido */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '900px',
          height: '600px',
          background:
            'radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, rgba(180, 130, 40, 0.05) 45%, rgba(10, 10, 12, 0) 75%)',
          pointerEvents: 'none',
        }}
      />

      {/* Trama de líneas doradas sutiles en los costados */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(212, 175, 55, 0.08) 1px, transparent 0)',
          backgroundSize: '40px 40px',
          opacity: 0.5,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: '860px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Badge superior táctico */}
        <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '32px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.22em',
              color: '#d4af37',
              backgroundColor: 'rgba(212, 175, 55, 0.08)',
              border: '1px solid rgba(212, 175, 55, 0.28)',
              padding: '7px 20px',
              borderRadius: '99px',
              boxShadow: '0 0 20px rgba(212, 175, 55, 0.12)',
            }}
          >
            SISTEMA DE SOPORTE INTELIGENTE
          </span>
        </div>

        {/* Logo Oficial desde public/logo-serve.png */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
          }}
        >
          <img
            src="/logo-serve.png"
            alt="SERVE"
            style={{
              maxHeight: '120px',
              maxWidth: '90%',
              height: 'auto',
              width: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 12px 32px rgba(212, 175, 55, 0.35))',
            }}
          />
        </div>

        {/* Acrónimo Oficial de la Marca */}
        <p
          style={{
            fontSize: 'clamp(11px, 2vw, 14px)',
            fontWeight: 800,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: '#c29b38',
            margin: '0 0 24px',
          }}
        >
          SISTEMA · ESTRATEGIA · RESULTADOS · VALOR · ÉLITE
        </p>

        {/* Subtítulo Tecnológico */}
        <h2
          style={{
            fontSize: 'clamp(18px, 3vw, 24px)',
            fontWeight: 700,
            color: '#f1f5f9',
            margin: '0 auto 16px',
            letterSpacing: '-0.01em',
          }}
        >
          Integración con Telegram & IA
        </h2>

        {/* Descripción de propuesta */}
        <p
          style={{
            color: '#8e8e99',
            fontSize: '16px',
            lineHeight: 1.65,
            margin: '0 auto 40px',
            maxWidth: '620px',
          }}
        >
          Infraestructura de respuesta táctica, derivación inteligente y automatización operativa diseñada para comunidades y academias de alta exigencia.
        </p>

        {/* Botones estilo Oro Satinado / Dark Glass */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
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
              background: 'linear-gradient(135deg, #e5c05b 0%, #b8860b 100%)',
              color: '#0a0a0c',
              fontWeight: 900,
              fontSize: '14.5px',
              letterSpacing: '0.03em',
              padding: '14px 30px',
              borderRadius: '12px',
              textDecoration: 'none',
              boxShadow: '0 10px 30px rgba(212, 175, 55, 0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 14px 40px rgba(212, 175, 55, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(212, 175, 55, 0.35)';
            }}
          >
            Acceder a SERVE en Whop ↗
          </a>

          <a
            href={SERVE_WHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: 'rgba(212, 175, 55, 0.05)',
              color: '#e5c05b',
              fontWeight: 700,
              fontSize: '14.5px',
              padding: '14px 28px',
              borderRadius: '12px',
              textDecoration: 'none',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.6)';
              e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
              e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.05)';
            }}
          >
            Contacto & Membresía ↗
          </a>
        </div>
      </div>
    </main>
  );
}