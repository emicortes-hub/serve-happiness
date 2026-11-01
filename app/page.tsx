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

        {/* Emblema Oficial Daga/Flecha $ & Tipografía SERVE */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            marginBottom: '16px',
            flexWrap: 'wrap',
          }}
        >
          {/* Isotipo: Daga / Dólar Táctico Dorado en SVG con biselado 3D */}
          <svg
            width="82"
            height="112"
            viewBox="0 0 100 136"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              filter: 'drop-shadow(0 12px 28px rgba(212, 175, 55, 0.4))',
            }}
          >
            <defs>
              <linearGradient id="goldLight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffea9f" />
                <stop offset="45%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#9a7828" />
              </linearGradient>
              <linearGradient id="goldMedium" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e5c05b" />
                <stop offset="50%" stopColor="#b38728" />
                <stop offset="100%" stopColor="#684b12" />
              </linearGradient>
              <linearGradient id="goldDark" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#7a5c18" />
                <stop offset="100%" stopColor="#2a1d04" />
              </linearGradient>
            </defs>

            {/* Punta de la flecha / daga superior (bisel izquierdo y derecho) */}
            <path d="M50 2 L32 40 L44 37 L44 50 L50 50 Z" fill="url(#goldLight)" />
            <path d="M50 2 L68 40 L56 37 L56 50 L50 50 Z" fill="url(#goldMedium)" />

            {/* Cuerpo del monograma táctico S biselado */}
            {/* Tramo superior S */}
            <path d="M68 38 L92 38 L92 58 L46 58 L46 48 L68 48 Z" fill="url(#goldLight)" />
            <path d="M92 48 L92 58 L38 58 L38 48 Z" fill="url(#goldDark)" />

            {/* Tramo central vertical y cruzado */}
            <path d="M38 58 L54 58 L54 78 L38 78 Z" fill="url(#goldMedium)" />
            <path d="M38 78 L86 78 L86 98 L30 98 L30 88 L72 88 L72 82 L38 82 Z" fill="url(#goldLight)" />
            <path d="M86 88 L86 98 L24 98 L24 88 Z" fill="url(#goldDark)" />

            {/* Tramo inferior vertical */}
            <path d="M72 78 L86 78 L86 98 L72 98 Z" fill="url(#goldMedium)" />

            {/* Eje central vertical que atraviesa como espada */}
            <path d="M44 50 L50 50 L50 86 L44 86 Z" fill="url(#goldLight)" />
            <path d="M50 50 L56 50 L56 86 L50 86 Z" fill="url(#goldMedium)" />

            {/* Punta inferior de la daga (bisel izquierdo y derecho) */}
            <path d="M44 98 L50 98 L50 134 L32 98 Z" fill="url(#goldLight)" />
            <path d="M50 98 L56 98 L68 98 L50 134 Z" fill="url(#goldMedium)" />
          </svg>

          {/* Nombre de marca SERVE */}
          <h1
            style={{
              fontSize: 'clamp(54px, 10vw, 96px)',
              fontWeight: 950,
              lineHeight: 0.9,
              margin: 0,
              letterSpacing: '0.04em',
              background: 'linear-gradient(180deg, #ffffff 15%, #e6ca65 65%, #9a7828 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 10px 40px rgba(212, 175, 55, 0.25)',
            }}
          >
            SERVE
          </h1>
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