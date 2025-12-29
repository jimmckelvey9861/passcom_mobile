/**
 * Mock Time Off Request Data
 * For testing and development purposes
 */

import { TimeOffRequest, TimeOffStats } from '@/types/timeOff'

// Mock time off requests
export const mockTimeOffRequests: TimeOffRequest[] = [
  {
    id: 'to-1',
    userId: 'u-1',
    userName: 'Pete Seager',
    startDate: new Date(2024, 11, 25), // Dec 25, 2024
    endDate: new Date(2024, 11, 27),   // Dec 27, 2024
    totalDays: 3,
    type: 'vacation',
    status: 'pending',
    reason: 'Holiday vacation with family',
    requestedAt: new Date(2024, 10, 15),
  },
  {
    id: 'to-2',
    userId: 'u-1',
    userName: 'Pete Seager',
    startDate: new Date(2025, 0, 10), // Jan 10, 2025
    endDate: new Date(2025, 0, 10),
    totalDays: 1,
    type: 'personal',
    status: 'pending',
    reason: 'Doctor appointment',
    requestedAt: new Date(2024, 11, 20),
  },
  {
    id: 'to-3',
    userId: 'u-1',
    userName: 'Pete Seager',
    startDate: new Date(2024, 10, 1), // Nov 1, 2024
    endDate: new Date(2024, 10, 5),   // Nov 5, 2024
    totalDays: 5,
    type: 'vacation',
    status: 'approved',
    reason: 'Thanksgiving week',
    requestedAt: new Date(2024, 9, 1),
    respondedAt: new Date(2024, 9, 5),
    respondedBy: 'Robert Zhang',
  },
  {
    id: 'to-4',
    userId: 'u-1',
    userName: 'Pete Seager',
    startDate: new Date(2024, 9, 15), // Oct 15, 2024
    endDate: new Date(2024, 9, 15),
    totalDays: 1,
    type: 'sick',
    status: 'approved',
    reason: 'Flu symptoms',
    requestedAt: new Date(2024, 9, 15),
    respondedAt: new Date(2024, 9, 15),
    respondedBy: 'Robert Zhang',
  },
  {
    id: 'to-5',
    userId: 'u-1',
    userName: 'Pete Seager',
    startDate: new Date(2024, 8, 20), // Sep 20, 2024
    endDate: new Date(2024, 8, 22),   // Sep 22, 2024
    totalDays: 3,
    type: 'vacation',
    status: 'approved',
    reason: 'Long weekend trip',
    requestedAt: new Date(2024, 8, 1),
    respondedAt: new Date(2024, 8, 3),
    respondedBy: 'Robert Zhang',
  },
  {
    id: 'to-6',
    userId: 'u-1',
    userName: 'Pete Seager',
    startDate: new Date(2024, 11, 31), // Dec 31, 2024
    endDate: new Date(2025, 0, 2),     // Jan 2, 2025
    totalDays: 3,
    type: 'vacation',
    status: 'rejected',
    reason: 'New Year celebration',
    rejectionReason: 'Too many staff already off during this period',
    requestedAt: new Date(2024, 11, 1),
    respondedAt: new Date(2024, 11, 3),
    respondedBy: 'Robert Zhang',
  },
]

// Mock stats
export const mockTimeOffStats: TimeOffStats = {
  pending: 2,
  approved: 3,
  rejected: 1,
  totalDaysUsed: 9,
  totalDaysAllowed: 15,
  remainingDays: 6,
}

