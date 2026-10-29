'use client';

import React, { useState } from 'react';

export default function ProSalesTrainingView() {
  const [topic, setTopic] = useState('Módulo de Prospección');
  const [whatsapp, setWhatsapp] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('Conectando con mentores asignados...');

    try {
      const res = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          whatsapp,
          message,
        }),
      });

      if (!res.ok) throw new Error('Error al enviar');
      setStatus('✅ ¡Consulta recibida! Un mentor te contactará a tu WhatsApp en breve.');
      setMessage('');
      setWhatsapp('');
    } catch {
      setStatus('⚠️ Hubo un error de conexión. Inténtalo nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#070c18',
        backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(0, 118, 245, 0.2) 0%, transparent 60%)',
        color: '#f0f6fc',
        fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, sans-serif',
        padding: '36px 20px',
      }}
    >
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* ENCABEZADO OFICIAL PRO SALES TRAINING */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img
            src="/logo-circular.png"
            alt="Pro Sales Training"
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid #0076f5',
              marginBottom: '16px',
              boxShadow: '0 8px 24px rgba(0, 118, 245, 0.35)',
            }}
          />
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 900,
              margin: '0 0 8px',
              color: '#ffffff',
              letterSpacing: '-0.02em',
            }}
          >
            Pro Sales Training
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
            El mejor entrenamiento en ventas de habla hispana · Mesa de Ayuda
          </p>
        </div>

        {/* ACCESO A ZOOM EN DIRECTO */}
        <div
          style={{
            backgroundColor: '#0d172e',
            border: '1px solid #1e3258',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>
              ¿Prefieres atención en directo?
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
              Conéctate a nuestra sala con mentores activos.
            </div>
          </div>
          <a
            href="https://us02web.zoom.us/j/9272409073"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: '#0076f5',
              color: '#ffffff',
              padding: '10px 18px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 800,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 14px rgba(0, 118, 245, 0.4)',
            }}
          >
            Entrar a Zoom ↗
          </a>
        </div>

        {/* FORMULARIO */}
        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: '#0b1326',
            border: '1px solid #182847',
            borderRadius: '14px',
            padding: '26px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div style={{ marginBottom: '18px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 800,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '8px',
              }}
            >
              Módulo / Tema de Consulta
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                backgroundColor: '#060a14',
                border: '1px solid #1e3258',
                borderRadius: '8px',
                padding: '12px 14px',
                color: '#ffffff',
                fontSize: '13px',
                outline: 'none',
              }}
            >
              <option value="Módulo de Prospección">Módulo de Prospección</option>
              <option value="Cierre y Objeciones">Cierre y Objeciones</option>
              <option value="Roleplays en Vivo">Roleplays en Vivo</option>
              <option value="Dudas de Plataforma Whop">Dudas de Plataforma Whop</option>
              <option value="Otra Consulta">Otra Consulta</option>
            </select>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 800,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '8px',
              }}
            >
              Tu WhatsApp (con código de país)
            </label>
            <input
              type="tel"
              required
              placeholder="Ej: +52 55 1234 5678"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                backgroundColor: '#060a14',
                border: '1px solid #1e3258',
                borderRadius: '8px',
                padding: '12px 14px',
                color: '#ffffff',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 800,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '8px',
              }}
            >
              Describe tu duda o situación
            </label>
            <textarea
              required
              rows={4}
              placeholder="Explica qué necesitas resolver para canalizarte..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                backgroundColor: '#060a14',
                border: '1px solid #1e3258',
                borderRadius: '8px',
                padding: '12px 14px',
                color: '#ffffff',
                fontSize: '13px',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              backgroundColor: '#0076f5',
              color: '#ffffff',
              border: 'none',
              padding: '14px',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '13px',
              letterSpacing: '0.04em',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(0, 118, 245, 0.4)',
            }}
          >
            {isSubmitting ? 'Enviando consulta...' : 'SOLICITAR ASISTENCIA DIRECTA'}
          </button>

          {status && (
            <div
              style={{
                marginTop: '16px',
                textAlign: 'center',
                fontSize: '12px',
                color: '#60a5fa',
                fontWeight: 600,
              }}
            >
              {status}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}