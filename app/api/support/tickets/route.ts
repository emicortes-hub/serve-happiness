import { NextResponse } from 'next/server';
import { getVerifiedWhopSession } from '@/lib/whop';
import { createTicketInputSchema } from '@/lib/support/ticket-validation';
import {
  createSupportTicket,
  sendTelegramFallbackAlert,
  transitionSupportTicketStatus,
} from '@/lib/support/ticket-service';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const session = await getVerifiedWhopSession(req.headers);
    const studentWhopId = session?.userId || searchParams.get('studentWhopId');

    if (!studentWhopId) {
      return NextResponse.json({ ok: false, error: 'Identidad de alumno requerida' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('support_tickets')
      .select(
        'id, ticket_number, program, subject, description, status, priority, resolution, created_at, updated_at, resolved_at'
      )
      .eq('student_whop_id', studentWhopId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ ok: true, tickets: data || [] });
  } catch (error: any) {
    console.error('Error listando tickets:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const parsed = createTicketInputSchema.safeParse(rawBody);

    if (!parsed.success) {
      console.warn('Validación 400 en /api/support/tickets:', parsed.error.flatten(), rawBody);
      return NextResponse.json(
        { ok: false, error: 'Datos de ticket inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const input = parsed.data;
    const session = await getVerifiedWhopSession(req.headers);

    const tenantId =
      input.tenantId || input.companyId || input.company_id || 'biz_jbDM2ID0GqGW3z';
    const experienceId = input.experienceId || input.experience_id || null;
    const studentWhopId =
      session?.userId ||
      input.studentWhopId ||
      input.whopUserId ||
      input.student_whop_id ||
      'unverified_guest';

    const studentName = (input.studentName || input.name || input.user_name || 'Alumno').trim();
    const studentEmail = (
      input.studentEmail ||
      input.email ||
      input.user_email ||
      'sin-correo@prosales.local'
    ).trim();
    const studentPhone = (input.studentPhone || input.whatsapp || '').trim() || null;
    const program = (input.program || 'Consulta General').trim();
    const description = (input.description || input.message || '').trim();
    const subject = (input.subject || `${program} - ${studentName}`).trim();
    const actionType = (input.type || 'create').toLowerCase();
    const caseId = (input.caseId || input.case_id || '').trim();

    // Acción sobre un ticket existente (escalación o resolución)
    if (actionType === 'escalation' || actionType === 'resolved') {
      if (!caseId) {
        console.warn('Error 400: falta caseId para acción', actionType, rawBody);
        return NextResponse.json(
          { ok: false, error: 'Folio requerido para actualizar estado' },
          { status: 400 }
        );
      }

      const nextStatus = actionType === 'resolved' ? 'RESOLVED' : 'ESCALATED';
      const updated = await transitionSupportTicketStatus({
        ticketIdentifier: caseId,
        nextStatus,
        actorType: 'student',
        actorId: studentWhopId,
        reason:
          actionType === 'escalation' ? 'Escalado por el alumno desde portal SERVE' : undefined,
      });

      await sendTelegramFallbackAlert({
        tenantId,
        ticketNumber: updated.ticket_number,
        studentName: updated.student_name,
        studentEmail: updated.student_email,
        studentPhone: updated.student_phone,
        program: updated.program,
        description: updated.description,
        type: actionType === 'resolved' ? 'resolved' : 'escalation',
      });

      return NextResponse.json({ ok: true, ticket: updated, caseId: updated.ticket_number });
    }

    if (!description) {
      console.warn('Error 400: descripción/mensaje vacío en ticket', rawBody);
      return NextResponse.json(
        { ok: false, error: 'La descripción o mensaje es obligatorio' },
        { status: 400 }
      );
    }

    // 1. Guardar atómicamente en Supabase (genera PST-2026-000001 + mensaje + evento + outbox)
    const ticket = await createSupportTicket({
      tenantId,
      experienceId,
      studentWhopId,
      studentName,
      studentEmail,
      studentPhone,
      program,
      subject,
      description,
    });

    // 2. Disparar alerta no bloqueante a Telegram
    await sendTelegramFallbackAlert({
      tenantId,
      ticketNumber: ticket.ticket_number,
      studentName: ticket.student_name,
      studentEmail: ticket.student_email,
      studentPhone: ticket.student_phone,
      program: ticket.program,
      description: ticket.description,
      type: 'create',
    });

    return NextResponse.json({
      ok: true,
      ticket,
      caseId: ticket.ticket_number,
    });
  } catch (error: any) {
    console.error('Error 500 en /api/support/tickets:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}