"use client"

import { Suspense, useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronLeft, ChevronRight, Repeat, Calendar as CalendarIcon, List, Sun, Thermometer, CircleSlash, Star, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { WeeklyAvailability } from '@/types/availability'
import { createEmptySchedule, SLOT_STATUS, DAYS_OF_WEEK } from '@/types/availability'
import { useGlobalApp } from "@/context/GlobalContext"

const CELL_HEIGHT = 22
const CELL_WIDTH = 44
const TIME_LABEL_WIDTH = 70

// Business hours (slot indices: 2 slots per hour, 0 = midnight)
const WEEKDAY_START = 16 // 8 AM
const WEEKDAY_END = 36   // 6 PM
const WEEKEND_START = 20 // 10 AM  
const WEEKEND_END = 44   // 10 PM

type WizardStep = 'preferred' | 'available'

// Helper: Convert slot index to time string
function slotIndexToTime(index: number): string {
  const hour = Math.floor(index / 2)
  const minute = (index % 2) * 30
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`
}

// Helper: Check if slot is within business hours for a given day
function isBusinessHours(dayIndex: number, slotIndex: number): boolean {
  const isWeekend = dayIndex >= 5 // Saturday (5) and Sunday (6)
  
  if (isWeekend) {
    return slotIndex >= WEEKEND_START && slotIndex <= WEEKEND_END
  } else {
    return slotIndex >= WEEKDAY_START && slotIndex <= WEEKDAY_END
  }
}

// Helper: Get background color for slot status
function getSlotColor(status: number, dayIndex: number, slotIndex: number): string {
  // If outside business hours, show grey (closed)
  if (!isBusinessHours(dayIndex, slotIndex)) {
    return '#eeeeee' // Grey for closed
  }
  
  // Within business hours
  switch (status) {
    case SLOT_STATUS.PREFERRED:
      return '#d4edda' // Light green
    case SLOT_STATUS.AVAILABLE:
      return '#d1ecf1' // Light blue
    default:
      return '#ffffff' // White (open, not selected)
  }
}

function AvailabilityHubContent() {
  const router = useRouter()
  const { userProfile, addRequest, requests: globalRequests, setBottomSheetOpen } = useGlobalApp()
  
  // Tab State
  const [activeTab, setActiveTab] = useState<"pattern" | "calendar" | "requests">("pattern")
  
  // Pattern Tab - Availability State
  const [availability, setAvailability] = useState<WeeklyAvailability>(createEmptySchedule())
  const [step, setStep] = useState<WizardStep>('preferred')
  const [isPainting, setIsPainting] = useState(false)
  const [paintMode, setPaintMode] = useState<'paint' | 'erase'>('paint')
  const scrollViewRef = useRef<HTMLDivElement>(null)
  const paintedCellsRef = useRef<Set<string>>(new Set())
  const autoScrollIntervalRef = useRef<any>(null)
  const lastPaintedCellRef = useRef<string | null>(null)
  
  // Calendar State (Weekly view)
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1) // Monday start
    return new Date(today.setDate(diff))
  })
  
  // Calendar exceptions (overrides for specific weeks)
  const [calendarExceptions, setCalendarExceptions] = useState<{[weekKey: string]: WeeklyAvailability}>({})
  
  // Calendar time selection state (for time off requests)
  const [isSelectingTime, setIsSelectingTime] = useState(false)
  const [selectionStart, setSelectionStart] = useState<{day: number, slot: number} | null>(null)
  const [selectionEnd, setSelectionEnd] = useState<{day: number, slot: number} | null>(null)
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set())
  const calendarScrollViewRef = useRef<HTMLDivElement>(null)
  const lastSelectedCellRef = useRef<string | null>(null)
  
  // Sheet State
  const [isRequestSheetOpen, setIsRequestSheetOpen] = useState(false)
  
  // Form State
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reason, setReason] = useState("")
  
  // Time Off Requests Storage
  const [timeOffRequests, setTimeOffRequests] = useState<Array<{
    id: string
    type: string
    startDate: string
    endDate: string
    reason: string
    status: 'pending' | 'approved' | 'denied'
  }>>([])


  // ===== PATTERN TAB FUNCTIONS =====
  
  // Update a specific slot
  const updateSlot = (dayIndex: number, slotIndex: number, newStatus: number) => {
    const newAvailability = [...availability]
    newAvailability[dayIndex].slots[slotIndex].status = newStatus
    setAvailability(newAvailability)
  }

  // Handle cell interaction (click or drag)
  const handleCellInteraction = (dayIndex: number, slotIndex: number, isInitial: boolean = false) => {
    // Can't interact with closed hours
    if (!isBusinessHours(dayIndex, slotIndex)) {
      return
    }
    
    const currentStatus = availability[dayIndex].slots[slotIndex].status
    
    // Step 2 constraint: can't modify preferred (green) cells
    if (step === 'available' && currentStatus === SLOT_STATUS.PREFERRED) {
      return
    }

    // Check if already painted in this drag
    const cellKey = `${dayIndex}-${slotIndex}`
    if (paintedCellsRef.current.has(cellKey) && !isInitial) {
      return // Skip if already painted in this drag
    }

    // On initial press, determine paint mode based on current cell status
    if (isInitial) {
      const stepStatus = step === 'preferred' ? SLOT_STATUS.PREFERRED : SLOT_STATUS.AVAILABLE
      setPaintMode(currentStatus === stepStatus ? 'erase' : 'paint')
      paintedCellsRef.current.clear()
    }

    // Apply paint mode
    const stepStatus = step === 'preferred' ? SLOT_STATUS.PREFERRED : SLOT_STATUS.AVAILABLE
    const newStatus = paintMode === 'erase' ? SLOT_STATUS.UNAVAILABLE : stepStatus
    
    if (currentStatus !== newStatus) {
      updateSlot(dayIndex, slotIndex, newStatus)
      paintedCellsRef.current.add(cellKey)
    }
  }

  // Start auto-scroll when near edges
  const startAutoScroll = (direction: 'up' | 'down') => {
    if (autoScrollIntervalRef.current) return

    autoScrollIntervalRef.current = setInterval(() => {
      if (scrollViewRef.current) {
        const currentScrollY = scrollViewRef.current.scrollTop
        const newScrollY = direction === 'up' 
          ? Math.max(0, currentScrollY - 10) 
          : currentScrollY + 10
        scrollViewRef.current.scrollTop = newScrollY
      }
    }, 16) // ~60fps
  }

  // Stop auto-scroll
  const stopAutoScroll = () => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current)
      autoScrollIntervalRef.current = null
    }
  }

  // Handle mouse/touch move over grid
  const handlePointerMove = (event: React.PointerEvent) => {
    if (!isPainting) return
    event.preventDefault() // Extra safety

    // Use hit testing to find the element under the pointer
    const target = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement
    
    if (target) {
      // Find the cell element (might be the target itself or a parent)
      const cellElement = target.closest('[data-cell-id]') as HTMLElement
      
      if (cellElement) {
        const cellId = cellElement.getAttribute('data-cell-id')
        
        // Only process if this is a different cell than the last one
        if (cellId && cellId !== lastPaintedCellRef.current) {
          const [dayStr, slotStr] = cellId.split('-')
          const dayIndex = parseInt(dayStr)
          const slotIndex = parseInt(slotStr)
          
          if (!isNaN(dayIndex) && !isNaN(slotIndex)) {
            handleCellInteraction(dayIndex, slotIndex)
            lastPaintedCellRef.current = cellId
          }
        }
      }
    }

    // Check for auto-scroll
    const windowHeight = window.innerHeight
    const topEdgeZone = 200 // px from top (larger to account for headers)
    const bottomEdgeZone = 100 // px from bottom

    if (event.clientY < topEdgeZone) {
      startAutoScroll('up')
    } else if (event.clientY > windowHeight - bottomEdgeZone) {
      startAutoScroll('down')
    } else {
      stopAutoScroll()
    }
  }

  // Handle paint end
  const handlePaintEnd = () => {
    setIsPainting(false)
    lastPaintedCellRef.current = null
    stopAutoScroll()
    paintedCellsRef.current.clear()
  }

  // Calculate totals
  const preferredCount = availability.reduce(
    (sum, day) => sum + day.slots.filter(s => s.status === SLOT_STATUS.PREFERRED).length,
    0
  )
  const availableCount = availability.reduce(
    (sum, day) => sum + day.slots.filter(s => s.status === SLOT_STATUS.AVAILABLE).length,
    0
  )
  const preferredHours = (preferredCount * 0.5).toFixed(1)
  const availableHours = (availableCount * 0.5).toFixed(1)
  const totalHours = ((preferredCount + availableCount) * 0.5).toFixed(1)

  // Handle save
  const handleSavePattern = () => {
    console.log('=== AVAILABILITY SAVED ===')
    console.log(`Preferred Hours: ${preferredHours}`)
    console.log(`Available Hours: ${availableHours}`)
    console.log(`Total Hours: ${totalHours}`)
    console.log('Full availability data:', availability)
    
    alert(`✅ Availability Saved!\n\nPreferred: ${preferredHours} hrs\nAvailable: ${availableHours} hrs\nTotal: ${totalHours} hrs`)
  }

  // Add global mouse/touch listeners
  // Render slots from 7 AM to 10 PM to cover all business hours
  const startSlot = 14 // 7 AM (covers weekday 8 AM start)
  const endSlot = 44   // 10 PM (covers weekend 10 PM end)
  const visibleSlots = Array.from({ length: endSlot - startSlot + 1 }, (_, i) => i + startSlot)

  // ===== CALENDAR TAB FUNCTIONS =====
  
  // Get week key for exceptions
  const getWeekKey = (weekStart: Date) => {
    return weekStart.toISOString().split('T')[0]
  }
  
  // Convert slot index to datetime-local format
  const slotToDateTime = (dayIndex: number, slotIndex: number) => {
    const date = new Date(currentWeekStart)
    date.setDate(date.getDate() + dayIndex)
    
    const hour = Math.floor(slotIndex / 2)
    const minute = (slotIndex % 2) * 30
    
    date.setHours(hour, minute, 0, 0)
    
    // Format as YYYY-MM-DDTHH:MM
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(hour).padStart(2, '0')
    const minutes = String(minute).padStart(2, '0')
    
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }
  
  // Get all cells in selection range
  const getCellsInRange = (start: {day: number, slot: number}, end: {day: number, slot: number}) => {
    const cells = new Set<string>()
    
    // Ensure start is before end
    const startDay = Math.min(start.day, end.day)
    const endDay = Math.max(start.day, end.day)
    
    if (startDay === endDay) {
      // Same day selection
      const startSlot = Math.min(start.slot, end.slot)
      const endSlot = Math.max(start.slot, end.slot)
      
      for (let slot = startSlot; slot <= endSlot; slot++) {
        cells.add(`${startDay}-${slot}`)
      }
    } else {
      // Multi-day selection (not implemented for now, keep it simple)
      // Just use the drag endpoint
      for (let slot = start.slot; slot <= end.slot; slot++) {
        cells.add(`${end.day}-${slot}`)
      }
    }
    
    return cells
  }
  
  // Handle calendar cell selection (for time off requests)
  const handleCalendarSelection = (dayIndex: number, slotIndex: number, isStart: boolean = false) => {
    if (!isBusinessHours(dayIndex, slotIndex)) return
    
    if (isStart) {
      setSelectionStart({ day: dayIndex, slot: slotIndex })
      setSelectionEnd({ day: dayIndex, slot: slotIndex })
      setSelectedCells(new Set([`${dayIndex}-${slotIndex}`]))
    } else {
      setSelectionEnd({ day: dayIndex, slot: slotIndex })
      if (selectionStart) {
        const cells = getCellsInRange(selectionStart, { day: dayIndex, slot: slotIndex })
        setSelectedCells(cells)
      }
    }
  }
  
  // Handle selection end and open drawer
  const handleSelectionEnd = () => {
    if (!selectionStart || !selectionEnd) {
      setIsSelectingTime(false)
      return
    }
    
    // Calculate start and end times
    const startDateTime = slotToDateTime(selectionStart.day, selectionStart.slot)
    const endDateTime = slotToDateTime(selectionEnd.day, selectionEnd.slot + 1) // End of slot
    
    // Pre-fill the form
    setStartDate(startDateTime)
    setEndDate(endDateTime)
    
    // Open the time off request drawer
    setIsRequestSheetOpen(true)
    setBottomSheetOpen(true)
    
    // Reset selection
    setIsSelectingTime(false)
    setSelectionStart(null)
    setSelectionEnd(null)
    setSelectedCells(new Set())
    lastSelectedCellRef.current = null
  }
  
  // Navigate weeks
  const handlePrevWeek = () => {
    const newWeekStart = new Date(currentWeekStart)
    newWeekStart.setDate(newWeekStart.getDate() - 7)
    setCurrentWeekStart(newWeekStart)
  }
  
  const handleNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart)
    newWeekStart.setDate(newWeekStart.getDate() + 7)
    setCurrentWeekStart(newWeekStart)
  }
  
  // Format week range for display
  const formatWeekRange = (weekStart: Date) => {
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const startMonth = monthNames[weekStart.getMonth()]
    const endMonth = monthNames[weekEnd.getMonth()]
    const startDay = weekStart.getDate()
    const endDay = weekEnd.getDate()
    const year = weekStart.getFullYear()
    
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}, ${year}`
    } else {
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`
    }
  }
  
  // Mock assigned shifts for current week
  const getMockShifts = () => {
    return [
      { dayIndex: 0, startSlot: 18, endSlot: 28, label: "Shift" }, // Mon 9am-2pm
      { dayIndex: 2, startSlot: 20, endSlot: 32, label: "Shift" }, // Wed 10am-4pm
      { dayIndex: 4, startSlot: 18, endSlot: 30, label: "Shift" }, // Fri 9am-3pm
    ]
  }
  
  // Mock time off for current week
  const getMockTimeOff = () => {
    return [
      { dayIndex: 1, startSlot: 16, endSlot: 36, label: "Time Off" }, // Tue all day
    ]
  }
  
  // Get effective availability for a slot (layered logic)
  const getCalendarSlotData = (dayIndex: number, slotIndex: number) => {
    const weekKey = getWeekKey(currentWeekStart)
    
    // Check for shifts (highest priority)
    const shifts = getMockShifts()
    const shift = shifts.find(s => s.dayIndex === dayIndex && slotIndex >= s.startSlot && slotIndex <= s.endSlot)
    if (shift) {
      return { type: 'shift', label: shift.label, color: '#3b82f6', textColor: 'white' }
    }
    
    // Check for time off requests
    // Calculate the exact datetime for this cell's slot
    const cellDateTime = new Date(currentWeekStart)
    cellDateTime.setDate(cellDateTime.getDate() + dayIndex)
    const hour = Math.floor(slotIndex / 2)
    const minute = (slotIndex % 2) * 30
    cellDateTime.setHours(hour, minute, 0, 0)
    
    // Check if any time off request covers this specific time slot
    const timeOffRequest = timeOffRequests.find(request => {
      const requestStart = new Date(request.startDate)
      const requestEnd = new Date(request.endDate)
      // Check if cell time falls within request time range
      return cellDateTime >= requestStart && cellDateTime < requestEnd
    })
    
    if (timeOffRequest) {
      const statusLabel = timeOffRequest.status === 'pending' ? ' (pending)' : ''
      return { type: 'timeoff', label: `${timeOffRequest.type}${statusLabel}`, color: '#fde047', textColor: '#000' } // Yellow
    }
    
    // Check for calendar exceptions
    if (calendarExceptions[weekKey]) {
      const exceptionStatus = calendarExceptions[weekKey][dayIndex].slots[slotIndex].status
      if (exceptionStatus !== SLOT_STATUS.UNAVAILABLE) {
        return {
          type: 'exception',
          status: exceptionStatus,
          color: exceptionStatus === SLOT_STATUS.PREFERRED ? '#d4edda' : '#d1ecf1',
          textColor: 'black'
        }
      }
    }
    
    // Fall back to pattern (base layer)
    const patternStatus = availability[dayIndex].slots[slotIndex].status
    if (patternStatus !== SLOT_STATUS.UNAVAILABLE) {
      return {
        type: 'pattern',
        status: patternStatus,
        color: patternStatus === SLOT_STATUS.PREFERRED ? '#d4edda' : '#d1ecf1',
        textColor: 'black'
      }
    }
    
    // Empty/unavailable
    return { type: 'unavailable', color: '#ffffff', textColor: 'black' }
  }
  
  // Handle calendar selection move
  const handleCalendarSelectionMove = (event: React.PointerEvent) => {
    if (!isSelectingTime) return
    event.preventDefault() // Extra safety

    // Use hit testing to find the element under the pointer
    const target = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement
    
    if (target) {
      // Find the cell element (might be the target itself or a parent)
      const cellElement = target.closest('[data-cell-id]') as HTMLElement
      
      if (cellElement) {
        const cellId = cellElement.getAttribute('data-cell-id')
        
        // Only process if this is a different cell than the last one
        if (cellId && cellId !== lastSelectedCellRef.current) {
          const [dayStr, slotStr] = cellId.split('-')
          const dayIndex = parseInt(dayStr)
          const slotIndex = parseInt(slotStr)
          
          if (!isNaN(dayIndex) && !isNaN(slotIndex)) {
            handleCalendarSelection(dayIndex, slotIndex, false)
            lastSelectedCellRef.current = cellId
          }
        }
      }
    }
  }

  // ===== REQUESTS TAB DATA =====
  
  // Transform saved time off requests into display format
  const upcomingRequests = timeOffRequests.map(request => {
    const startDate = new Date(request.startDate)
    const endDate = new Date(request.endDate)
    
    // Look up approval status from global state
    const globalRequest = globalRequests.find(r => r.id === request.id)
    const approvalStatus = globalRequest?.status || request.status
    
    const statusColors = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      approved: "bg-green-50 text-green-700 border-green-200",
      denied: "bg-red-50 text-red-700 border-red-200"
    }
    
    // Format time range with dates and times
    const startTime = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    const endTime = endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    const sameDay = startDate.toDateString() === endDate.toDateString()
    
    let duration
    if (sameDay) {
      // Same day: "3:00 PM - 4:00 PM"
      duration = `${startTime} - ${endTime}`
    } else {
      // Different days: "Jan 3, 3:00 PM - Jan 5, 4:00 PM"
      const startDateStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const endDateStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      duration = `${startDateStr}, ${startTime} - ${endDateStr}, ${endTime}`
    }
    
    return {
      id: request.id,
      month: startDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      day: startDate.getDate().toString(),
      title: request.type.toUpperCase(),
      duration,
      status: approvalStatus.charAt(0).toUpperCase() + approvalStatus.slice(1),
      statusColor: statusColors[approvalStatus]
    }
  })

  const pastRequests: typeof upcomingRequests = []

  const timeOffTypes = [
    { id: "pto", label: "PTO", icon: Sun, color: "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100" },
    { id: "sick", label: "Sick", icon: Thermometer, color: "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" },
    { id: "unpaid", label: "Unpaid", icon: CircleSlash, color: "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100" },
    { id: "special", label: "Special", icon: Star, color: "bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100" },
  ]

  const handleSubmitRequest = () => {
    if (!selectedType || !startDate || !endDate) {
      alert("Please fill in all required fields")
      return
    }
    
    // Format the detail string for display
    const formatDetail = () => {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const startTime = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      const endTime = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      
      if (startStr === endStr) {
        return `${startStr}, ${startTime}-${endTime}`
      }
      return `${startStr}-${endStr}`
    }
    
    const requestId = `timeoff-${Date.now()}`
    
    // Create new time off request for local calendar display
    const newTimeOffRequest = {
      id: requestId,
      type: selectedType,
      startDate,
      endDate,
      reason,
      status: 'pending' as const
    }
    
    // Create request for global state (manager approval)
    const newGlobalRequest = {
      id: requestId,
      userId: 'u1', // Current user ID
      userName: userProfile.name,
      type: selectedType === 'pto' ? 'PTO' as const : 'TimeOff' as const,
      detail: formatDetail(),
      date: startDate.split('T')[0],
      status: 'pending' as const
    }
    
    // Add to local time off requests (for calendar display)
    setTimeOffRequests(prev => [...prev, newTimeOffRequest])
    
    // Add to global requests (for manager approval)
    addRequest(newGlobalRequest)
    
    console.log('✅ Time off request saved:', newTimeOffRequest)
    console.log('📨 Request sent to manager:', newGlobalRequest)
    
    // Show success message
    alert("Request sent to Manager for approval!")
    
    // Reset and close
    setIsRequestSheetOpen(false)
    setBottomSheetOpen(false)
    setSelectedType(null)
    setStartDate("")
    setEndDate("")
    setReason("")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b px-4 py-2 flex items-center gap-2 z-20 h-14">
        <button 
          className="h-12 w-12 rounded-full flex items-center justify-center hover:bg-blue-50 text-blue-600 transition-colors -ml-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-[30px] w-[30px]" strokeWidth={2.5} />
        </button>
        <h1 className="text-lg font-semibold flex-1">Availability</h1>
      </div>

      {/* 3-Segment Navigation */}
      <div className="sticky top-14 bg-white border-b px-4 py-3 z-10">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("pattern")}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === "pattern"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Repeat className="h-4 w-4" />
            <span>Pattern</span>
          </button>
          <button
            onClick={() => setActiveTab("calendar")}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === "calendar"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <CalendarIcon className="h-4 w-4" />
            <span>Calendar</span>
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === "requests"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <List className="h-4 w-4" />
            <span>Requests</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto pb-20">
        
        {/* Tab 1: Pattern View (Drag-to-Paint) */}
        {activeTab === "pattern" && (
          <div className="flex flex-col h-full">
            {/* Instructions Bar */}
            <div className="px-4 py-3 flex items-center justify-between bg-gray-50 border-b">
              <p className="text-sm font-semibold text-gray-700 flex-1">
                {step === 'preferred' 
                  ? 'Drag to select your preferred hours' 
                  : 'Drag to add other hours you can work'}
              </p>
              <div className="flex gap-2">
                {step === 'preferred' ? (
                  <Button 
                    className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm"
                    onClick={() => setStep('available')}
                  >
                    Next
                  </Button>
                ) : (
                  <>
                    <Button 
                      className="px-4 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-semibold text-sm"
                      onClick={() => setStep('preferred')}
                    >
                      Back
                    </Button>
                    <Button 
                      className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm"
                      onClick={handleSavePattern}
                    >
                      Save
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="px-4 py-2 bg-gray-50 border-b">
              <p className="text-xs font-semibold text-gray-600 text-center">
                {step === 'preferred' 
                  ? `Preferred: ${preferredHours} hrs`
                  : `Preferred: ${preferredHours} hrs  •  Available: ${availableHours} hrs  •  Total: ${totalHours} hrs`}
              </p>
            </div>

            {/* Day Headers */}
            <div className="flex bg-gray-100 border-b border-gray-300 sticky top-0 z-10">
              <div style={{ width: TIME_LABEL_WIDTH }} />
              {DAYS_OF_WEEK.map((day) => (
                <div 
                  key={day} 
                  className="flex-1 h-10 flex items-center justify-center border-r border-gray-300"
                >
                  <span className="text-xs font-bold text-gray-900">{day}</span>
                </div>
              ))}
            </div>

            {/* Grid */}
            <div 
              ref={scrollViewRef}
              className="flex-1 overflow-auto touch-none"
              onPointerDown={(e) => {
                setIsPainting(true)
                lastPaintedCellRef.current = null
                handlePointerMove(e)
              }}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePaintEnd}
              onPointerLeave={handlePaintEnd}
            >
              {visibleSlots.map((slotIndex) => (
                <div key={slotIndex} className="flex">
                  {/* Time Label */}
                  <div 
                    className="relative flex items-start" 
                    style={{ width: TIME_LABEL_WIDTH, height: CELL_HEIGHT }}
                  >
                    {slotIndex % 2 === 0 && (
                      <span className="absolute top-[-6px] right-2 text-[11px] text-gray-500">
                        {slotIndexToTime(slotIndex)}
                      </span>
                    )}
                  </div>

                  {/* Day Cells */}
                  {DAYS_OF_WEEK.map((day, dayIndex) => {
                    const slot = availability[dayIndex].slots[slotIndex]
                    const isClosed = !isBusinessHours(dayIndex, slotIndex)
                    const isLocked = step === 'available' && slot.status === SLOT_STATUS.PREFERRED
                    const isDisabled = isClosed || isLocked
                    
                    return (
                      <div
                        key={`${dayIndex}-${slotIndex}`}
                        className="flex-1 border-[0.5px] border-gray-300 flex items-center justify-center select-none"
                        style={{ 
                          height: CELL_HEIGHT,
                          backgroundColor: getSlotColor(slot.status, dayIndex, slotIndex),
                          opacity: isLocked ? 0.6 : isClosed ? 0.5 : 1,
                          pointerEvents: isDisabled ? 'none' : 'auto'
                        }}
                        data-cell-id={`${dayIndex}-${slotIndex}`}
                      >
                        {isLocked && <span className="text-xs pointer-events-none">🔒</span>}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="sticky bottom-0 bg-white border-t px-4 py-3 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#d4edda' }} />
                <span>Preferred</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#d1ecf1' }} />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-200" />
                <span>Closed</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Calendar View (Weekly with Layers) */}
        {activeTab === "calendar" && (
          <div className="flex flex-col h-full">
            {/* Day Headers with Dates */}
            <div className="flex bg-gray-100 border-b border-gray-300 sticky top-0 z-10">
              {/* Navigation Buttons Column */}
              <div style={{ width: TIME_LABEL_WIDTH }} className="flex items-center justify-center gap-1 border-r border-gray-300">
                <button
                  onClick={handlePrevWeek}
                  className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={handleNextWeek}
                  className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              
              {/* Day Columns */}
              {DAYS_OF_WEEK.map((day, index) => {
                const dayDate = new Date(currentWeekStart)
                dayDate.setDate(dayDate.getDate() + index)
                const dateNum = dayDate.getDate()
                
                return (
                  <div 
                    key={day} 
                    className="flex-1 py-2 flex flex-col items-center justify-center border-r border-gray-300"
                  >
                    <span className="text-xs font-semibold text-gray-500">{day}</span>
                    <span className="text-xl font-bold text-gray-900 mt-0.5">{dateNum}</span>
                  </div>
                )
              })}
            </div>

            {/* Grid (Same as Pattern) */}
            <div 
              ref={calendarScrollViewRef}
              className="flex-1 overflow-auto touch-none"
              onPointerDown={(e) => {
                setIsSelectingTime(true)
                lastSelectedCellRef.current = null
                // Process initial cell
                const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement
                if (target) {
                  const cellElement = target.closest('[data-cell-id]') as HTMLElement
                  if (cellElement) {
                    const cellId = cellElement.getAttribute('data-cell-id')
                    if (cellId) {
                      const [dayStr, slotStr] = cellId.split('-')
                      const dayIndex = parseInt(dayStr)
                      const slotIndex = parseInt(slotStr)
                      if (!isNaN(dayIndex) && !isNaN(slotIndex)) {
                        handleCalendarSelection(dayIndex, slotIndex, true)
                        lastSelectedCellRef.current = cellId
                      }
                    }
                  }
                }
              }}
              onPointerMove={handleCalendarSelectionMove}
              onPointerUp={handleSelectionEnd}
              onPointerLeave={handleSelectionEnd}
            >
              {visibleSlots.map((slotIndex) => (
                <div key={slotIndex} className="flex">
                  {/* Time Label */}
                  <div 
                    className="relative flex items-start" 
                    style={{ width: TIME_LABEL_WIDTH, height: CELL_HEIGHT }}
                  >
                    {slotIndex % 2 === 0 && (
                      <span className="absolute top-[-6px] right-2 text-[11px] text-gray-500">
                        {slotIndexToTime(slotIndex)}
                      </span>
                    )}
                  </div>

                  {/* Day Cells */}
                  {DAYS_OF_WEEK.map((day, dayIndex) => {
                    const isClosed = !isBusinessHours(dayIndex, slotIndex)
                    const slotData = getCalendarSlotData(dayIndex, slotIndex)
                    const isLocked = slotData.type === 'shift' || slotData.type === 'timeoff'
                    const isDisabled = isClosed || isLocked
                    const cellKey = `${dayIndex}-${slotIndex}`
                    const isSelected = selectedCells.has(cellKey)
                    
                    return (
                      <div
                        key={cellKey}
                        className="flex-1 border-[0.5px] border-gray-300 flex items-center justify-center select-none"
                        style={{ 
                          height: CELL_HEIGHT,
                          backgroundColor: isSelected ? '#fef08a' : (isClosed ? '#eeeeee' : slotData.color),
                          opacity: isClosed ? 0.5 : 1,
                          color: slotData.textColor,
                          fontSize: '9px',
                          fontWeight: isLocked ? 600 : 400,
                          pointerEvents: isDisabled ? 'none' : 'auto'
                        }}
                        data-cell-id={`${dayIndex}-${slotIndex}`}
                      >
                        {isLocked && slotIndex % 4 === 0 && (
                          <span className="pointer-events-none">{slotData.label}</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="sticky bottom-0 bg-white border-t px-4 py-3 flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#d4edda' }} />
                <span>Pattern</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#3b82f6' }} />
                <span>Shift</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }} />
                <span>Time Off</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-gray-200" />
                <span>Closed</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Requests View */}
        {activeTab === "requests" && (
          <div className="py-4">
            {/* Upcoming Section */}
            <div className="mb-6">
              <h2 className="px-4 mb-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
                Upcoming
              </h2>
              <div className="bg-white border-y border-gray-100 divide-y divide-gray-100 shadow-sm">
                {upcomingRequests.map((request) => (
                  <div key={request.id} className="flex items-center gap-4 px-4 py-4">
                    {/* Date Stack */}
                    <div className="flex flex-col items-center justify-center w-14 h-14 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-xs font-bold text-gray-500">{request.month}</div>
                      <div className="text-xl font-bold text-gray-900">{request.day}</div>
                    </div>
                    
                    {/* Middle: Title & Duration */}
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{request.title}</div>
                      <div className="text-sm text-gray-500">{request.duration}</div>
                    </div>
                    
                    {/* Status Pill */}
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${request.statusColor}`}
                    >
                      {request.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Past Section */}
            <div className="mb-6">
              <h2 className="px-4 mb-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
                Past
              </h2>
              <div className="bg-white border-y border-gray-100 divide-y divide-gray-100 shadow-sm">
                {pastRequests.map((request) => (
                  <div key={request.id} className="flex items-center gap-4 px-4 py-4 opacity-60">
                    {/* Date Stack */}
                    <div className="flex flex-col items-center justify-center w-14 h-14 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-xs font-bold text-gray-500">{request.month}</div>
                      <div className="text-xl font-bold text-gray-900">{request.day}</div>
                    </div>
                    
                    {/* Middle: Title & Duration */}
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{request.title}</div>
                      <div className="text-sm text-gray-500">{request.duration}</div>
                    </div>
                    
                    {/* Status Pill */}
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${request.statusColor}`}
                    >
                      {request.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Button (Requests Tab Only) */}
      {activeTab === "requests" && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 z-10">
          <button
            onClick={() => {
              setIsRequestSheetOpen(true)
              setBottomSheetOpen(true)
            }}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            New Request
          </button>
        </div>
      )}

      {/* Bottom Sheet (Request Form) */}
      {isRequestSheetOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => {
              setIsRequestSheetOpen(false)
              setBottomSheetOpen(false)
            }}
          />

          {/* Sheet */}
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-40 max-h-[85vh] overflow-auto">
            {/* Sheet Header */}
            <div className="sticky top-0 bg-white border-b px-4 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-semibold">New Time Off Request</h2>
              <button
                onClick={() => {
                  setIsRequestSheetOpen(false)
                  setBottomSheetOpen(false)
                }}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500"
              >
                ✕
              </button>
            </div>

            {/* Sheet Content */}
            <div className="p-4 space-y-6">
              {/* Step 1: Type Selector (Single Row) */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Request Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {timeOffTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          selectedType === type.id
                            ? type.color.replace("hover:", "")
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Icon className="h-6 w-6 mx-auto mb-1" />
                        <div className="text-xs font-semibold">{type.label}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Step 2: Date & Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Step 3: Note */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Note
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  placeholder="Optional: Add details about your request..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsRequestSheetOpen(false)
                    setBottomSheetOpen(false)
                    setSelectedType(null)
                    setStartDate("")
                    setEndDate("")
                    setReason("")
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRequest}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-full transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function AvailabilityHubPage() {
  return (
    <Suspense fallback={null}>
      <AvailabilityHubContent />
    </Suspense>
  )
}
