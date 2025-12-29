/**
 * Time Off Request Types
 * Type definitions for employee time off requests
 */

export type TimeOffStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export type TimeOffType = 'vacation' | 'sick' | 'personal' | 'other'

export interface TimeOffRequest {
  id: string
  userId: string
  userName: string
  startDate: Date
  endDate: Date
  totalDays: number
  type: TimeOffType
  status: TimeOffStatus
  reason?: string
  notes?: string
  requestedAt: Date
  respondedAt?: Date
  respondedBy?: string
  rejectionReason?: string
}

export interface TimeOffStats {
  pending: number
  approved: number
  rejected: number
  totalDaysUsed: number
  totalDaysAllowed: number
  remainingDays: number
}

// Helper function to calculate days between dates
export function calculateDaysBetween(startDate: Date, endDate: Date): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays + 1 // Include both start and end date
}

