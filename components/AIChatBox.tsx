'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  '💸 "Tu mentoría me parece muy cara"',
  '🤝 "Tengo que consultarlo con mi socio"',
  '📅 "¿Cuándo son las sesiones de roleplay?"',
];

// Limpieza de encabezados Markdown (###) y formateo de negritas/cursivas
function renderFormattedMessage(text: string) {
  // Elimina prefijos '### ' para que no salgan hashtags crudos
  const cleanedText = text.replace(/^###\s+/gm, '');

  const parts = cleanedText.split(/(\*\*.*?\*\*|\*.*?\*)/g);
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
      content:
        '¡Hola! Soy tu mentor táctico de ventas IA. Selecciona una objeción rápida o escribe lo que te dijo tu prospecto.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, loading, isOpen]);

  const executeSend = async (messageText: string) => {
    if (!messageText.trim() || loading) return;

    const userMsg = messageText.trim();
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

  useEffect(() => {
    const handleGlobalTrigger = (e: any) => {
      const prompt = e.detail?.prompt;
      setIsOpen(true);
      if (prompt) {
        setTimeout(() => executeSend(prompt), 150);
      }
    };

    window.addEventListener('open-ai-chat', handleGlobalTrigger);
    return () => window.removeEventListener('open-ai-chat', handleGlobalTrigger);
  }, [messages, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSend(input);
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <>
      <style jsx global>{`
        @keyframes subtleHalo {
          0% {
            box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.45), 0 8px 24px rgba(0, 0, 0, 0.6);
          }
          70% {
            box-shadow: 0 0 0 14px rgba(245, 158, 11, 0), 0 8px 24px rgba(0, 0, 0, 0.6);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(245, 158, 11, 0), 0 8px 24px rgba(0, 0, 0, 0.6);
          }
        }
        @keyframes chatBounce {
          0%, 80%, 100% {
            transform: scale(0.65);
            opacity: 0.4;
          }
          40% {
            transform: scale(1.1);
            opacity: 1;
          }
        }
        .ai-chat-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .ai-chat-scroll::-webkit-scrollbar-track {
          background: rgba(12, 21, 39, 0.6);
        }
        .ai-chat-scroll::-webkit-scrollbar-thumb {
          background: rgba(245, 158, 11, 0.25);
          border-radius: 10px;
        }
      `}</style>

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
        {isOpen && (
          <div
            style={{
              width: '390px',
              maxWidth: 'calc(100vw - 32px)',
              height: '540px',
              backgroundColor: '#0c1527',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '16px',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.85), 0 0 25px rgba(245, 158, 11, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              marginBottom: '14px',
            }}
          >
            <div
              style={{
                height: '3px',
                background: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
              }}
            />

            {/* Header */}
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
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </div>

                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>
                    Asistente Táctico IA
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
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

            {/* Mensajes */}
            <div
              className="ai-chat-scroll"
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
                    flexDirection: 'column',
                    alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '90%',
                      fontSize: '12.5px',
                      lineHeight: '1.6',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      position: 'relative',
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

                  {m.role === 'assistant' && idx !== 0 && (
                    <button
                      onClick={() => handleCopy(m.content, idx)}
                      style={{
                        marginTop: '4px',
                        background: 'none',
                        border: 'none',
                        color: copiedIndex === idx ? '#22c55e' : '#64748b',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 6px',
                      }}
                    >
                      {copiedIndex === idx ? '✓ Copiado' : '❐ Copiar guion'}
                    </button>
                  )}
                </div>
              ))}

              {loading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div
                    style={{
                      backgroundColor: '#13213c',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      padding: '10px 16px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#fbbf24',
                        animation: 'chatBounce 1.2s infinite ease-in-out',
                      }}
                    />
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#fbbf24',
                        animation: 'chatBounce 1.2s infinite ease-in-out 0.2s',
                      }}
                    />
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#fbbf24',
                        animation: 'chatBounce 1.2s infinite ease-in-out 0.4s',
                      }}
                    />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chips iniciales */}
            {messages.length <= 2 && !loading && (
              <div
                style={{
                  padding: '6px 12px 8px 12px',
                  display: 'flex',
                  gap: '6px',
                  overflowX: 'auto',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  backgroundColor: '#09101d',
                }}
              >
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => executeSend(prompt.replace(/^[^\s]+\s*/, '').replace(/["']/g, ''))}
                    style={{
                      whiteSpace: 'nowrap',
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      color: '#fbbf24',
                      padding: '5px 10px',
                      borderRadius: '14px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Formulario con botón Enviar en Dorado Ámbar */}
            <form
              onSubmit={handleSubmit}
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
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#070d17',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0 14px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                  opacity: loading || !input.trim() ? 0.6 : 1,
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
                }}
              >
                Enviar
              </button>
            </form>
          </div>
        )}

        {/* Burbuja Flotante */}
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
            aria-label={isOpen ? 'Cerrar chat' : 'Abrir chat de soporte táctico'}
            style={{
              width: '58px',
              height: '58px',
              borderRadius: '50%',
              backgroundColor: '#0f192d',
              border: '2px solid #f59e0b',
              color: '#fbbf24',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
              position: 'relative',
              animation: !isOpen ? 'subtleHalo 3s infinite' : 'none',
              transition: 'transform 0.2s ease',
            }}
          >
            {isOpen ? (
              <span style={{ fontSize: '20px', color: '#94a3b8' }}>✕</span>
            ) : (
              <>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z" />
                  <circle cx="8" cy="10" r="1.5" />
                  <circle cx="12" cy="10" r="1.5" />
                  <circle cx="16" cy="10" r="1.5" />
                </svg>
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
    </>
  );
}