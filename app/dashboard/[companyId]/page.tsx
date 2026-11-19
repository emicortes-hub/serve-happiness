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
  NEW: { label: 'Nuevo', bg: 'rgba(14,165,233,0.15)', color: '#38bdf8', border: 'rgba(14,165,233,0.35)' },
  IN_REVIEW: { label: 'En Revisión', bg: 'rgba(99,102,241,0.15)', color: '#818cf8', border: 'rgba(99,102,241,0.35)' },
  ASSIGNED: { label: 'Asignado', bg: 'rgba(168,85,247,0.15)', color: '#c084fc', border: 'rgba(168,85,247,0.35)' },
  IN_PROGRESS: { label: 'En Progreso', bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: 'rgba(245,158,11,0.35)' },
  WAITING_STUDENT: { label: 'Esperando Alumno', bg: 'rgba(16,185,129,0.15)', color: '#34d399', border: 'rgba(16,185,129,0.35)' },
  ESCALATED: { label: 'Escalado', bg: 'rgba(244,63,94,0.15)', color: '#fb7185', border: 'rgba(244,63,94,0.35)' },
  RESOLVED: { label: 'Resuelto', bg: 'rgba(113,113,122,0.2)', color: '#d4d4d8', border: 'rgba(113,113,122,0.4)' },
  CLOSED: { label: 'Cerrado', bg: 'rgba(39,39,42,0.6)', color: '#71717a', border: '#3f3f46' },
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
    <div className="ops-root">
      <style>{`
        .ops-root {
          min-height: 100vh;
          background-color: #09090b;
          color: #f4f4f5;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          padding: 24px;
          box-sizing: border-box;
        }
        .ops-container {
          max-width: 1320px;
          margin: 0 auto;
        }
        .ops-header {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding-bottom: 20px;
          border-bottom: 1px solid #27272a;
          margin-bottom: 22px;
        }
        .ops-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ops-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 10px #10b981;
        }
        .ops-title {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
        }
        .ops-subtitle {
          margin: 4px 0 0 0;
          font-size: 12px;
          color: #a1a1aa;
        }
        .ops-actions {
          display: flex;
          gap: 10px;
        }
        .btn-secondary {
          background: #18181b;
          border: 1px solid #3f3f46;
          color: #e4e4e7;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
        }
        .btn-secondary:hover { background: #27272a; }
        .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-primary {
          background: #7c3aed;
          border: 1px solid #8b5cf6;
          color: #ffffff;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-primary:hover { background: #6d28d9; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
          gap: 12px;
          margin-bottom: 22px;
        }
        .kpi-card {
          background: #121216;
          border: 1px solid #27272a;
          border-radius: 12px;
          padding: 16px;
        }
        .kpi-label {
          margin: 0;
          font-size: 12px;
          color: #a1a1aa;
        }
        .kpi-value {
          margin: 6px 0 0 0;
          font-size: 26px;
          font-weight: 700;
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
          background: #121216;
          border: 1px solid #27272a;
          color: #a1a1aa;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
        }
        .tab-btn.active {
          background: rgba(124, 58, 237, 0.2);
          border-color: #8b5cf6;
          color: #ddd6fe;
        }
        .search-input {
          background: #121216;
          border: 1px solid #27272a;
          color: #f4f4f5;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 12px;
          width: 300px;
          max-width: 100%;
          outline: none;
        }
        .search-input:focus { border-color: #8b5cf6; }
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
          background: #121216;
          border: 1px solid #27272a;
          border-radius: 12px;
          padding: 14px;
          text-align: left;
          cursor: pointer;
          color: inherit;
          width: 100%;
          transition: border-color 0.15s;
        }
        .ticket-card:hover { border-color: #3f3f46; }
        .ticket-card.selected {
          background: #18181f;
          border-color: #8b5cf6;
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
          font-weight: 600;
          color: #c084fc;
        }
        .badge {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 999px;
          border: 1px solid;
        }
        .card-subject {
          margin: 8px 0 4px 0;
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
        }
        .card-meta {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #a1a1aa;
        }
        .card-footer {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
          padding-top: 8px;
          border-top: 1px solid #27272a;
          font-size: 11px;
        }
        .inspector {
          background: #121216;
          border: 1px solid #27272a;
          border-radius: 12px;
          padding: 20px;
        }
        .inspector-header {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          padding-bottom: 14px;
          border-bottom: 1px solid #27272a;
        }
        .status-select {
          background: #18181b;
          border: 1px solid #3f3f46;
          color: #f4f4f5;
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 12px;
        }
        .ghl-strip {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 11px;
          color: #71717a;
          padding: 10px 0;
          border-bottom: 1px solid #27272a;
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
          border: 1px solid #27272a;
          background: #18181b;
        }
        .msg-box.mentor {
          background: rgba(124, 58, 237, 0.12);
          border-color: rgba(139, 92, 246, 0.35);
          margin-left: 18px;
        }
        .msg-box.internal {
          background: rgba(245, 158, 11, 0.1);
          border-color: rgba(245, 158, 11, 0.35);
        }
        .msg-header {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #a1a1aa;
          margin-bottom: 6px;
        }
        .msg-body {
          margin: 0;
          font-size: 13px;
          line-height: 1.5;
          color: #e4e4e7;
          white-space: pre-wrap;
        }
        .reply-form {
          border-top: 1px solid #27272a;
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
          background: #18181b;
          border: 1px solid #3f3f46;
          color: #f4f4f5;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 13px;
          font-family: inherit;
          resize: vertical;
          outline: none;
        }
        .reply-textarea:focus { border-color: #8b5cf6; }
      `}</style>

      <div className="ops-container">
        {/* Header */}
        <div className="ops-header">
          <div>
            <div className="ops-title-row">
              <span className="ops-dot" />
              <h1 className="ops-title">SERVE Support 2.0 — Centro de Operaciones</h1>
            </div>
            <p className="ops-subtitle">
              Monitoreo en tiempo real sincronizado con GoHighLevel (PST | Support Operations)
            </p>
          </div>

          <div className="ops-actions">
            <button
              onClick={handleProcessOutbox}
              disabled={syncingOutbox}
              className="btn-secondary"
            >
              {syncingOutbox
                ? 'Sincronizando GHL...'
                : `Sincronizar Cola GHL (${stats.outboxPending})`}
            </button>
            <button onClick={loadDashboard} className="btn-primary">
              Actualizar
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <p className="kpi-label">Total Tickets</p>
            <p className="kpi-value" style={{ color: '#ffffff' }}>{stats.total}</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Activos / En Curso</p>
            <p className="kpi-value" style={{ color: '#fbbf24' }}>{stats.open}</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Esperando Alumno</p>
            <p className="kpi-value" style={{ color: '#34d399' }}>{stats.waitingStudent}</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Escalados</p>
            <p className="kpi-value" style={{ color: '#fb7185' }}>{stats.escalated}</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Resueltos</p>
            <p className="kpi-value" style={{ color: '#d4d4d8' }}>{stats.resolved}</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Errores Sync GHL</p>
            <p
              className="kpi-value"
              style={{ color: stats.syncErrors > 0 ? '#fb7185' : '#34d399' }}
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
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#71717a', fontSize: 13 }}>
            Cargando operaciones...
          </div>
        ) : (
          <div className="split-grid">
            {/* Ticket List */}
            <div className="ticket-list">
              {filteredTickets.length === 0 ? (
                <div className="kpi-card" style={{ textAlign: 'center', color: '#71717a', fontSize: 12 }}>
                  No hay tickets que coincidan con este filtro.
                </div>
              ) : (
                filteredTickets.map((ticket) => {
                  const meta = STATUS_META[ticket.status] || {
                    label: ticket.status,
                    bg: '#27272a',
                    color: '#d4d4d8',
                    border: '#3f3f46',
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
                                ? '#34d399'
                                : ticket.sync_status === 'ERROR'
                                ? '#fb7185'
                                : '#fbbf24',
                          }}
                        >
                          GHL: {ticket.sync_status}
                        </span>
                        <span style={{ color: '#71717a' }}>
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
                <div style={{ textAlign: 'center', padding: '80px 0', color: '#71717a', fontSize: 13 }}>
                  Selecciona un ticket de la izquierda para ver los detalles.
                </div>
              ) : (
                <>
                  <div className="inspector-header">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="folio">{selectedTicket.ticket_number}</span>
                        <span style={{ color: '#52525b' }}>•</span>
                        <span style={{ fontSize: 12, color: '#a1a1aa' }}>
                          {selectedTicket.program}
                        </span>
                      </div>
                      <h2 style={{ margin: '6px 0 4px 0', fontSize: 16, color: '#ffffff' }}>
                        {selectedTicket.subject}
                      </h2>
                      <p style={{ margin: 0, fontSize: 12, color: '#a1a1aa' }}>
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
                        <strong style={{ color: '#e4e4e7' }}>
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
                                  ? '#fcd34d'
                                  : isMentor
                                  ? '#d8b4fe'
                                  : '#e4e4e7',
                              }}
                            >
                              {msg.sender_name}{' '}
                              {isInternal ? '(Nota Interna)' : isMentor ? '(Mentor)' : '(Alumno)'}
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
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#d4d4d8' }}>
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
                          : 'Escribe una nota interna solo visible para el equipo...'
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