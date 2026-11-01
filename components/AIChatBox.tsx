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
      content: '¡Hola! Soy tu asistente táctico de ventas. Si tienes dudas rápidas sobre objeciones comerciales o las dinámicas de las llamadas, pregúntame.',
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
            animation: 'fadeInUp 0.25s ease-out',
          }}
        >
          {/* Barra dorada superior */}
          <div
            style={{
              height: '3px',
              background: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
            }}
          />

          {/* Header del Chat */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: '#fbbf24',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '14px',
                }}
              >
                ⚡
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
                  Asistente Táctico IA
                </h4>
                <p style={{ margin: 0, fontSize: '11px', color: '#fbbf24', opacity: 0.9 }}>
                  Online • Mentor de Ventas
                </p>
              </div>
            </div>

            {/* Botón de minimizar */}
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
                  Consultando táctica...
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

      {/* Botón Flotante / Burbuja */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Abrir asistente de ventas"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#0f192d',
          border: '2px solid #f59e0b',
          color: '#fbbf24',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5), 0 0 20px rgba(245, 158, 11, 0.4)',
          cursor: 'pointer',
          display: 'grid',
          placeItems: 'center',
          fontSize: '22px',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {isOpen ? '✕' : '⚡'}
      </button>
    </div>
  );
}