'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Renderizado de negritas doradas y cursivas Markdown
function renderFormattedMessage(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} style={{ color: '#fbbf24', fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={index} style={{ color: '#cbd5e1', fontStyle: 'italic' }}>
          {part.slice(1, -1)}
        </em>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export default function AIChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '¡Hola! Soy tu mentor táctico de ventas IA. Si tienes dudas rápidas sobre objeciones comerciales o las dinámicas de las llamadas, pregúntame.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, loading, isOpen]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: newMessages.slice(-4),
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply || 'No pude procesar la consulta.' },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Error de conexión. Intenta nuevamente.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
      }}
    >
      {/* Ventana de Chat Desplegable */}
      {isOpen && (
        <div
          style={{
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: '520px',
            backgroundColor: '#0c1527',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(245, 158, 11, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            marginBottom: '14px',
          }}
        >
          {/* Acento dorado superior */}
          <div
            style={{
              height: '3px',
              background: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
            }}
          />

          {/* Header con icono de chat y punto verde al lado de Online */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#09101d',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Contenedor del icono de chat bot */}
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  color: '#fbbf24',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </div>

              <div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>
                  Asistente Táctico IA
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  {/* Punto verde de actividad */}
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: '#22c55e',
                      boxShadow: '0 0 8px #22c55e',
                      display: 'inline-block',
                    }}
                  />
                  <p style={{ margin: 0, fontSize: '11.5px', color: '#fbbf24', fontWeight: 600 }}>
                    Online <span style={{ color: '#94a3b8', fontWeight: 400 }}>• Mentor de Ventas</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Botón de cerrar */}
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar chat"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '6px',
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>

          {/* Historial de Mensajes */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '88%',
                    fontSize: '12.5px',
                    lineHeight: '1.6',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    ...(m.role === 'user'
                      ? {
                          backgroundColor: '#f59e0b',
                          color: '#0b1120',
                          fontWeight: 600,
                          borderBottomRightRadius: '3px',
                        }
                      : {
                          backgroundColor: '#13213c',
                          color: '#e2e8f0',
                          border: '1px solid #1e335a',
                          borderBottomLeftRadius: '3px',
                        }),
                  }}
                >
                  {m.role === 'assistant' ? renderFormattedMessage(m.content) : m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    fontSize: '11.5px',
                    color: '#fbbf24',
                    backgroundColor: '#13213c',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                  }}
                >
                  Preparando respuesta táctica...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input de consulta */}
          <form
            onSubmit={sendMessage}
            style={{
              padding: '10px 12px',
              backgroundColor: '#09101d',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              gap: '8px',
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregunta sobre una objeción..."
              style={{
                flex: 1,
                backgroundColor: '#070e1c',
                border: '1px solid #1b2840',
                borderRadius: '8px',
                padding: '9px 12px',
                fontSize: '12px',
                color: '#ffffff',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                backgroundColor: '#f59e0b',
                color: '#0b1120',
                border: 'none',
                borderRadius: '8px',
                padding: '0 14px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                opacity: loading || !input.trim() ? 0.6 : 1,
              }}
            >
              Enviar
            </button>
          </form>
        </div>
      )}

      {/* Botón Flotante con Tooltip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            style={{
              backgroundColor: '#0c1527',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#ffffff',
              padding: '8px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.5)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ color: '#fbbf24' }}>¿Dudas con una venta?</span> Chatea aquí
          </div>
        )}

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Cerrar chat" : "Abrir chat de soporte táctico"}
          style={{
            width: '58px',
            height: '58px',
            borderRadius: '50%',
            backgroundColor: '#0f192d',
            border: '2px solid #f59e0b',
            color: '#fbbf24',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), 0 0 18px rgba(245, 158, 11, 0.35)',
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
            position: 'relative',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {isOpen ? (
            <span style={{ fontSize: '20px', color: '#94a3b8' }}>✕</span>
          ) : (
            <>
              {/* Icono de burbuja de chat conversacional */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/>
                <circle cx="8" cy="10" r="1.5" />
                <circle cx="12" cy="10" r="1.5" />
                <circle cx="16" cy="10" r="1.5" />
              </svg>
              {/* Punto verde de actividad online */}
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  width: '13px',
                  height: '13px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  border: '2.5px solid #0f192d',
                }}
              />
            </>
          )}
        </button>
      </div>
    </div>
  );
}