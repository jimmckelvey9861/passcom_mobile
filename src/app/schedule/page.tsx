"use client"

import { Suspense, useState, useMemo, useRef, useEffect, useLayoutEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, Users, Bell, Search, X, CalendarCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ShiftCard } from "@/components/ShiftCard"
import { Shift, generateShiftsForDays, calculateShiftHours } from "@/data/dummyShifts"

// Helper functions for date manipulation
const getStartOfWeek = (date: Date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday start
  return new Date(d.setDate(diff))
}

const formatDateKey = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const isSameDay = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}

interface DayData {
  date: Date
  dateKey: string
  dayName: string
  dayNumber: number
  isToday: boolean
  isPast: boolean
  hasContent: boolean
  shifts: Shift[]
}

function SchedulePageContent() {
  const router = useRouter()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const miniCalendarRef = useRef<HTMLDivElement>(null)
  const dayRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const ignoreScrollUntil = useRef<number>(0)
  const syncToWeekOffset = useRef<number | null>(null)
  const touchStartX = useRef<number>(0)
  const touchStartY = useRef<number>(0)
  const touchStartTime = useRef<number>(0)
  const isDragSession = useRef<boolean>(false) // Track if we're in an active drag
  
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [isTeamView, setIsTeamView] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isMounted, setIsMounted] = useState(false)
  
  // Use a static date to prevent hydration mismatch
  const today = useMemo(() => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    return date
  }, [])
  const currentUserId = 'u1'
  
  // Client-only gate: Set mounted state after first render
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Week navigation
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0)
  const [loadedWeeksRange, setLoadedWeeksRange] = useState({ start: -2, end: 2 })
  
  // Drag tracking for mini calendar
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  // Mount effect
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Generate days dynamically with shifts
  const allDays = useMemo(() => {
    const days: DayData[] = []
    const start = getStartOfWeek(today)
    start.setDate(start.getDate() + (loadedWeeksRange.start * 7))
    
    const totalDays = (loadedWeeksRange.end - loadedWeeksRange.start) * 7
    
    // Generate shifts for all days at once (pass today for deterministic status)
    const allShifts = generateShiftsForDays(start, totalDays, today)
    
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(start)
      date.setDate(date.getDate() + i)
      
      const dateKey = formatDateKey(date)
      
      // Get shifts for this day
      let dayShifts = allShifts.filter(shift => shift.date === dateKey)
      
      // Filter based on team view
      if (!isTeamView) {
        dayShifts = dayShifts.filter(shift => shift.assignedUserId === currentUserId)
      }
      
      days.push({
        date,
        dateKey,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        isToday: isMounted ? isSameDay(date, today) : false,
        isPast: false, // Remove time-based calculation to prevent hydration errors
        hasContent: dayShifts.length > 0,
        shifts: dayShifts
      })
    }
    
    return days
  }, [today, loadedWeeksRange, isTeamView, currentUserId, isMounted])
  
  // Apply search to get displayed days
  const displayedDays = useMemo(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      return allDays.map(day => {
        const filteredShifts = day.shifts.filter(shift => 
          shift.assignedUserName.toLowerCase().includes(query) ||
          shift.job.toLowerCase().includes(query)
        )
        return {
          ...day,
          shifts: filteredShifts,
          hasContent: filteredShifts.length > 0
        }
      }).filter(day => day.shifts.length > 0)
    }
    
    return allDays
  }, [allDays, searchQuery])
  
  // Group days into weeks
  const weekGroups = useMemo(() => {
    const groups: Array<{
      week: string
      days: DayData[]
      totalHours: number
      totalShifts: number
    }> = []
    
    let currentGroup: DayData[] = []
    let currentWeekStart: Date | null = null
    
    displayedDays.forEach((day, index) => {
      const weekStart = getStartOfWeek(day.date)
      const weekKey = formatDateKey(weekStart)
      
      if (!currentWeekStart || formatDateKey(currentWeekStart) !== weekKey) {
        if (currentGroup.length > 0) {
          // Calculate total hours and shifts for the week
          const totalHours = currentGroup.reduce((sum, day) => {
            return sum + day.shifts.reduce((daySum, shift) => {
              return daySum + calculateShiftHours(shift)
            }, 0)
          }, 0)
          
          const totalShifts = currentGroup.reduce((sum, day) => {
            return sum + day.shifts.length
          }, 0)
          
          groups.push({
            week: formatDateKey(currentWeekStart!),
            days: currentGroup,
            totalHours,
            totalShifts
          })
        }
        currentGroup = [day]
        currentWeekStart = weekStart
      } else {
        currentGroup.push(day)
      }
      
      if (index === displayedDays.length - 1) {
        const totalHours = currentGroup.reduce((sum, day) => {
          return sum + day.shifts.reduce((daySum, shift) => {
            return daySum + calculateShiftHours(shift)
          }, 0)
        }, 0)
        
        const totalShifts = currentGroup.reduce((sum, day) => {
          return sum + day.shifts.length
        }, 0)
        
        groups.push({
          week: formatDateKey(currentWeekStart!),
          days: currentGroup,
          totalHours,
          totalShifts
        })
      }
    })
    
    return groups
  }, [displayedDays])
  
  // Mini calendar three weeks
  const threeWeeks = useMemo(() => {
    const weeks = { prev: [], current: [], next: [] } as {
      prev: Array<{ dateKey: string; dayName: string; date: number; hasContent: boolean; isToday: boolean }>
      current: Array<{ dateKey: string; dayName: string; date: number; hasContent: boolean; isToday: boolean }>
      next: Array<{ dateKey: string; dayName: string; date: number; hasContent: boolean; isToday: boolean }>
    }
    
    for (let weekOffset = -1; weekOffset <= 1; weekOffset++) {
      const weekStart = getStartOfWeek(today)
      weekStart.setDate(weekStart.getDate() + ((currentWeekOffset + weekOffset) * 7))
      
      const weekDays = []
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart)
        date.setDate(date.getDate() + i)
        const dateKey = formatDateKey(date)
        const dayData = allDays.find(d => d.dateKey === dateKey)
        
        weekDays.push({
          dateKey,
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          date: date.getDate(),
          hasContent: dayData?.hasContent || false,
          isToday: isMounted ? isSameDay(date, today) : false
        })
      }
      
      if (weekOffset === -1) weeks.prev = weekDays
      else if (weekOffset === 0) weeks.current = weekDays
      else weeks.next = weekDays
    }
    
    return weeks
  }, [currentWeekOffset, allDays, today, isMounted])
  
  // Scroll to a specific day
  const scrollToDay = (dateKey: string) => {
    console.log('scrollToDay called:', dateKey, 'isDragging:', isDragging)
    
    // Don't scroll while dragging
    if (isDragging) {
      console.log('Blocked by isDragging')
      return
    }
    
    const container = scrollContainerRef.current
    const dayElement = dayRefs.current[dateKey]
    const miniCalendar = miniCalendarRef.current
    
    console.log('Refs:', { container: !!container, dayElement: !!dayElement, miniCalendar: !!miniCalendar })
    
    if (container && dayElement) {
      ignoreScrollUntil.current = Date.now() + 1000
      
      // Walk up the DOM tree to calculate cumulative offset (correct for nested elements)
      let elementTop = 0
      let element: HTMLElement | null = dayElement
      
      while (element && element !== container) {
        elementTop += element.offsetTop
        element = element.offsetParent as HTMLElement
      }
      
      const headerHeight = 56 // Main header
      const searchBannerHeight = searchQuery.trim() ? 35 : 0 // Search banner if active
      const miniCalendarHeight = miniCalendar ? miniCalendar.offsetHeight : 0
      
      container.scrollTo({
        top: elementTop - miniCalendarHeight - headerHeight - searchBannerHeight,
        behavior: 'smooth'
      })
    }
  }
  
  // Handle scroll to update mini calendar and load more weeks (infinite scroll)
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return
    
    // Skip scroll handling if we recently changed week manually (prevents feedback loop)
    if (Date.now() < ignoreScrollUntil.current) {
      return
    }
    
    const container = scrollContainerRef.current
    const containerTop = container.getBoundingClientRect().top
    
    // Find the day at the top of viewport
    let topDay: any = null
    let minDistance = Infinity
    
    allDays.forEach(day => {
      const element = dayRefs.current[day.dateKey]
      if (element) {
        const elementTop = element.getBoundingClientRect().top
        const distance = Math.abs(elementTop - containerTop)
        if (distance < minDistance) {
          minDistance = distance
          topDay = day
        }
      }
    })
    
    if (topDay) {
      // Calculate which week contains this day
      const weekStart = getStartOfWeek(topDay.date)
      const todayWeekStart = getStartOfWeek(today)
      const weeksDiff = Math.round((weekStart.getTime() - todayWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000))
      
      if (weeksDiff !== currentWeekOffset) {
        setCurrentWeekOffset(weeksDiff)
      }
    }
    
    // Check if we need to load more weeks (infinite scroll)
    const scrollTop = container.scrollTop
    const scrollHeight = container.scrollHeight
    const clientHeight = container.clientHeight
    
    if (scrollTop < 500) {
      // Near top - load previous weeks
      setLoadedWeeksRange(prev => ({
        start: prev.start - 2,
        end: prev.end
      }))
    } else if (scrollHeight - scrollTop - clientHeight < 500) {
      // Near bottom - load next weeks
      setLoadedWeeksRange(prev => ({
        start: prev.start,
        end: prev.end + 2
      }))
    }
  }, [allDays, currentWeekOffset, today])
  
  // Attach scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    
    const throttledScroll = () => {
      requestAnimationFrame(handleScroll)
    }
    
    container.addEventListener('scroll', throttledScroll)
    return () => container.removeEventListener('scroll', throttledScroll)
  }, [handleScroll])
  
  // Set initial scroll position to today (before paint, no animation)
  useLayoutEffect(() => {
    const container = scrollContainerRef.current
    const miniCalendar = miniCalendarRef.current
    
    if (!container || !miniCalendar || !isMounted) return
    
    // Use a minimal delay to ensure refs are populated
    const timer = setTimeout(() => {
      const now = new Date()
      const todayKey = formatDateKey(now)
      const dayElement = dayRefs.current[todayKey]
      
      if (dayElement) {
        console.log('Setting initial scroll to today:', todayKey, now.toLocaleDateString())
        
        // Walk up the DOM tree to calculate total offset (same as scrollToDay)
        let elementTop = 0
        let element: HTMLElement | null = dayElement
        
        while (element && element !== container) {
          elementTop += element.offsetTop
          element = element.offsetParent as HTMLElement
        }
        
        // Account for sticky header + mini calendar
        const miniCalendarHeight = miniCalendar.offsetHeight
        const headerHeight = 56 // h-14 from header
        
        // Prevent handleScroll from interfering
        ignoreScrollUntil.current = Date.now() + 1000
        
        // Set scroll position directly (no animation for initial load)
        container.scrollTop = elementTop - miniCalendarHeight - headerHeight
      }
    }, 0)
    
    return () => clearTimeout(timer)
  }, [isMounted])
  
  // Sync vertical scroll when mini calendar week changes (via swipe only)
  useEffect(() => {
    // Only sync if we have a target offset to sync to
    const targetOffset = syncToWeekOffset.current
    if (targetOffset === null) return
    
    // Don't sync while dragging
    if (isDragging || isTransitioning) {
      return
    }
    
    // Don't run during initial mount period to avoid conflicts with "scroll to today"
    if (!isMounted) return
    
    // Find the first day of the target week
    const weekStart = getStartOfWeek(today)
    weekStart.setDate(weekStart.getDate() + (targetOffset * 7))
    const weekStartKey = formatDateKey(weekStart)
    
    // Find the first day in this week
    const targetDay = allDays.find(day => {
      const dayWeekStart = getStartOfWeek(day.date)
      return formatDateKey(dayWeekStart) === weekStartKey
    })
    
    if (targetDay) {
      // Clear the target offset after successful scroll
      syncToWeekOffset.current = null
      scrollToDay(targetDay.dateKey)
    } else {
      // Week not loaded yet - expand range and retry
      if (targetOffset < loadedWeeksRange.start || targetOffset > loadedWeeksRange.end) {
        setLoadedWeeksRange(prev => ({
          start: Math.min(prev.start, targetOffset - 2),
          end: Math.max(prev.end, targetOffset + 2)
        }))
        // Don't clear target - let effect retry when allDays updates
      } else {
        // Week should be loaded but not found - clear to prevent infinite loop
        syncToWeekOffset.current = null
      }
    }
  }, [currentWeekOffset, allDays, today, loadedWeeksRange, isMounted])
  
  // Mini calendar drag handlers - Core logic
  const handleDragStart = (clientX: number, clientY: number) => {
    isDragSession.current = true // Mark that we've started a drag session
    touchStartX.current = clientX
    touchStartY.current = clientY
    touchStartTime.current = Date.now()
    // Don't set isDragging yet - wait for actual movement
    setIsTransitioning(false)
  }

  const handleDragMove = (clientX: number, clientY: number) => {
    // Only handle movement if we're in an active drag session
    if (!isDragSession.current) return false
    
    const diffX = clientX - touchStartX.current
    const diffY = clientY - touchStartY.current
    
    // Only start dragging if moved more than 5px horizontally
    if (Math.abs(diffX) > 5 && !isDragging) {
      setIsDragging(true)
    }
    
    if (!isDragging) return false
    
    // Only allow horizontal drag if movement is more horizontal than vertical
    if (Math.abs(diffX) > Math.abs(diffY)) {
      setDragOffset(diffX)
      return true // Indicate we're handling the drag
    }
    return false
  }

  const handleDragEnd = (clientX: number) => {
    // Always reset the drag session flag
    isDragSession.current = false
    
    if (!isDragging) return
    
    const touchEndTime = Date.now()
    const diffX = clientX - touchStartX.current
    const diffTime = touchEndTime - touchStartTime.current
    
    // Calculate velocity (pixels per millisecond)
    const velocity = Math.abs(diffX) / diffTime
    
    // Determine if we should snap to next/prev week
    const threshold = 80 // pixels
    const velocityThreshold = 0.5 // pixels per ms (fast flick)
    
    let shouldChangeWeek = false
    let direction = 0
    
    if (Math.abs(diffX) > threshold || velocity > velocityThreshold) {
      shouldChangeWeek = true
      direction = diffX > 0 ? -1 : 1 // Swiped right = prev week (-1), left = next week (+1)
    }
    
    setIsDragging(false)
    setIsTransitioning(true)
    
    if (shouldChangeWeek) {
      // Approach: Animate to show target week, then instantly swap and reset
      const containerWidth = miniCalendarRef.current?.offsetWidth || 0
      const snapTarget = direction === -1 ? containerWidth : -containerWidth
      
      setIsTransitioning(true)
      setDragOffset(snapTarget)
      
      // After reaching target position, instantly change weeks and reset
      setTimeout(() => {
        // Turn off transitions completely
        setIsTransitioning(false)
        
        // Wait one frame for CSS to update
        requestAnimationFrame(() => {
          // Now update both atomically (React will batch)
          ignoreScrollUntil.current = Date.now() + 1000
          // Store target week offset BEFORE changing state
          setCurrentWeekOffset(prev => {
            const newOffset = prev + direction
            syncToWeekOffset.current = newOffset
            return newOffset
          })
          setDragOffset(0)
        })
      }, 300)
    } else {
      // Snap back to center from current position
      setIsTransitioning(true)
      setDragOffset(0)
      setTimeout(() => {
        setIsTransitioning(false)
      }, 300)
    }
  }

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX, e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (handleDragMove(e.touches[0].clientX, e.touches[0].clientY)) {
      e.preventDefault() // Prevent vertical scroll when dragging horizontally
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    handleDragEnd(e.changedTouches[0].clientX)
  }

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handleDragStart(e.clientX, e.clientY)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX, e.clientY)
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    handleDragEnd(e.clientX)
  }

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (isDragging) {
      handleDragEnd(e.clientX)
    }
  }
  
  // Search handlers
  const handleSearchClose = () => {
    setIsSearchActive(false)
    setSearchQuery("")
  }
  
  const headerBtnClass = "h-12 w-12 rounded-full flex items-center justify-center hover:bg-blue-50 text-blue-600 transition-colors focus:outline-none"
  
  // Client-Only Gate: Show loading state until mounted (prevents hydration errors)
  if (!isMounted) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading schedule...</div>
      </div>
    )
  }
  
  return (
    <div className="h-screen bg-white flex flex-col pb-20">
      {/* 1. HEADER */}
      <div className="sticky top-0 bg-white border-b z-30">
        <div className="h-14 px-4 flex items-center justify-between">
          {!isSearchActive ? (
            <>
              {/* Left: Back & Title */}
              <div className="flex items-center gap-2">
                <button 
                  className={`${headerBtnClass} -ml-2`}
                  onClick={() => router.push('/')}
                >
                  <ArrowLeft className="h-[30px] w-[30px]" strokeWidth={2.5} />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Schedule</h1>
              </div>
              
              {/* Right: Actions */}
              <div className="flex items-center gap-1">
                {/* Team View Toggle */}
                <button 
                  className={headerBtnClass}
                  onClick={() => setIsTeamView(!isTeamView)}
                >
                  {isTeamView ? (
                    <Users className="h-[30px] w-[30px]" strokeWidth={2} />
                  ) : (
                    <User className="h-[30px] w-[30px]" strokeWidth={2} />
                  )}
                </button>
                
                {/* Notifications */}
                <button 
                  className={headerBtnClass}
                  onClick={() => router.push('/notification-settings/schedule')}
                  title="Schedule Notifications"
                >
                  <Bell className="h-[30px] w-[30px]" strokeWidth={2} />
                </button>

                {/* Calendar Icon - Set Availability */}
                <button 
                  className={headerBtnClass}
                  onClick={() => router.push('/availability')}
                  title="Set My Availability"
                >
                  <CalendarCheck className="h-[30px] w-[30px]" strokeWidth={2} />
                </button>

                {/* Search */}
                <button 
                  className={headerBtnClass}
                  onClick={() => setIsSearchActive(true)}
                >
                  <Search className="h-[30px] w-[30px]" strokeWidth={2} />
                </button>
              </div>
            </>
          ) : (
            /* Search Active Mode */
            <div className="flex items-center gap-2 flex-1 animate-in fade-in slide-in-from-right-2 duration-200">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or job..."
                  className="pl-9 rounded-full bg-gray-100 border-0 focus-visible:ring-0"
                  autoFocus
                />
              </div>
              <button 
                onClick={handleSearchClose}
                className="text-blue-600 hover:text-blue-700 font-medium px-2"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. SEARCH BANNER (if active) */}
      {isMounted && searchQuery.trim() && (
        <div className="sticky top-14 bg-gray-100 z-20 h-[35px] flex items-center px-4 gap-2 overflow-x-auto whitespace-nowrap">
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-sm text-gray-700">
              Search: {searchQuery}
            </span>
            <button
              onClick={() => {
                setSearchQuery("")
                setIsSearchActive(false)
              }}
              className="p-0.5 hover:bg-gray-300 rounded-full transition-colors"
            >
              <X className="h-3.5 w-3.5 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* 3. MINI CALENDAR STRIP (hidden when search active) */}
      {(!isMounted || !searchQuery.trim()) && (
        <div 
          ref={miniCalendarRef}
          className="sticky top-14 bg-white border-b py-2 z-20 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02)] overflow-hidden cursor-grab active:cursor-grabbing select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <div 
            className="flex"
            style={{
              transform: `translateX(calc(-33.333% + ${dragOffset}px))`,
              transition: isDragging ? 'none' : (isTransitioning ? 'transform 300ms ease-out' : 'none'),
              width: '300%',
              pointerEvents: isDragging ? 'none' : 'auto', // Disable clicks during drag
            }}
          >
            {/* Previous Week */}
            <div className="w-1/3 px-2">
              <div className="grid grid-cols-7 gap-1">
                {threeWeeks.prev.map((day) => (
                  <button
                    key={day.dateKey}
                    onClick={() => {
                      console.log('PREV WEEK CLICK:', day.dateKey)
                      scrollToDay(day.dateKey)
                    }}
                    className="flex flex-col items-center py-2 rounded-lg hover:bg-gray-50 transition-colors relative"
                  >
                    <span className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">{day.dayName}</span>
                    
                    {day.isToday ? (
                      <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center shadow-sm">
                        <span className="text-[21px] font-bold text-white leading-none">{day.date}</span>
                      </div>
                    ) : (
                      <span className="text-[21px] font-semibold text-gray-500">
                        {day.date}
                      </span>
                    )}
                    
                    <div className={`h-1.5 w-1.5 rounded-full mt-1 transition-opacity ${
                      day.hasContent && !day.isToday ? 'bg-blue-500' : 'opacity-0'
                    }`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Current Week */}
            <div className="w-1/3 px-2">
              <div className="grid grid-cols-7 gap-1">
                {threeWeeks.current.map((day) => (
                  <button
                    key={day.dateKey}
                    onClick={() => {
                      console.log('CURRENT WEEK CLICK:', day.dateKey)
                      scrollToDay(day.dateKey)
                    }}
                    className="flex flex-col items-center py-2 rounded-lg hover:bg-gray-50 transition-colors relative"
                  >
                    <span className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">{day.dayName}</span>
                    
                    {day.isToday ? (
                      <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center shadow-sm">
                        <span className="text-[21px] font-bold text-white leading-none">{day.date}</span>
                      </div>
                    ) : (
                      <span className="text-[21px] font-semibold text-gray-500">
                        {day.date}
                      </span>
                    )}
                    
                    <div className={`h-1.5 w-1.5 rounded-full mt-1 transition-opacity ${
                      day.hasContent && !day.isToday ? 'bg-blue-500' : 'opacity-0'
                    }`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Next Week */}
            <div className="w-1/3 px-2">
              <div className="grid grid-cols-7 gap-1">
                {threeWeeks.next.map((day) => (
                  <button
                    key={day.dateKey}
                    onClick={() => {
                      console.log('NEXT WEEK CLICK:', day.dateKey)
                      scrollToDay(day.dateKey)
                    }}
                    className="flex flex-col items-center py-2 rounded-lg hover:bg-gray-50 transition-colors relative"
                  >
                    <span className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">{day.dayName}</span>
                    
                    {day.isToday ? (
                      <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center shadow-sm">
                        <span className="text-[21px] font-bold text-white leading-none">{day.date}</span>
                      </div>
                    ) : (
                      <span className="text-[21px] font-semibold text-gray-500">
                        {day.date}
                      </span>
                    )}
                    
                    <div className={`h-1.5 w-1.5 rounded-full mt-1 transition-opacity ${
                      day.hasContent && !day.isToday ? 'bg-blue-500' : 'opacity-0'
                    }`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. VERTICAL CALENDAR LIST */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto"
      >
        {weekGroups.map((week, weekIndex) => (
          <div key={week.week}>
            {/* Days in Week */}
            {week.days.map((day) => (
              <div 
                key={day.dateKey}
                ref={(el) => { dayRefs.current[day.dateKey] = el }}
                className="border-b border-gray-200 last:border-0"
              >
                <div className="flex items-start px-4 py-[5px] group">
                  
                  {/* Left: Date Column */}
                  <div className="flex flex-col items-center w-14 mr-4 pt-1 shrink-0">
                    <span className={`text-[31px] font-bold leading-none ${day.isToday ? "text-blue-600" : "text-gray-500"}`}>
                      {day.dayNumber}
                    </span>
                    <span className={`text-sm font-medium uppercase ${day.isToday ? "text-blue-600" : "text-gray-500"}`}>
                      {day.dayName}
                    </span>
                  </div>

                  {/* Right: Shifts or Empty State */}
                  <div className="flex-1 min-w-0">
                    {day.shifts.length > 0 ? (
                      <div className="space-y-3">
                        {day.shifts.map(shift => (
                          <ShiftCard 
                            key={shift.id} 
                            shift={shift}
                            onClick={() => router.push(`/schedule/shift/${shift.id}`)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 py-2">
                        No shifts scheduled
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Week Separator (hidden when search active) */}
            {weekIndex < weekGroups.length - 1 && !searchQuery.trim() && (
              <div className="h-5 bg-gray-100 border-y border-gray-200 flex items-center justify-center gap-3">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                  {week.days[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {week.days[week.days.length - 1].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span className="text-[10px] font-semibold text-gray-400">•</span>
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                  {week.totalHours.toFixed(1)} hours · {week.totalShifts} shifts
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SchedulePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <SchedulePageContent />
    </Suspense>
  )
}
