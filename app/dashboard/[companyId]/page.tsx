'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';

interface SupportMessage {
  id: string;
  sender_role: 'student' | 'mentor' | 'system';
  sender_name: string;
  visibility: 'public' | 'internal';
  body: string;
  created_at: string;
}

interface SupportTicket {
  id: string;
  ticket_number: string;
  student_name: string;
  student_email: string;
  student_phone?: string | null;
  program: string;
  category: string;
  priority: string;
  status: string;
  subject: string;
  description: string;
  sync_status: string;
  ghl_contact_id?: string | null;
  ghl_opportunity_id?: string | null;
  ghl_record_id?: string | null;
  created_at: string;
  updated_at: string;
  messages: SupportMessage[];
}

interface DashboardStats {
  total: number;
  open: number;
  waitingStudent: number;
  escalated: number;
  resolved: number;
  syncErrors: number;
  outboxPending: number;
}

const STATUS_META: Record<string, { label: string; bg: string; color: string; border: string }> = {
  NEW: { label: 'Nuevo', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  IN_REVIEW: { label: 'En Revisión', bg: '#eef2ff', color: '#4338ca', border: '#c7d2fe' },
  ASSIGNED: { label: 'Asignado', bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd' },
  IN_PROGRESS: { label: 'En Progreso', bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  WAITING_STUDENT: { label: 'Esperando Alumno', bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
  ESCALATED: { label: 'Escalado', bg: '#fff1f2', color: '#be123c', border: '#fecdd3' },
  RESOLVED: { label: 'Resuelto', bg: '#f1f5f9', color: '#334155', border: '#cbd5e1' },
  CLOSED: { label: 'Cerrado', bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' },
};

export default function AdminDashboardPage() {
  const params = useParams<{ companyId: string }>();
  const companyId = params?.companyId || '';

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    open: 0,
    waitingStudent: 0,
    escalated: 0,
    resolved: 0,
    syncErrors: 0,
    outboxPending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const [replyText, setReplyText] = useState('');
  const [replyVisibility, setReplyVisibility] = useState<'public' | 'internal'>('public');
  const [submitting, setSubmitting] = useState(false);
  const [syncingOutbox, setSyncingOutbox] = useState(false);

  const loadDashboard = async () => {
    try {
      const res = await fetch(`/api/admin/tickets?companyId=${encodeURIComponent(companyId)}`);
      const data = await res.json();
      if (data.ok) {
        setTickets(data.tickets || []);
        setStats(data.stats);
        if (!selectedTicketId && data.tickets?.length > 0) {
          setSelectedTicketId(data.tickets[0].id);
        }
      }
    } catch (err) {
      console.error('Error cargando dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [companyId]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesStatus =
        statusFilter === 'ALL'
          ? true
          : statusFilter === 'OPEN_GROUP'
          ? ['NEW', 'IN_REVIEW', 'ASSIGNED', 'IN_PROGRESS'].includes(t.status)
          : t.status === statusFilter;

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        t.ticket_number.toLowerCase().includes(q) ||
        t.student_name.toLowerCase().includes(q) ||
        t.student_email.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.program.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [tickets, statusFilter, searchQuery]);

  const selectedTicket = useMemo(
    () => tickets.find((t) => t.id === selectedTicketId) || null,
    [tickets, selectedTicketId]
  );

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reply',
          ticketId: selectedTicket.id,
          message: replyText.trim(),
          visibility: replyVisibility,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setReplyText('');
        await loadDashboard();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          ticketId,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        await loadDashboard();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleProcessOutbox = async () => {
    setSyncingOutbox(true);
    try {
      await fetch('/api/admin/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'process_outbox' }),
      });
      await loadDashboard();
    } finally {
      setSyncingOutbox(false);
    }
  };

  return (
    <div className="pst-root">
      <style>{`
        .pst-root {
          min-height: 100vh;
          background-color: #f8fafc;
          color: #0f295c;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          box-sizing: border-box;
        }
        .pst-header-band {
          background: linear-gradient(135deg, #0b1f44 0%, #1d4ed8 100%);
          color: #ffffff;
          padding: 22px 24px;
          box-shadow: 0 4px 16px rgba(11, 31, 68, 0.14);
        }
        .pst-header-inner {
          max-width: 1320px;
          margin: 0 auto;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }
        .pst-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .pst-badge-brand {
          background: rgba(255, 255, 255, 0.16);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #ffffff;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          padding: 4px 10px;
          border-radius: 6px;
          text-transform: uppercase;
        }
        .pst-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 8px #34d399;
        }
        .pst-title {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
        }
        .pst-subtitle {
          margin: 5px 0 0 0;
          font-size: 12px;
          color: #dbeafe;
        }
        .pst-actions {
          display: flex;
          gap: 10px;
        }
        .btn-header-ghost {
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #ffffff;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-header-ghost:hover { background: rgba(255, 255, 255, 0.22); }
        .btn-header-ghost:disabled { opacity: 0.55; cursor: not-allowed; }
        .btn-header-white {
          background: #ffffff;
          border: 1px solid #ffffff;
          color: #1d4ed8;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-header-white:hover { background: #eff6ff; }
        .btn-primary {
          background: #1d4ed8;
          border: 1px solid #1e40af;
          color: #ffffff;
          padding: 9px 18px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-primary:hover { background: #1e40af; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .pst-container {
          max-width: 1320px;
          margin: 0 auto;
          padding: 24px;
        }
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(175px, 1fr));
          gap: 14px;
          margin-bottom: 22px;
        }
        .kpi-card {
          background: #ffffff;
          border: 1px solid #dbeafe;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(15, 41, 92, 0.04);
        }
        .kpi-label {
          margin: 0;
          font-size: 12px;
          font-weight: 600;
          color: #475569;
        }
        .kpi-value {
          margin: 6px 0 0 0;
          font-size: 26px;
          font-weight: 800;
          color: #1d4ed8;
        }
        .toolbar {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
        }
        .tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .tab-btn {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #1e3a8a;
          padding: 7px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }
        .tab-btn:hover {
          background: #eff6ff;
          border-color: #93c5fd;
        }
        .tab-btn.active {
          background: #1d4ed8;
          border-color: #1d4ed8;
          color: #ffffff;
        }
        .search-input {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #0f295c;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 12px;
          width: 310px;
          max-width: 100%;
          outline: none;
        }
        .search-input::placeholder { color: #94a3b8; }
        .search-input:focus {
          border-color: #1d4ed8;
          box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.12);
        }
        .split-grid {
          display: grid;
          grid-template-columns: 420px 1fr;
          gap: 20px;
          align-items: start;
        }
        @media (max-width: 960px) {
          .split-grid { grid-template-columns: 1fr; }
        }
        .ticket-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 700px;
          overflow-y: auto;
        }
        .ticket-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 15px;
          text-align: left;
          cursor: pointer;
          color: #0f295c;
          width: 100%;
          transition: all 0.15s;
          box-shadow: 0 1px 2px rgba(15, 41, 92, 0.03);
        }
        .ticket-card:hover {
          border-color: #93c5fd;
          background: #f8fafc;
        }
        .ticket-card.selected {
          background: #eff6ff;
          border: 1.5px solid #1d4ed8;
          box-shadow: 0 4px 12px rgba(29, 78, 216, 0.08);
        }
        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }
        .folio {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 12px;
          font-weight: 700;
          color: #1d4ed8;
        }
        .badge {
          font-size: 11px;
          font-weight: 700;
          padding: 2px 9px;
          border-radius: 999px;
          border: 1px solid;
        }
        .card-subject {
          margin: 8px 0 4px 0;
          font-size: 14px;
          font-weight: 700;
          color: #0f295c;
        }
        .card-meta {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #3b5998;
          font-weight: 500;
        }
        .card-footer {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
          padding-top: 8px;
          border-top: 1px solid #e2e8f0;
          font-size: 11px;
          font-weight: 600;
        }
        .inspector {
          background: #ffffff;
          border: 1px solid #dbeafe;
          border-radius: 12px;
          padding: 22px;
          box-shadow: 0 2px 8px rgba(15, 41, 92, 0.04);
        }
        .inspector-header {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          padding-bottom: 14px;
          border-bottom: 1px solid #e2e8f0;
        }
        .status-select {
          background: #eff6ff;
          border: 1px solid #93c5fd;
          color: #1e3a8a;
          font-weight: 600;
          padding: 7px 12px;
          border-radius: 8px;
          font-size: 12px;
          cursor: pointer;
        }
        .ghl-strip {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 11px;
          font-weight: 500;
          color: #475569;
          padding: 10px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        .thread {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin: 16px 0;
          max-height: 320px;
          overflow-y: auto;
        }
        .msg-box {
          border-radius: 10px;
          padding: 12px 14px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
        }
        .msg-box.mentor {
          background: #eff6ff;
          border-color: #bfdbfe;
          margin-left: 18px;
        }
        .msg-box.internal {
          background: #fffbeb;
          border-color: #fde68a;
        }
        .msg-header {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #64748b;
          margin-bottom: 6px;
        }
        .msg-body {
          margin: 0;
          font-size: 13px;
          line-height: 1.5;
          color: #0f295c;
          white-space: pre-wrap;
        }
        .reply-form {
          border-top: 1px solid #e2e8f0;
          padding-top: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .reply-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }
        .reply-textarea {
          width: 100%;
          box-sizing: border-box;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #0f295c;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 13px;
          font-family: inherit;
          resize: vertical;
          outline: none;
        }
        .reply-textarea::placeholder { color: #94a3b8; }
        .reply-textarea:focus {
          border-color: #1d4ed8;
          box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.12);
        }
      `}</style>

      {/* Blue Pro Sales Header */}
      <div className="pst-header-band">
        <div className="pst-header-inner">
          <div>
            <div className="pst-title-row">
              <span className="pst-badge-brand">Pro Sales Training</span>
              <span className="pst-dot" />
              <h1 className="pst-title">Centro de Operaciones y Soporte</h1>
            </div>
            <p className="pst-subtitle">
              Gestión académica y técnica • Sincronizado en tiempo real con GoHighLevel (PST | Support Operations)
            </p>
          </div>

          <div className="pst-actions">
            <button
              onClick={handleProcessOutbox}
              disabled={syncingOutbox}
              className="btn-header-ghost"
            >
              {syncingOutbox
                ? 'Sincronizando GHL...'
                : `Sincronizar Cola GHL (${stats.outboxPending})`}
            </button>
            <button onClick={loadDashboard} className="btn-header-white">
              Actualizar
            </button>
          </div>
        </div>
      </div>

      <div className="pst-container">
        {/* KPI Cards */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <p className="kpi-label">Total Tickets</p>
            <p className="kpi-value">{stats.total}</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Activos / En Curso</p>
            <p className="kpi-value" style={{ color: '#2563eb' }}>{stats.open}</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Esperando Alumno</p>
            <p className="kpi-value" style={{ color: '#059669' }}>{stats.waitingStudent}</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Escalados</p>
            <p className="kpi-value" style={{ color: '#e11d48' }}>{stats.escalated}</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Resueltos</p>
            <p className="kpi-value" style={{ color: '#1e3a8a' }}>{stats.resolved}</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Errores Sync GHL</p>
            <p
              className="kpi-value"
              style={{ color: stats.syncErrors > 0 ? '#e11d48' : '#059669' }}
            >
              {stats.syncErrors}
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="tabs">
            {[
              { id: 'ALL', label: 'Todos' },
              { id: 'OPEN_GROUP', label: 'Abiertos' },
              { id: 'WAITING_STUDENT', label: 'Esperando Alumno' },
              { id: 'ESCALATED', label: 'Escalados' },
              { id: 'RESOLVED', label: 'Resueltos' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`tab-btn ${statusFilter === tab.id ? 'active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar folio, alumno, correo o programa..."
            className="search-input"
          />
        </div>

        {/* Split View */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#1d4ed8', fontSize: 13, fontWeight: 600 }}>
            Cargando operaciones de Pro Sales Training...
          </div>
        ) : (
          <div className="split-grid">
            {/* Ticket List */}
            <div className="ticket-list">
              {filteredTickets.length === 0 ? (
                <div className="kpi-card" style={{ textAlign: 'center', color: '#64748b', fontSize: 12 }}>
                  No hay tickets que coincidan con este filtro.
                </div>
              ) : (
                filteredTickets.map((ticket) => {
                  const meta = STATUS_META[ticket.status] || {
                    label: ticket.status,
                    bg: '#f1f5f9',
                    color: '#334155',
                    border: '#cbd5e1',
                  };
                  const isSelected = ticket.id === selectedTicket?.id;

                  return (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className={`ticket-card ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="card-top">
                        <span className="folio">{ticket.ticket_number}</span>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: meta.bg,
                            color: meta.color,
                            borderColor: meta.border,
                          }}
                        >
                          {meta.label}
                        </span>
                      </div>

                      <p className="card-subject">{ticket.subject}</p>

                      <div className="card-meta">
                        <span>{ticket.student_name}</span>
                        <span>{ticket.program}</span>
                      </div>

                      <div className="card-footer">
                        <span
                          style={{
                            color:
                              ticket.sync_status === 'SYNCED'
                                ? '#059669'
                                : ticket.sync_status === 'ERROR'
                                ? '#e11d48'
                                : '#d97706',
                          }}
                        >
                          GHL: {ticket.sync_status}
                        </span>
                        <span style={{ color: '#64748b' }}>
                          {new Date(ticket.updated_at).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Detail Inspector */}
            <div className="inspector">
              {!selectedTicket ? (
                <div style={{ textAlign: 'center', padding: '80px 0', color: '#64748b', fontSize: 13 }}>
                  Selecciona un ticket de la izquierda para ver los detalles.
                </div>
              ) : (
                <>
                  <div className="inspector-header">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="folio">{selectedTicket.ticket_number}</span>
                        <span style={{ color: '#94a3b8' }}>•</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#2563eb' }}>
                          {selectedTicket.program}
                        </span>
                      </div>
                      <h2 style={{ margin: '6px 0 4px 0', fontSize: 16, fontWeight: 700, color: '#0f295c' }}>
                        {selectedTicket.subject}
                      </h2>
                      <p style={{ margin: 0, fontSize: 12, color: '#3b5998' }}>
                        {selectedTicket.student_name} ({selectedTicket.student_email})
                      </p>
                    </div>

                    <select
                      value={selectedTicket.status}
                      disabled={submitting}
                      onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="NEW">Nuevo</option>
                      <option value="IN_REVIEW">En Revisión</option>
                      <option value="IN_PROGRESS">En Progreso</option>
                      <option value="WAITING_STUDENT">Esperando Alumno</option>
                      <option value="ESCALATED">Escalado</option>
                      <option value="RESOLVED">Resuelto</option>
                      <option value="CLOSED">Cerrado</option>
                    </select>
                  </div>

                  <div className="ghl-strip">
                    <span>Contact ID: {selectedTicket.ghl_contact_id || '—'}</span>
                    <span>•</span>
                    <span>Opp ID: {selectedTicket.ghl_opportunity_id || '—'}</span>
                    <span>•</span>
                    <span>Object ID: {selectedTicket.ghl_record_id || '—'}</span>
                  </div>

                  <div className="thread">
                    <div className="msg-box">
                      <div className="msg-header">
                        <strong style={{ color: '#0f295c' }}>
                          {selectedTicket.student_name} (Descripción inicial)
                        </strong>
                        <span>{new Date(selectedTicket.created_at).toLocaleString('es-MX')}</span>
                      </div>
                      <p className="msg-body">{selectedTicket.description}</p>
                    </div>

                    {selectedTicket.messages.map((msg) => {
                      const isMentor = msg.sender_role === 'mentor';
                      const isInternal = msg.visibility === 'internal';
                      return (
                        <div
                          key={msg.id}
                          className={`msg-box ${isInternal ? 'internal' : isMentor ? 'mentor' : ''}`}
                        >
                          <div className="msg-header">
                            <strong
                              style={{
                                color: isInternal
                                  ? '#b45309'
                                  : isMentor
                                  ? '#1d4ed8'
                                  : '#0f295c',
                              }}
                            >
                              {msg.sender_name}{' '}
                              {isInternal ? '(Nota Interna)' : isMentor ? '(Mentor PST)' : '(Alumno)'}
                            </strong>
                            <span>{new Date(msg.created_at).toLocaleString('es-MX')}</span>
                          </div>
                          <p className="msg-body">{msg.body}</p>
                        </div>
                      );
                    })}
                  </div>

                  <form onSubmit={handleSendReply} className="reply-form">
                    <div className="reply-controls">
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#0f295c' }}>
                        Responder al ticket
                      </span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => setReplyVisibility('public')}
                          className={`tab-btn ${replyVisibility === 'public' ? 'active' : ''}`}
                        >
                          Respuesta Pública (Alumno)
                        </button>
                        <button
                          type="button"
                          onClick={() => setReplyVisibility('internal')}
                          className={`tab-btn ${replyVisibility === 'internal' ? 'active' : ''}`}
                        >
                          Nota Interna
                        </button>
                      </div>
                    </div>

                    <textarea
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={
                        replyVisibility === 'public'
                          ? 'Escribe la respuesta que verá el alumno en Whop...'
                          : 'Escribe una nota interna solo visible para el equipo de Pro Sales Training...'
                      }
                      className="reply-textarea"
                    />

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="submit"
                        disabled={submitting || !replyText.trim()}
                        className="btn-primary"
                      >
                        {submitting
                          ? 'Enviando...'
                          : replyVisibility === 'public'
                          ? 'Enviar Respuesta al Alumno'
                          : 'Guardar Nota Interna'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}