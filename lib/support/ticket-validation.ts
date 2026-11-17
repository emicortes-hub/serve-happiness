import { z } from 'zod';

export const TICKET_STATUSES = [
  'NEW',
  'IN_REVIEW',
  'ASSIGNED',
  'IN_PROGRESS',
  'WAITING_STUDENT',
  'ESCALATED',
  'RESOLVED',
  'CLOSED',
  'REOPENED',
] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_PRIORITIES = ['P1', 'P2', 'P3', 'P4'] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export const ALLOWED_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  NEW: ['IN_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED'],
  IN_REVIEW: ['ASSIGNED', 'IN_PROGRESS', 'WAITING_STUDENT', 'ESCALATED', 'RESOLVED', 'CLOSED'],
  ASSIGNED: ['IN_PROGRESS', 'WAITING_STUDENT', 'ESCALATED', 'RESOLVED', 'CLOSED'],
  IN_PROGRESS: ['WAITING_STUDENT', 'ESCALATED', 'RESOLVED', 'CLOSED'],
  WAITING_STUDENT: ['IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED'],
  ESCALATED: ['IN_PROGRESS', 'WAITING_STUDENT', 'RESOLVED', 'CLOSED'],
  RESOLVED: ['CLOSED', 'REOPENED'],
  CLOSED: ['REOPENED'],
  REOPENED: ['IN_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED'],
};

export function canTransitionStatus(from: TicketStatus, to: TicketStatus): boolean {
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

// Esquema compatible con el formulario v1.0 actual y la API 2.0
export const createTicketInputSchema = z.object({
  tenantId: z.string().min(1).optional(),
  companyId: z.string().min(1).optional(),
  experienceId: z.string().optional().nullable(),
  studentWhopId: z.string().optional(),
  whopUserId: z.string().optional(),
  studentName: z.string().min(2).max(150).optional(),
  name: z.string().min(2).max(150).optional(),
  studentEmail: z.string().email().optional(),
  email: z.string().email().optional(),
  studentPhone: z.string().max(40).optional().nullable(),
  whatsapp: z.string().max(40).optional().nullable(),
  program: z.string().max(120).optional().nullable(),
  subject: z.string().max(200).optional(),
  description: z.string().min(3).max(5000).optional(),
  message: z.string().min(3).max(5000).optional(),
  type: z.enum(['create', 'escalation', 'resolved']).optional(),
  caseId: z.string().optional(), // Ignorado como fuente de verdad; se genera en Postgres
});

export const transitionTicketSchema = z.object({
  ticketIdentifier: z.string().min(1), // UUID o ticket_number (PST-2026-000001)
  nextStatus: z.enum(TICKET_STATUSES),
  reason: z.string().max(1000).optional(),
  resolution: z.string().max(2000).optional(),
});