'use client';

import React, { useState, useEffect } from 'react';
import AIChatBox from '@/components/AIChatBox';

export default function Home() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [currentDay, setCurrentDay] = useState<number>(0);
  const [formData, setFormData] = useState({
    program: '',
    name: '',
    email: '',
    whatsapp: '',
    details: '',
  });

  useEffect(() => {
    // 0 = Domingo, 1 = Lunes, 2 = Martes, 3 = Miércoles, 4 = Jueves, etc.
    setCurrentDay(new Date().getDay());
  }, []);

  // Función para disparar el chat IA con una consulta desde los chips
  const triggerAIChat = (prompt: string) => {
    window.dispatchEvent(new CustomEvent('open-ai-chat', { detail: { prompt } }));
  };

  const handleChipClick = (label: string) => {
    if (label === 'Objeción de Socio') {
      triggerAIChat('¿Cómo manejo la objeción: "Tengo que consultarlo con mi socio antes de decidir"?');
    } else if (label === 'Feedback de Pitch') {
      triggerAIChat('¿Cuáles son los 3 errores más comunes al presentar el pitch en llamadas de venta?');
    } else if (label === 'Acceso a Grabaciones') {
      setActiveFaq(0);
      setFormData((prev) => ({
        ...prev,
        details: 'Necesito orientación para acceder a las grabaciones de las llamadas anteriores.',
      }));
    } else if (label === 'Horario de Sesiones') {
      setActiveFaq(1);
      triggerAIChat('¿Cuáles son los horarios de las sesiones de acompañamiento en vivo?');
    }
  };

  const faqs = [
    {
      q: '¿Dónde encuentro las grabaciones de las llamadas?',
      a: 'Todas las grabaciones de Script Lab, Hot Seat y Roleplays se publican en el módulo "Bóveda de Llamadas" dentro de Whop en menos de 24 horas tras finalizar la sesión.',
    },
    {
      q: '¿Cómo me uno a los roleplays y sesiones en vivo?',
      a: 'Los enlaces directos a Zoom se habilitan 15 minutos antes de cada sesión en el canal oficial de Anuncios de la comunidad y en el botón superior "Entrar a la Sala".',
    },
    {
      q: '¿Dónde puedo interactuar con la comunidad y otros alumnos?',
      a: 'En los canales de chat activos dentro del portal de Whop, donde puedes compartir audios de tus llamadas, dudas puntuales y celebrar cierres con tus compañeros.',
    },
    {
      q: '¿Dónde están los módulos del curso y materiales?',
      a: 'En la sección de Contenido de tu membresía de Whop. Puedes acceder con el mismo correo registrado en tu compra.',
    },
    {
      q: '¿Tengo problemas para ver o desbloquear algún contenido?',
      a: 'Asegúrate de haber iniciado sesión con tu correo exacto de Whop. Si persiste, envía este formulario seleccionando "Incidente de acceso" para asignarte soporte inmediato.',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#070d17', color: '#f8fafc', padding: '32px 24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        
        {/* Header superior */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#0f172a', border: '1px solid #1e293b', display: 'grid', placeItems: 'center', fontWeight: 900, color: '#f59e0b', fontSize: '18px' }}>
              ⚡
            </div>
            <div>
              <span style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '0.05em', color: '#ffffff' }}>PRO SALES</span>
              <span style={{ fontSize: '11px', display: 'block', color: '#f59e0b', fontWeight: 700, letterSpacing: '0.12em', marginTop: '-2px' }}>TRAINING</span>
            </div>
          </div>

          <a
            href="https://zoom.us"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#070d17',
              padding: '10px 20px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(245, 158, 11, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>📹</span> Sala de Zoom
          </a>
        </header>

        {/* Bloque: Sesiones en Vivo con resaltado dinámico */}
        <section
          style={{
            backgroundColor: '#0c1527',
            border: '1px solid #1e2d4a',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '40px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#13213c', border: '1px solid #1e335a', display: 'grid', placeItems: 'center', fontSize: '18px', color: '#f59e0b' }}>
                📅
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#ffffff' }}>
                  Sesiones en Vivo con Marcelo Gutiérrez
                </h3>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#94a3b8' }}>
                  Horario oficial fijado en Hora Ciudad de México (CDMX) • Sala de Zoom
                </p>
              </div>
            </div>

            <a
              href="https://zoom.us"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                color: '#fbbf24',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Entrar a la Sala ↗
            </a>
          </div>

          {/* Cards de días de la semana con resaltado del día actual */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            
            {/* Martes (Day 2) */}
            <div
              style={{
                backgroundColor: currentDay === 2 ? '#112240' : '#08101d',
                border: currentDay === 2 ? '2px solid #f59e0b' : '1px solid #192742',
                boxShadow: currentDay === 2 ? '0 0 20px rgba(245, 158, 11, 0.25)' : 'none',
                borderRadius: '12px',
                padding: '18px',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.08em' }}>MARTES</span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: currentDay === 2 ? '#22c55e' : '#64748b',
                  backgroundColor: currentDay === 2 ? 'rgba(34, 197, 94, 0.12)' : 'rgba(100, 116, 139, 0.1)',
                  padding: '3px 8px',
                  borderRadius: '12px'
                }}>
                  {currentDay === 2 ? '● HOY EN VIVO' : 'Programado'}
                </span>
              </div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>PRO SCRIPT LAB</h4>
              <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#fbbf24', fontWeight: 600 }}>🇲🇽 8:00 AM (CDMX)</p>
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>🕒 Pulido táctico de aperturas y objeciones</span>
            </div>

            {/* Miércoles (Day 3) */}
            <div
              style={{
                backgroundColor: currentDay === 3 ? '#112240' : '#08101d',
                border: currentDay === 3 ? '2px solid #f59e0b' : '1px solid #192742',
                boxShadow: currentDay === 3 ? '0 0 20px rgba(245, 158, 11, 0.25)' : 'none',
                borderRadius: '12px',
                padding: '18px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.08em' }}>MIÉRCOLES</span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: currentDay === 3 ? '#22c55e' : '#64748b',
                  backgroundColor: currentDay === 3 ? 'rgba(34, 197, 94, 0.12)' : 'rgba(100, 116, 139, 0.1)',
                  padding: '3px 8px',
                  borderRadius: '12px'
                }}>
                  {currentDay === 3 ? '● HOY EN VIVO' : 'Programado'}
                </span>
              </div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>PRO HOT SEAT</h4>
              <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#fbbf24', fontWeight: 600 }}>🇲🇽 7:00 PM (CDMX)</p>
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>🕒 Auditoría de llamadas de alumnos en vivo</span>
            </div>

            {/* Jueves (Day 4) */}
            <div
              style={{
                backgroundColor: currentDay === 4 ? '#112240' : '#08101d',
                border: currentDay === 4 ? '2px solid #f59e0b' : '1px solid #192742',
                boxShadow: currentDay === 4 ? '0 0 20px rgba(245, 158, 11, 0.25)' : 'none',
                borderRadius: '12px',
                padding: '18px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.08em' }}>JUEVES</span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: currentDay === 4 ? '#22c55e' : '#64748b',
                  backgroundColor: currentDay === 4 ? 'rgba(34, 197, 94, 0.12)' : 'rgba(100, 116, 139, 0.1)',
                  padding: '3px 8px',
                  borderRadius: '12px'
                }}>
                  {currentDay === 4 ? '● HOY EN VIVO' : 'Programado'}
                </span>
              </div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>PRO ROLE PLAY</h4>
              <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#fbbf24', fontWeight: 600 }}>🇲🇽 8:00 AM (CDMX)</p>
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>🕒 Simulación intensiva de cierre y debate</span>
            </div>

          </div>
        </section>

        {/* Título de Sección */}
        <div style={{ marginBottom: '28px' }}>
          <span style={{
            display: 'inline-block',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.08em',
            color: '#fbbf24',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            padding: '4px 12px',
            borderRadius: '20px',
            marginBottom: '8px',
          }}>
            ACOMPAÑAMIENTO COMERCIAL ACTIVO
          </span>
          <h1 style={{ fontSize: '32px', fontWeight: 900, margin: '6px 0 8px 0', color: '#ffffff' }}>
            Soporte Operativo • <span style={{ color: '#f59e0b' }}>Pro Sales Training</span>
          </h1>
          <p style={{ margin: 0, fontSize: '14.5px', color: '#94a3b8', maxWidth: '780px' }}>
            El mejor entrenamiento en ventas de habla hispana. Plantea tus dudas sobre cierres, roleplays en vivo con el equipo de Marcelo Gutiérrez o reporta incidentes de acceso.
          </p>
        </div>

        {/* Grid de 2 Columnas Principal */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '32px' }}>
          
          {/* Columna Izquierda: Formulario de Solicitud */}
          <div
            style={{
              backgroundColor: '#0c1527',
              border: '1px solid #1e2d4a',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', fontWeight: 800, display: 'grid', placeItems: 'center', fontSize: '13px' }}>
                01
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>Abre una solicitud</h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Selecciona tu programa para derivar tu caso con la prioridad correcta.</p>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); alert('Solicitud enviada correctamente. El equipo se comunicará contigo vía WhatsApp/Telegram.'); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>Programa o Mentoría activa</label>
                <select
                  value={formData.program}
                  onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#070e1c', border: '1px solid #1b2840', borderRadius: '10px', padding: '10px 12px', color: '#ffffff', fontSize: '13px', outline: 'none' }}
                >
                  <option value="">Selecciona tu programa...</option>
                  <option value="pro_sales">Pro Sales Mentoring Elite</option>
                  <option value="roleplay_club">Club de Roleplay Comercial</option>
                  <option value="scripts_bootcamp">Bootcamp de Guiones & Aperturas</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>Nombre y Apellido</label>
                  <input
                    type="text"
                    placeholder="Tu nombre completo"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#070e1c', border: '1px solid #1b2840', borderRadius: '10px', padding: '10px 12px', color: '#ffffff', fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>Correo en Whop</label>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#070e1c', border: '1px solid #1b2840', borderRadius: '10px', padding: '10px 12px', color: '#ffffff', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>WhatsApp (con código de país)</label>
                <input
                  type="text"
                  placeholder="+52 55 1234 5678"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#070e1c', border: '1px solid #1b2840', borderRadius: '10px', padding: '10px 12px', color: '#ffffff', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>Detalle de tu consulta o bloqueo comercial</label>
                <textarea
                  rows={4}
                  placeholder="Ej: Tengo una objeción recurrente de presupuesto o requiero soporte con las grabaciones del entrenamiento..."
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#070e1c', border: '1px solid #1b2840', borderRadius: '10px', padding: '10px 12px', color: '#ffffff', fontSize: '13px', outline: 'none', resize: 'vertical' }}
                />
              </div>

              {/* Chips de Consultas Habituales que abren la IA o autocompletan */}
              <div>
                <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', letterSpacing: '0.04em' }}>
                  CONSULTAS HABITUALES DE ALUMNOS (CLICK PARA RESOLVER):
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {['Feedback de Pitch', 'Horario de Sesiones', 'Acceso a Grabaciones', 'Objeción de Socio'].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleChipClick(chip)}
                      style={{
                        backgroundColor: '#111d33',
                        border: '1px solid #1e335a',
                        color: '#fbbf24',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1a2c4e'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#111d33'; }}
                    >
                      {chip} ⚡
                    </button>
                  ))}
                </div>
              </div>

              {/* Botón Principal Unificado en Dorado */}
              <button
                type="submit"
                style={{
                  marginTop: '8px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#070d17',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '14px',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(245, 158, 11, 0.35)',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                Enviar Solicitud
              </button>
            </form>
          </div>

          {/* Columna Derecha: Tarjeta Enriquecida + Preguntas Frecuentes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Tarjeta Enriquecida: Atención & Roleplays */}
            <div
              style={{
                backgroundColor: '#0c1527',
                border: '1px solid #1e2d4a',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fbbf24', display: 'grid', placeItems: 'center', fontSize: '16px' }}>
                  🎯
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>Atención & Roleplays</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#fbbf24', fontWeight: 600 }}>Acompañamiento táctico de alta conversión</p>
                </div>
              </div>

              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                Acelera tu porcentaje de conversión en llamadas, destraba objeciones complejas de precio o socios y domina cierres de alto valor directamente con el equipo de Marcelo Gutiérrez.
              </p>

              {/* Métricas y Garantías del Programa */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px', padding: '12px', backgroundColor: '#070e1c', borderRadius: '10px', border: '1px solid #192742' }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#fbbf24', display: 'block' }}>&lt; 2 hrs</span>
                  <span style={{ fontSize: '10.5px', color: '#64748b' }}>Respuesta</span>
                </div>
                <div style={{ textAlign: 'center', borderLeft: '1px solid #192742', borderRight: '1px solid #192742' }}>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#22c55e', display: 'block' }}>3 Días/Sem</span>
                  <span style={{ fontSize: '10.5px', color: '#64748b' }}>Roleplays en Vivo</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#fbbf24', display: 'block' }}>1 a 1</span>
                  <span style={{ fontSize: '10.5px', color: '#64748b' }}>Auditoría de Pitch</span>
                </div>
              </div>

              {/* Botones de Acción Inmediata */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => triggerAIChat('¿Cuáles son los 3 pasos del método de Marcelo para responder cuando el cliente dice que lo tiene que pensar?')}
                  style={{
                    flex: 1,
                    backgroundColor: '#111d33',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    color: '#fbbf24',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Consultar Mentor IA ⚡
                </button>
                <a
                  href="https://zoom.us"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: '#111d33',
                    border: '1px solid #1e335a',
                    color: '#e2e8f0',
                    padding: '9px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  Ver Zoom ↗
                </a>
              </div>
            </div>

            {/* Preguntas Frecuentes Acordeón */}
            <div
              style={{
                backgroundColor: '#0c1527',
                border: '1px solid #1e2d4a',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
              }}
            >
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>Preguntas Frecuentes</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {faqs.map((faq, index) => {
                  const isOpen = activeFaq === index;
                  return (
                    <div
                      key={index}
                      style={{
                        backgroundColor: '#08101d',
                        border: '1px solid #192742',
                        borderRadius: '10px',
                        overflow: 'hidden',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveFaq(isOpen ? null : index)}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#f8fafc',
                          fontSize: '13px',
                          fontWeight: 600,
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        <span>{faq.q}</span>
                        <span style={{ color: '#f59e0b', fontSize: '16px', marginLeft: '8px' }}>
                          {isOpen ? '−' : '+'}
                        </span>
                      </button>
                      {isOpen && (
                        <div style={{ padding: '0 14px 14px 14px', fontSize: '12.5px', color: '#94a3b8', lineHeight: '1.6', borderTop: '1px solid #131e33' }}>
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Widget Flotante del Asistente */}
      <AIChatBox />
    </div>
  );
}