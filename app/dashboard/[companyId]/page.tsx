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

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  NEW: { label: 'Nuevo', color: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
  IN_REVIEW: { label: 'En Revisión', color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' },
  ASSIGNED: { label: 'Asignado', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  IN_PROGRESS: { label: 'En Progreso', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  WAITING_STUDENT: {
    label: 'Esperando Alumno',
    color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  ESCALATED: { label: 'Escalado', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
  RESOLVED: { label: 'Resuelto', color: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30' },
  CLOSED: { label: 'Cerrado', color: 'bg-zinc-800 text-zinc-500 border-zinc-700' },
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
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h1 className="text-xl font-semibold tracking-tight text-white">
                SERVE Support 2.0 — Centro de Operaciones
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Monitoreo en tiempo real sincronizado con GoHighLevel (`PST | Support Operations`)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleProcessOutbox}
              disabled={syncingOutbox}
              className="px-3.5 py-2 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 transition disabled:opacity-50"
            >
              {syncingOutbox
                ? 'Sincronizando GHL...'
                : `Sincronizar Cola GHL (${stats.outboxPending})`}
            </button>
            <button
              onClick={loadDashboard}
              className="px-3.5 py-2 rounded-lg text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white transition"
            >
              Actualizar
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="bg-[#121216] border border-zinc-800/80 rounded-xl p-4">
            <p className="text-xs text-zinc-400">Total Tickets</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
          </div>
          <div className="bg-[#121216] border border-zinc-800/80 rounded-xl p-4">
            <p className="text-xs text-zinc-400">Activos / En Curso</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{stats.open}</p>
          </div>
          <div className="bg-[#121216] border border-zinc-800/80 rounded-xl p-4">
            <p className="text-xs text-zinc-400">Esperando Alumno</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.waitingStudent}</p>
          </div>
          <div className="bg-[#121216] border border-zinc-800/80 rounded-xl p-4">
            <p className="text-xs text-zinc-400">Escalados</p>
            <p className="text-2xl font-bold text-rose-400 mt-1">{stats.escalated}</p>
          </div>
          <div className="bg-[#121216] border border-zinc-800/80 rounded-xl p-4">
            <p className="text-xs text-zinc-400">Resueltos</p>
            <p className="text-2xl font-bold text-zinc-300 mt-1">{stats.resolved}</p>
          </div>
          <div className="bg-[#121216] border border-zinc-800/80 rounded-xl p-4">
            <p className="text-xs text-zinc-400">Errores Sync GHL</p>
            <p
              className={`text-2xl font-bold mt-1 ${
                stats.syncErrors > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {stats.syncErrors}
            </p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex flex-wrap gap-2">
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
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                  statusFilter === tab.id
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                    : 'bg-[#121216] border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
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
            className="bg-[#121216] border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 w-full md:w-80"
          />
        </div>

        {/* Main Split View: Ticket List + Detail Inspector */}
        {loading ? (
          <div className="text-center py-16 text-sm text-zinc-500">Cargando operaciones...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Ticket Queue */}
            <div className="lg:col-span-5 space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
              {filteredTickets.length === 0 ? (
                <div className="bg-[#121216] border border-zinc-800/80 rounded-xl p-8 text-center text-xs text-zinc-500">
                  No hay tickets que coincidan con este filtro.
                </div>
              ) : (
                filteredTickets.map((ticket) => {
                  const badge = STATUS_LABELS[ticket.status] || {
                    label: ticket.status,
                    color: 'bg-zinc-800 text-zinc-300 border-zinc-700',
                  };
                  const isSelected = ticket.id === selectedTicket?.id;

                  return (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className={`w-full text-left p-4 rounded-xl border transition ${
                        isSelected
                          ? 'bg-[#18181f] border-purple-500/70 shadow-lg shadow-purple-950/20'
                          : 'bg-[#121216] border-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-semibold text-purple-400">
                          {ticket.ticket_number}
                        </span>
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </div>

                      <p className="text-sm font-medium text-white mt-1.5 line-clamp-1">
                        {ticket.subject}
                      </p>

                      <div className="flex items-center justify-between text-xs text-zinc-400 mt-2">
                        <span>{ticket.student_name}</span>
                        <span className="text-[11px] text-zinc-500">{ticket.program}</span>
                      </div>

                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-zinc-800/70 text-[11px]">
                        <span
                          className={
                            ticket.sync_status === 'SYNCED'
                              ? 'text-emerald-400'
                              : ticket.sync_status === 'ERROR'
                              ? 'text-rose-400'
                              : 'text-amber-400'
                          }
                        >
                          GHL: {ticket.sync_status}
                        </span>
                        <span className="text-zinc-500">
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

            {/* Right Column: Ticket Detail & Reply Box */}
            <div className="lg:col-span-7 bg-[#121216] border border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between min-h-[540px]">
              {!selectedTicket ? (
                <div className="flex items-center justify-center h-full text-xs text-zinc-500">
                  Selecciona un ticket de la izquierda para ver los detalles.
                </div>
              ) : (
                <>
                  <div>
                    {/* Ticket Top Meta */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-purple-400">
                            {selectedTicket.ticket_number}
                          </span>
                          <span className="text-xs text-zinc-500">•</span>
                          <span className="text-xs text-zinc-400">{selectedTicket.program}</span>
                        </div>
                        <h2 className="text-base font-semibold text-white mt-1">
                          {selectedTicket.subject}
                        </h2>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {selectedTicket.student_name} ({selectedTicket.student_email})
                        </p>
                      </div>

                      <select
                        value={selectedTicket.status}
                        disabled={submitting}
                        onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                        className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
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

                    {/* GHL IDs Strip */}
                    <div className="flex flex-wrap gap-3 text-[11px] text-zinc-500 py-2.5 border-b border-zinc-800/60">
                      <span>Contact ID: {selectedTicket.ghl_contact_id || '—'}</span>
                      <span>•</span>
                      <span>Opp ID: {selectedTicket.ghl_opportunity_id || '—'}</span>
                      <span>•</span>
                      <span>Object ID: {selectedTicket.ghl_record_id || '—'}</span>
                    </div>

                    {/* Thread Messages */}
                    <div className="space-y-3 my-4 max-h-[300px] overflow-y-auto pr-1">
                      <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3.5">
                        <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                          <span className="font-medium text-zinc-200">
                            {selectedTicket.student_name} (Descripción inicial)
                          </span>
                          <span>
                            {new Date(selectedTicket.created_at).toLocaleString('es-MX')}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
                          {selectedTicket.description}
                        </p>
                      </div>

                      {selectedTicket.messages.map((msg) => {
                        const isMentor = msg.sender_role === 'mentor';
                        const isInternal = msg.visibility === 'internal';
                        return (
                          <div
                            key={msg.id}
                            className={`rounded-lg p-3.5 border ${
                              isInternal
                                ? 'bg-amber-950/20 border-amber-500/30'
                                : isMentor
                                ? 'bg-purple-950/25 border-purple-500/30 ml-4'
                                : 'bg-zinc-900/80 border-zinc-800 mr-4'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span
                                className={`font-medium ${
                                  isInternal
                                    ? 'text-amber-300'
                                    : isMentor
                                    ? 'text-purple-300'
                                    : 'text-zinc-200'
                                }`}
                              >
                                {msg.sender_name}{' '}
                                {isInternal ? '(Nota Interna)' : isMentor ? '(Mentor)' : '(Alumno)'}
                              </span>
                              <span className="text-zinc-500">
                                {new Date(msg.created_at).toLocaleString('es-MX')}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed">
                              {msg.body}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Admin Reply Form */}
                  <form onSubmit={handleSendReply} className="pt-3 border-t border-zinc-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-300">Responder al ticket</span>
                      <div className="flex items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setReplyVisibility('public')}
                          className={`px-2.5 py-1 rounded-md border ${
                            replyVisibility === 'public'
                              ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                          }`}
                        >
                          Respuesta Pública (Alumno)
                        </button>
                        <button
                          type="button"
                          onClick={() => setReplyVisibility('internal')}
                          className={`px-2.5 py-1 rounded-md border ${
                            replyVisibility === 'internal'
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                          }`}
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
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                    />

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submitting || !replyText.trim()}
                        className="px-4 py-2 rounded-lg text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white transition disabled:opacity-50"
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