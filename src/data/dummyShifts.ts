export interface Shift {
  id: string
  date: string // ISO date string
  startTime: string // "08:00"
  endTime: string // "16:00"
  assignedUserId: string
  assignedUserName: string
  job: string // "Server", "Cook", "Host", "Manager"
  status: 'scheduled' | 'clocked-in' | 'completed' | 'no-show'
  notes?: string
  breakMinutes?: number
}

// Jobs/Roles available
export const JOBS = [
  { id: 'server', label: 'Server', color: 'bg-blue-100 text-blue-800' },
  { id: 'cook', label: 'Cook', color: 'bg-orange-100 text-orange-800' },
  { id: 'host', label: 'Host', color: 'bg-purple-100 text-purple-800' },
  { id: 'manager', label: 'Manager', color: 'bg-green-100 text-green-800' },
  { id: 'dishwasher', label: 'Dishwasher', color: 'bg-gray-100 text-gray-800' },
  { id: 'bartender', label: 'Bartender', color: 'bg-pink-100 text-pink-800' },
]

// Helper to calculate hours for a shift
export function calculateShiftHours(shift: Shift): number {
  const [startHour, startMin] = shift.startTime.split(':').map(Number)
  const [endHour, endMin] = shift.endTime.split(':').map(Number)
  
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  const totalMinutes = endMinutes - startMinutes
  const breakMinutes = shift.breakMinutes || 0
  
  return (totalMinutes - breakMinutes) / 60
}

// Dummy shift data - distributed across multiple days
export const DUMMY_SHIFTS: Shift[] = [
  // Today's shifts
  {
    id: 'shift-today-1',
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '16:00',
    assignedUserId: 'u-1',
    assignedUserName: 'Pete Seager',
    job: 'Server',
    status: 'scheduled',
    breakMinutes: 30,
    notes: 'Lunch rush coverage'
  },
  {
    id: 'shift-today-2',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    assignedUserId: 'u-2',
    assignedUserName: 'Jane Smith',
    job: 'Cook',
    status: 'clocked-in',
    breakMinutes: 30,
  },
  {
    id: 'shift-today-3',
    date: new Date().toISOString().split('T')[0],
    startTime: '16:00',
    endTime: '23:00',
    assignedUserId: 'u-1',
    assignedUserName: 'Pete Seager',
    job: 'Manager',
    status: 'scheduled',
    breakMinutes: 30,
  },
]

// Function to generate shifts for multiple days
export function generateShiftsForDays(startDate: Date, numDays: number): Shift[] {
  const shifts: Shift[] = []
  const users = [
    { id: 'u-1', name: 'Pete Seager' },
    { id: 'u-2', name: 'Jane Smith' },
    { id: 'u-3', name: 'Mike Johnson' },
    { id: 'u-4', name: 'Sarah Williams' },
  ]
  
  const shiftTemplates = [
    { start: '06:00', end: '14:00', jobs: ['Cook', 'Server'] },
    { start: '08:00', end: '16:00', jobs: ['Server', 'Host', 'Manager'] },
    { start: '10:00', end: '18:00', jobs: ['Server', 'Cook', 'Bartender'] },
    { start: '14:00', end: '22:00', jobs: ['Cook', 'Server', 'Dishwasher'] },
    { start: '16:00', end: '23:00', jobs: ['Server', 'Bartender', 'Manager'] },
  ]
  
  for (let day = 0; day < numDays; day++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + day)
    const dateStr = date.toISOString().split('T')[0]
    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
    
    // Generate 3-5 shifts per day (deterministic based on day)
    const numShifts = 3 + (day % 3)
    
    for (let i = 0; i < numShifts; i++) {
      const template = shiftTemplates[i % shiftTemplates.length]
      const user = users[i % users.length]
      // Deterministic job selection based on day and shift index
      const job = template.jobs[(day + i) % template.jobs.length]
      
      let status: Shift['status'] = 'scheduled'
      if (isPast) {
        // Deterministic status for past shifts
        status = (day + i) % 10 === 0 ? 'no-show' : 'completed'
      } else if (date.toDateString() === new Date().toDateString() && i === 1) {
        status = 'clocked-in'
      }
      
      shifts.push({
        id: `shift-${dateStr}-${i}`,
        date: dateStr,
        startTime: template.start,
        endTime: template.end,
        assignedUserId: user.id,
        assignedUserName: user.name,
        job,
        status,
        breakMinutes: 30,
      })
    }
  }
  
  return shifts
}

