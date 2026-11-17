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

// Esquema flexible: acepta camelCase, snake_case y valores null/vacíos del formulario v1.0
export const createTicketInputSchema = z
  .object({
    tenantId: z.string().nullable().optional(),
    companyId: z.string().nullable().optional(),
    company_id: z.string().nullable().optional(),
    experienceId: z.string().nullable().optional(),
    experience_id: z.string().nullable().optional(),
    studentWhopId: z.string().nullable().optional(),
    whopUserId: z.string().nullable().optional(),
    student_whop_id: z.string().nullable().optional(),
    studentName: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    user_name: z.string().nullable().optional(),
    studentEmail: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    user_email: z.string().nullable().optional(),
    studentPhone: z.string().nullable().optional(),
    whatsapp: z.string().nullable().optional(),
    program: z.string().nullable().optional(),
    subject: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    message: z.string().nullable().optional(),
    type: z.string().nullable().optional(),
    caseId: z.string().nullable().optional(),
    case_id: z.string().nullable().optional(),
  })
  .passthrough();

export const transitionTicketSchema = z.object({
  ticketIdentifier: z.string().min(1),
  nextStatus: z.enum(TICKET_STATUSES),
  reason: z.string().max(1000).optional(),
  resolution: z.string().max(2000).optional(),
});