'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Función auxiliar para renderizar negritas Markdown de forma segura
function renderFormattedMessage(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} style={{ color: '#fbbf24', fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export default function AIChatBox() {
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
    scrollToBottom();
  }, [messages, loading]);

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
        backgroundColor: '#0c1527',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        borderRadius: '16px',
        padding: '18px',
        boxShadow: '0 16px 36px -12px rgba(0, 0, 0, 0.7), 0 0 24px -10px rgba(245, 158, 11, 0.15)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '480px',
      }}
    >
      {/* Detalle visual dorado superior */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          background: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
        }}
      />

      {/* Encabezado */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px',
          paddingBottom: '12px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '9px',
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#fbbf24',
            display: 'grid',
            placeItems: 'center',
            fontSize: '15px',
            flexShrink: 0,
          }}
        >
          ⚡
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>
            Asistente Táctico IA
          </h3>
          <p style={{ margin: 0, fontSize: '11.5px', color: '#fbbf24', opacity: 0.9 }}>
            Respuestas automáticas sobre objeciones y método
          </p>
        </div>
      </div>

      {/* Área scrollable de mensajes */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          paddingRight: '6px',
          marginBottom: '12px',
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
                maxWidth: '92%',
                fontSize: '12.5px',
                lineHeight: '1.65',
                padding: '12px 16px',
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
                fontSize: '12px',
                color: '#fbbf24',
                backgroundColor: '#13213c',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                padding: '8px 12px',
                borderRadius: '10px',
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
          display: 'flex',
          gap: '8px',
          paddingTop: '10px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu duda sobre ventas u objeciones..."
          style={{
            flex: 1,
            backgroundColor: '#070e1c',
            border: '1px solid #1b2840',
            borderRadius: '10px',
            padding: '10px 14px',
            fontSize: '12.5px',
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
            borderRadius: '10px',
            padding: '0 16px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            opacity: loading || !input.trim() ? 0.6 : 1,
            transition: 'opacity 0.2s ease',
          }}
        >
          Consultar
        </button>
      </form>
    </div>
  );
}