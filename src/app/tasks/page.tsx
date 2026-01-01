"use client"

import { Suspense, useState, useMemo, useRef, useEffect, useLayoutEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, Users, Bell, Filter, Search, Plus, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import ViewTasksSheet from "@/components/ViewTasksSheet"
import OverdueTasksModal from "@/components/OverdueTasksModal"
import { TaskEditor } from "@/components/TaskEditor"
import SortStatusSheet from "@/components/SortStatusSheet"
import TagSelectionSheet from "@/components/TagSelectionSheet"
import SortUserSheet from "@/components/SortUserSheet"
import DateRangeModal from "@/components/DateRangeModal"
import BottomNav from "@/components/BottomNav"

// Helper functions for date manipulation
const getStartOfWeek = (date: Date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Monday start
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

function TasksPageContent() {
  const router = useRouter()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const miniCalendarRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number>(0)
  const touchStartY = useRef<number>(0)
  const touchStartTime = useRef<number>(0)
  const dayRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const ignoreScrollUntil = useRef<number>(0)
  const syncToWeekOffset = useRef<number | null>(null)
  
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [isTeamView, setIsTeamView] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isViewTasksSheetVisible, setIsViewTasksSheetVisible] = useState(false)
  const [isOverdueModalVisible, setIsOverdueModalVisible] = useState(false)
  const [isTaskEditorOpen, setIsTaskEditorOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<any>(null)
  const [isMounted, setIsMounted] = useState(false)
  
  // Use useMemo to prevent hydration mismatch (same date on server and client)
  const today = useMemo(() => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    return date
  }, [])
  
  // Active Filters state
  interface ActiveFilter {
    type: 'date' | 'status' | 'tag' | 'creator' | 'assignee'
    label: string
    values: any[] // Store selected values for re-opening filter
  }
  
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
  const [pendingFilters, setPendingFilters] = useState<ActiveFilter[]>([])
  
  // Filter state
  const [isStatusSheetVisible, setIsStatusSheetVisible] = useState(false)
  const [isTagSheetVisible, setIsTagSheetVisible] = useState(false)
  const [isCreatorSheetVisible, setIsCreatorSheetVisible] = useState(false)
  const [isAssigneeSheetVisible, setIsAssigneeSheetVisible] = useState(false)
  const [isDateRangeVisible, setIsDateRangeVisible] = useState(false)
  
  const [statusFilters, setStatusFilters] = useState<string[]>([])
  const [tagFilters, setTagFilters] = useState<string[]>([])
  const [creatorFilters, setCreatorFilters] = useState<string[]>([])
  const [assigneeFilters, setAssigneeFilters] = useState<string[]>([])
  
  // Week navigation
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0)
  const [loadedWeeksRange, setLoadedWeeksRange] = useState({ start: -2, end: 2 })
  
  // Drag tracking for mini calendar
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  const currentUserId = 'u-1'
  
  // Set isMounted after initial render to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Generate days dynamically based on loaded weeks range
  const allDays = useMemo(() => {
    const days = []
    const start = getStartOfWeek(today)
    start.setDate(start.getDate() + (loadedWeeksRange.start * 7))
    
    const totalDays = (loadedWeeksRange.end - loadedWeeksRange.start) * 7
    
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(start)
      date.setDate(date.getDate() + i)
      
      const dateKey = formatDateKey(date)
      const isPast = date < today && !isSameDay(date, today)
      
      // Mock tasks for this day
      let tasks: any[] = []
      const daysSinceStart = i
      
      // Task 1: New status, Kitchen tag, Pete creates, Pete assigned
      if (daysSinceStart % 4 === 0) {
        tasks.push({ 
          id: `task-${i}-1`, 
          title: "Check Equipment Temperatures", 
          time: "8:00 AM", 
          status: "new",
          tags: ["kitchen", "maintenance"],
          creatorId: 'u-1', // Pete Seager
          assigneeId: 'u-1',
          dueTime: date.toISOString()
        })
      }
      
      // Task 2: Open status, Prep tag, Pete creates, Jane assigned
      if (daysSinceStart % 3 === 1) {
        tasks.push({ 
          id: `task-${i}-2`, 
          title: "Prep vegetables for service", 
          time: "10:00 AM", 
          status: "open",
          tags: ["prep", "kitchen"],
          creatorId: 'u-1', // Pete Seager
          assigneeId: 'u-2', // Jane Smith
          dueTime: date.toISOString()
        })
      }
      
      // Task 3: Done status, Cleaning tag, Jane creates, Jane assigned
      if (daysSinceStart % 3 === 0 && i > 0) {
        tasks.push({ 
          id: `task-${i}-3`, 
          title: "Deep clean walk-in cooler", 
          time: "2:00 PM", 
          status: "done",
          tags: ["cleaning"],
          creatorId: 'u-2', // Jane Smith
          assigneeId: 'u-2',
          dueTime: date.toISOString()
        })
      }
      
      // Task 4: Late status (past tasks only), Urgent tag, Pete creates, Pete assigned
      if (daysSinceStart % 5 === 2 && isPast) {
        tasks.push({ 
          id: `task-${i}-4`, 
          title: "Review and respond to supplier emails", 
          time: "9:00 AM", 
          status: "late",
          tags: ["urgent", "admin"],
          creatorId: 'u-1', // Pete Seager
          assigneeId: 'u-1',
          dueTime: date.toISOString()
        })
      }
      
      // Task 5: Open status with bounty, multiple tags, Jane creates, Pete assigned
      if (daysSinceStart % 4 === 2) {
        tasks.push({ 
          id: `task-${i}-5`, 
          title: "Inventory count - dry storage", 
          time: "3:00 PM", 
          status: "open",
          tags: ["inventory", "admin"],
          isBounty: true,
          price: "$10.00",
          creatorId: 'u-2', // Jane Smith
          assigneeId: 'u-1', // Pete Seager
          dueTime: date.toISOString()
        })
      }
      
      // Task 6: New status, single tag, Jane creates, unassigned
      if (daysSinceStart % 6 === 3) {
        tasks.push({ 
          id: `task-${i}-6`, 
          title: "Order new aprons and uniforms", 
          time: "11:00 AM", 
          status: "new",
          tags: ["admin"],
          creatorId: 'u-2', // Jane Smith
          assigneeId: 'unassigned',
          dueTime: date.toISOString()
        })
      }
      
      // Task 7: Done status, Maintenance tag, Pete creates, Pete assigned
      if (daysSinceStart % 5 === 0 && i > 0) {
        tasks.push({ 
          id: `task-${i}-7`, 
          title: "Replace air filter in exhaust hood", 
          time: "Closing", 
          status: "done",
          tags: ["maintenance"],
          creatorId: 'u-1', // Pete Seager
          assigneeId: 'u-1',
          dueTime: date.toISOString()
        })
      }
      
      // Task 8: Open status, Kitchen + Urgent tags, Pete creates, Jane assigned
      if (daysSinceStart % 7 === 1) {
        tasks.push({ 
          id: `task-${i}-8`, 
          title: "Fix leaking faucet at station 3", 
          time: "ASAP", 
          status: "open",
          tags: ["kitchen", "urgent", "maintenance"],
          creatorId: 'u-1', // Pete Seager
          assigneeId: 'u-2', // Jane Smith
          dueTime: date.toISOString()
        })
      }
      
      // Task 9: New status, Prep + Cleaning tags, Jane creates, Jane assigned
      if (daysSinceStart % 8 === 4) {
        tasks.push({ 
          id: `task-${i}-9`, 
          title: "Sanitize all cutting boards", 
          time: "Opening", 
          status: "new",
          tags: ["prep", "cleaning"],
          creatorId: 'u-2', // Jane Smith
          assigneeId: 'u-2',
          dueTime: date.toISOString()
        })
      }
      
      // Task 10: Late status (past only), no tags, Pete creates, unassigned
      if (daysSinceStart % 9 === 5 && isPast) {
        tasks.push({ 
          id: `task-${i}-10`, 
          title: "Schedule staff meeting for next week", 
          time: "End of Day", 
          status: "late",
          tags: [],
          creatorId: 'u-1', // Pete Seager
          assigneeId: 'unassigned',
          dueTime: date.toISOString()
        })
      }
      
      // Filter based on team view
      if (!isTeamView) {
        tasks = tasks.filter(task => task.assigneeId === currentUserId)
      }
      
      days.push({
        date,
        dateKey,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        isToday: isMounted && isSameDay(date, today),
        isPast,
        hasContent: tasks.length > 0,
        tasks
      })
    }
    
    return days
  }, [today, loadedWeeksRange, isTeamView, currentUserId, isMounted])
  
  // Apply active filters to get displayed days
  const displayedDays = useMemo(() => {
    // Search takes priority over filters (independent behavior)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      return allDays.map(day => {
        const filteredTasks = day.tasks.filter(task => 
          task.title.toLowerCase().includes(query)
        )
        return {
          ...day,
          tasks: filteredTasks,
          hasContent: filteredTasks.length > 0
        }
      }).filter(day => day.tasks.length > 0) // Only show days with matching tasks
    }
    
    if (activeFilters.length === 0) {
      return allDays
    }
    
    // Apply filters
    return allDays.map(day => {
      let filteredTasks = [...day.tasks]
      
      // Apply each filter
      activeFilters.forEach(filter => {
        if (filter.type === 'status' && filter.values.length > 0) {
          // OR within status - show tasks matching any selected status
          filteredTasks = filteredTasks.filter(task => 
            filter.values.includes(task.status)
          )
        }
        
        if (filter.type === 'tag' && filter.values.length > 0) {
          // OR within tags - show tasks with any selected tag
          filteredTasks = filteredTasks.filter(task => 
            task.tags && task.tags.some((tag: string) => filter.values.includes(tag))
          )
        }
        
        if (filter.type === 'creator' && filter.values.length > 0) {
          // OR within creators
          filteredTasks = filteredTasks.filter(task => 
            filter.values.includes(task.creatorId)
          )
        }
        
        if (filter.type === 'assignee' && filter.values.length > 0) {
          // OR within assignees
          filteredTasks = filteredTasks.filter(task => 
            filter.values.includes(task.assigneeId)
          )
        }
        
        if (filter.type === 'date' && filter.values.length === 2) {
          // Date range filter
          const [startDate, endDate] = filter.values
          filteredTasks = filteredTasks.filter(task => {
            const taskDate = new Date(task.dueTime)
            return taskDate >= startDate && taskDate <= endDate
          })
        }
      })
      
      return {
        ...day,
        tasks: filteredTasks,
        hasContent: filteredTasks.length > 0
      }
    }).filter(day => day.tasks.length > 0) // Only show days with tasks when filtered
  }, [allDays, activeFilters, searchQuery])
  
  // Group days into weeks with separators
  const weekGroups = useMemo(() => {
    const groups = []
    let currentGroup: typeof displayedDays = []
    let currentWeekStart: Date | null = null
    
    displayedDays.forEach((day, index) => {
      const weekStart = getStartOfWeek(day.date)
      const weekKey = formatDateKey(weekStart)
      
      if (!currentWeekStart || formatDateKey(currentWeekStart) !== weekKey) {
        // New week - save previous group if exists
        if (currentGroup.length > 0 && currentWeekStart) {
          const completed = currentGroup.reduce((sum, d) => 
            sum + d.tasks.filter(t => t.status === 'done').length, 0)
          const incomplete = currentGroup.reduce((sum, d) => 
            sum + d.tasks.filter(t => t.status !== 'done').length, 0)
          
          groups.push({
            weekStart: currentWeekStart,
            days: currentGroup,
            completedCount: completed,
            incompleteCount: incomplete
          })
        }
        
        currentWeekStart = weekStart
        currentGroup = [day]
      } else {
        currentGroup.push(day)
      }
    })
    
    // Add last group
    if (currentGroup.length > 0 && currentWeekStart) {
      const completed = currentGroup.reduce((sum, d) => 
        sum + d.tasks.filter(t => t.status === 'done').length, 0)
      const incomplete = currentGroup.reduce((sum, d) => 
        sum + d.tasks.filter(t => t.status !== 'done').length, 0)
      
      groups.push({
        weekStart: currentWeekStart,
        days: currentGroup,
        completedCount: completed,
        incompleteCount: incomplete
      })
    }
    
    return groups
  }, [displayedDays])

  // Get three weeks for mini calendar (prev, current, next) for smooth dragging
  const threeWeeks = useMemo(() => {
    const getWeekDays = (offset: number) => {
      const weekStart = getStartOfWeek(today)
      weekStart.setDate(weekStart.getDate() + (offset * 7))
      
      const days = []
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart)
        date.setDate(date.getDate() + i)
        
        const dateKey = formatDateKey(date)
        const dayData = allDays.find(d => d.dateKey === dateKey)
        
        days.push({
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          date: date.getDate(),
          dateKey,
          hasContent: dayData?.hasContent || false,
          isToday: isMounted && isSameDay(date, today),
        })
      }
      
      return days
    }
    
    return {
      prev: getWeekDays(currentWeekOffset - 1),
      current: getWeekDays(currentWeekOffset),
      next: getWeekDays(currentWeekOffset + 1),
    }
  }, [currentWeekOffset, allDays, today, isMounted])
  
  // Find overdue tasks
  const overdueTasks = useMemo(() => {
    const now = new Date()
    return allDays.flatMap(day =>
      day.tasks.filter(task => {
        if (task.status === 'done') return false
        const dueDate = new Date(task.dueTime)
        return dueDate < now
      })
    )
  }, [allDays])

  const hasOverdueTasks = overdueTasks.length > 0

  // Drag handling for mini calendar with momentum (touch and mouse)
  const handleDragStart = (clientX: number, clientY: number) => {
    touchStartX.current = clientX
    touchStartY.current = clientY
    touchStartTime.current = Date.now()
    setIsDragging(true)
    setIsTransitioning(false)
  }

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return
    
    const diffX = clientX - touchStartX.current
    const diffY = clientY - touchStartY.current
    
    // Only allow horizontal drag if movement is more horizontal than vertical
    if (Math.abs(diffX) > Math.abs(diffY)) {
      setDragOffset(diffX)
      return true // Indicate we're handling the drag
    }
    return false
  }

  const handleDragEnd = (clientX: number) => {
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

  // Scroll to specific day
  const scrollToDay = (dateKey: string) => {
    // Only block if actively dragging mini calendar
    if (isDragging) {
      return
    }
    
    const dayElement = dayRefs.current[dateKey]
    
    if (dayElement && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      
      // Calculate cumulative offset from container
      let elementTop = 0
      let element: HTMLElement | null = dayElement
      
      // Walk up the DOM tree to calculate total offset
      while (element && element !== container) {
        elementTop += element.offsetTop
        element = element.offsetParent as HTMLElement
      }
      
      // Account for sticky header (h-14 = 56px) + mini calendar height
      const miniCalendarHeight = miniCalendarRef.current?.offsetHeight || 0
      const headerHeight = 56 // h-14 from header
      
      // Scroll to position element below sticky elements
      // The week separator will naturally be above the day and scroll out of view
      container.scrollTo({
        top: elementTop - miniCalendarHeight - headerHeight,
        behavior: 'smooth'
      })
    }
  }

  // Handle scroll to update mini calendar
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
    
    // Check if we need to load more weeks
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

  // Load filters from localStorage after mount (avoiding hydration mismatch)
  useEffect(() => {
    setIsMounted(true)
    
    const saved = localStorage.getItem('taskFilters')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Convert date strings back to Date objects
        const restored = parsed.map((f: ActiveFilter) => {
          if (f.type === 'date' && f.values.length === 2) {
            return {
              ...f,
              values: [new Date(f.values[0]), new Date(f.values[1])]
            }
          }
          return f
        })
        
        setActiveFilters(restored)
        
        // Restore individual filter states
        restored.forEach((filter: ActiveFilter) => {
          if (filter.type === 'status') setStatusFilters(filter.values)
          else if (filter.type === 'tag') setTagFilters(filter.values)
          else if (filter.type === 'creator') setCreatorFilters(filter.values)
          else if (filter.type === 'assignee') setAssigneeFilters(filter.values)
        })
      } catch (e) {
        console.error('Failed to parse saved filters:', e)
      }
    }
  }, [])

  // Set initial scroll position to today (before paint, no animation)
  useLayoutEffect(() => {
    const container = scrollContainerRef.current
    const miniCalendar = miniCalendarRef.current
    
    if (!container || !miniCalendar) return
    
    // Use a minimal delay to ensure refs are populated
    const timer = setTimeout(() => {
      const now = new Date()
      const todayKey = formatDateKey(now)
      const dayElement = dayRefs.current[todayKey]
      
      if (dayElement) {
        console.log('Setting initial scroll to today:', todayKey, now.toLocaleDateString())
        
        // Use the SAME calculation as scrollToDay() for consistency
        let elementTop = 0
        let element: HTMLElement | null = dayElement
        
        // Walk up the DOM tree to calculate total offset
        while (element && element !== container) {
          elementTop += element.offsetTop
          element = element.offsetParent as HTMLElement
        }
        
        // Account for sticky header + mini calendar (same as scrollToDay)
        const miniCalendarHeight = miniCalendar.offsetHeight
        const headerHeight = 56 // h-14 from header
        
        // Set scroll position directly (no animation for initial load)
        container.scrollTop = elementTop - miniCalendarHeight - headerHeight
        
        // Set ignore flag to prevent scroll handler from triggering
        ignoreScrollUntil.current = Date.now() + 1000
      }
    }, 0)
    
    return () => clearTimeout(timer)
  }, [])

  // Save filters to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('taskFilters', JSON.stringify(activeFilters))
    }
  }, [activeFilters])

  // Sync vertical scroll when mini calendar week changes (via swipe only)
  useEffect(() => {
    // Only sync if we have a target offset to sync to
    const targetOffset = syncToWeekOffset.current
    if (targetOffset === null) return
    
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

  // Calculate matching tasks for a set of filters
  const calculateMatchingTasks = (filters: ActiveFilter[]) => {
    let matchingTasks: any[] = []
    
    allDays.forEach(day => {
      day.tasks.forEach(task => {
        // Apply AND logic between filter types, OR within type
        const matches = filters.every(filter => {
          if (filter.type === 'status' && filter.values.length > 0) {
            return filter.values.includes(task.status)
          }
          if (filter.type === 'tag' && filter.values.length > 0) {
            return task.tags?.some((t: string) => filter.values.includes(t))
          }
          if (filter.type === 'creator' && filter.values.length > 0) {
            return filter.values.includes(task.creatorId)
          }
          if (filter.type === 'assignee' && filter.values.length > 0) {
            return filter.values.includes(task.assigneeId)
          }
          if (filter.type === 'date' && filter.values.length === 2) {
            const taskDate = new Date(task.dueTime)
            return taskDate >= filter.values[0] && taskDate <= filter.values[1]
          }
          return true
        })
        if (matches) matchingTasks.push(task)
      })
    })
    
    return matchingTasks
  }

  // Calculate preview count for pending filters
  const previewCount = useMemo(() => {
    if (pendingFilters.length === 0) return null
    return calculateMatchingTasks(pendingFilters).length
  }, [pendingFilters, allDays])

  const handleSearchClose = () => {
    setIsSearchActive(false)
    setSearchQuery("")
  }

  const handleBellClick = () => {
    if (hasOverdueTasks) {
      setIsOverdueModalVisible(true)
    } else {
      router.push('/notifications')
    }
  }

  // Handler to open sub-sheets from View Tasks sheet
  const handleOpenDateSort = () => {
    setIsViewTasksSheetVisible(false)
    setIsDateRangeVisible(true)
  }

  const handleOpenStatusFilter = () => {
    setIsViewTasksSheetVisible(false)
    setIsStatusSheetVisible(true)
  }

  const handleOpenTagFilter = () => {
    setIsViewTasksSheetVisible(false)
    setIsTagSheetVisible(true)
  }

  const handleOpenCreatorFilter = () => {
    setIsViewTasksSheetVisible(false)
    setIsCreatorSheetVisible(true)
  }

  const handleOpenAssigneeFilter = () => {
    setIsViewTasksSheetVisible(false)
    setIsAssigneeSheetVisible(true)
  }

  // Handler to go back from sub-sheets to View Tasks sheet
  const handleBackToViewTasks = () => {
    setIsStatusSheetVisible(false)
    setIsTagSheetVisible(false)
    setIsCreatorSheetVisible(false)
    setIsAssigneeSheetVisible(false)
    setIsViewTasksSheetVisible(true)
  }

  // Handler to close all sheets
  const handleCloseAllSheets = () => {
    setIsViewTasksSheetVisible(false)
    setIsStatusSheetVisible(false)
    setIsTagSheetVisible(false)
    setIsCreatorSheetVisible(false)
    setIsAssigneeSheetVisible(false)
    setIsDateRangeVisible(false)
  }

  // Handler for date range selection
  const handleDateRangeApply = (range: any) => {
    console.log('Date range selected:', range)
    
    // Update pendingFilters if a range was selected
    if (range && range.startDate && range.endDate) {
      const startDate = new Date(range.startDate)
      const endDate = new Date(range.endDate)
      
      // Count tasks in date range
      const count = allDays.reduce((sum, day) => {
        const dayDate = new Date(day.date)
        if (dayDate >= startDate && dayDate <= endDate) {
          return sum + day.tasks.length
        }
        return sum
      }, 0)
      
      const label = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} (${count})`
      
      setPendingFilters(prev => {
        const without = prev.filter(f => f.type !== 'date')
        return [...without, { type: 'date', label, values: [startDate, endDate] }]
      })
    }
    
    // Return to ViewTasksSheet
    setIsDateRangeVisible(false)
    setIsViewTasksSheetVisible(true)
  }

  // Task handlers
  const handleSaveTask = (task: any) => {
    console.log('Task saved:', task)
    setIsTaskEditorOpen(false)
    setEditingTask(null)
  }

  const handleDeleteTask = (taskId: string) => {
    console.log('Task deleted:', taskId)
  }

  const handleCompleteTask = (taskId: string | number) => {
    console.log('Task completed:', taskId)
  }

  // Define the raw button style here to ensure consistency
  const headerBtnClass = "h-12 w-12 rounded-full flex items-center justify-center hover:bg-blue-50 text-blue-600 transition-colors focus:outline-none"
  
  return (
    <div className="h-screen bg-white flex flex-col pb-20">
      
      {/* 1. TOP NAVIGATION (Sticky) */}
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
                <h1 className="text-xl font-bold text-gray-900">Tasks</h1>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-1">
                {/* Me/All Toggle */}
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
                <div className="relative">
                  <button 
                    className={headerBtnClass}
                    onClick={handleBellClick}
                  >
                    <Bell className="h-[30px] w-[30px]" strokeWidth={2} />
                  </button>
                  {hasOverdueTasks && (
                    <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border border-white pointer-events-none" />
                  )}
                </div>

                {/* Filter Toggle */}
                <button 
                  className={headerBtnClass}
                  onClick={() => {
                    // Initialize pending filters from active filters
                    setPendingFilters([...activeFilters])
                    setIsViewTasksSheetVisible(true)
                  }}
                >
                  <Filter 
                    className={`h-[30px] w-[30px] ${isMounted && activeFilters.length > 0 ? 'text-green-600' : 'text-blue-600'}`} 
                    strokeWidth={2} 
                  />
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
                  placeholder="Search tasks..."
                  className="pl-9 rounded-full bg-gray-100 border-0 focus-visible:ring-0"
                  autoFocus
                />
              </div>
              <button 
                onClick={handleSearchClose}
                className="text-blue-600 hover:text-blue-700 font-medium px-2 hover:bg-transparent"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. FILTER/SEARCH BANNER - Single banner showing search or active filters */}
      {isMounted && (searchQuery.trim() || activeFilters.length > 0) && (
        <div className="sticky top-14 bg-gray-100 z-20 h-[35px] flex items-center px-4 gap-2 overflow-x-auto whitespace-nowrap">
          {/* Show search query if active */}
          {searchQuery.trim() && (
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
          )}
          
          {/* Show filters if no search active */}
          {!searchQuery.trim() && activeFilters
            .sort((a, b) => {
              const order = ['date', 'status', 'tag', 'creator', 'assignee']
              return order.indexOf(a.type) - order.indexOf(b.type)
            })
            .map((filter, index) => (
              <div key={`${filter.type}-${index}`} className="flex items-center gap-1 shrink-0">
                <span className="text-sm text-gray-700">
                  {filter.label}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveFilters(prev => prev.filter((_, i) => i !== index))
                  }}
                  className="p-0.5 hover:bg-gray-300 rounded-full transition-colors"
                >
                  <X className="h-3.5 w-3.5 text-gray-600" />
                </button>
                {index < activeFilters.length - 1 && (
                  <span className="text-gray-400 mx-1">•</span>
                )}
              </div>
            ))}
        </div>
      )}

      {/* 3. MINI CALENDAR STRIP - Three weeks for smooth dragging (hidden when filters or search active) */}
      {(!isMounted || (activeFilters.length === 0 && !searchQuery.trim())) && (
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
          }}
        >
          {/* Previous Week */}
          <div className="w-1/3 px-2">
            <div className="grid grid-cols-7 gap-1">
              {threeWeeks.prev.map((day) => (
                <button
                  key={day.dateKey}
                  onClick={() => scrollToDay(day.dateKey)}
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
                  onClick={() => scrollToDay(day.dateKey)}
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
                  onClick={() => scrollToDay(day.dateKey)}
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

      {/* 4. SCROLLABLE LIST AREA */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-auto bg-white pb-24"
      >
        {weekGroups.map((week, weekIndex) => (
          <div key={formatDateKey(week.weekStart)}>
            {/* Days in Week */}
            {week.days.map((day) => {
              const isCollapsed = day.isPast && isSameDay(day.date, today)
              
              if (isCollapsed) return null
              
              return (
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

                    {/* Right: Content or Empty State */}
                    <div className="flex-1 min-w-0">
                      {day.tasks.length > 0 ? (
                        <div className="space-y-3">
                          {day.tasks.map((task) => (
                            <button 
                              key={task.id}
                              onClick={() => {
                                setEditingTask(task)
                                setIsTaskEditorOpen(true)
                              }}
                              className={`w-full text-left rounded-xl p-4 border transition-all active:scale-[0.99] ${
                                task.status === 'done' 
                                  ? 'bg-gray-50 border-gray-200 opacity-75' 
                                  : 'bg-white border-gray-200 shadow-sm hover:border-blue-200'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                      {task.time}
                                    </span>
                                    {task.isBounty && (
                                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-0 h-5 px-1.5 text-[10px] font-bold">
                                        {task.price} BOUNTY
                                      </Badge>
                                    )}
                                  </div>
                                  <h3 className={`font-semibold truncate ${
                                    task.status === 'done' ? 'text-gray-500 line-through' : 'text-gray-900'
                                  }`}>
                                    {task.title}
                                  </h3>
                                </div>
                                
                                {/* Avatar / Assignee */}
                                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs font-bold border-2 border-white shadow-sm shrink-0">
                                  PS
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        /* Empty State: Add Button (only for today and future) */
                        !day.isPast && (
                          <button className="h-10 flex items-center text-blue-500 hover:text-blue-600 font-medium transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                            <Plus className="h-5 w-5 mr-1" />
                            Add Task
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            
            {/* Week Separator with Totals (hidden when filters active) */}
            {weekIndex < weekGroups.length - 1 && activeFilters.length === 0 && !searchQuery.trim() && (
              <div className="h-5 bg-gray-100 border-y border-gray-200 flex items-center justify-center gap-3">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                  {week.days[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {week.days[week.days.length - 1].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span className="text-[10px] font-semibold text-gray-400">•</span>
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                  {week.completedCount} done · {week.incompleteCount} pending
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 4. FIXED CREATE TASK BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-40">
        <button
          onClick={() => setIsTaskEditorOpen(true)}
          className="w-full h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-base font-medium shadow-lg flex items-center justify-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create task
        </button>
      </div>

      {/* Modals & Sheets */}
      <ViewTasksSheet
        isVisible={isViewTasksSheetVisible}
        onClose={() => {
          // Discard pending changes on cancel
          setPendingFilters([...activeFilters])
          setIsViewTasksSheetVisible(false)
        }}
        onOpenDateSort={handleOpenDateSort}
        onOpenStatusFilter={handleOpenStatusFilter}
        onOpenTagFilter={handleOpenTagFilter}
        onOpenCreatorFilter={handleOpenCreatorFilter}
        onOpenAssigneeFilter={handleOpenAssigneeFilter}
        activeFilters={pendingFilters}
        previewCount={previewCount}
        onClearAll={() => setPendingFilters([])}
        onApplyFilters={() => {
          setActiveFilters([...pendingFilters])
          setIsViewTasksSheetVisible(false)
        }}
        calculateMatchingTasks={calculateMatchingTasks}
        allDays={allDays}
      />

      <SortStatusSheet
        isVisible={isStatusSheetVisible}
        onClose={() => {
          // Discard changes and return to ViewTasksSheet
          setIsStatusSheetVisible(false)
          setIsViewTasksSheetVisible(true)
        }}
        onBack={() => {
          setIsStatusSheetVisible(false)
          setIsViewTasksSheetVisible(true)
        }}
        activeFilters={statusFilters}
        onApplyFilters={(filters) => {
          setStatusFilters(filters)
          // Update pendingFilters
          if (filters.length > 0) {
            const statusNames = filters.map(f => {
              const statusMap: Record<string, string> = { 
                'new': 'New',
                'open': 'Open', 
                'late': 'Late',
                'done': 'Done' 
              }
              return statusMap[f] || f
            }).join(', ')
            
            setPendingFilters(prev => {
              const without = prev.filter(f => f.type !== 'status')
              return [...without, { type: 'status', label: `Status: ${statusNames}`, values: filters }]
            })
          } else {
            setPendingFilters(prev => prev.filter(f => f.type !== 'status'))
          }
          // Return to ViewTasksSheet
          setIsStatusSheetVisible(false)
          setIsViewTasksSheetVisible(true)
        }}
        pendingFilters={pendingFilters}
        calculateMatchingTasks={calculateMatchingTasks}
        allDays={allDays}
      />

      <TagSelectionSheet
        isOpen={isTagSheetVisible}
        onClose={() => {
          setIsTagSheetVisible(false)
          setIsViewTasksSheetVisible(true)
        }}
        selectedTagIds={tagFilters}
        onTagsChange={(tags) => {
          setTagFilters(tags)
          // Update pendingFilters
          if (tags.length > 0) {
            const tagLabel = tags.join(', ')
            setPendingFilters(prev => {
              const without = prev.filter(f => f.type !== 'tag')
              return [...without, { type: 'tag', label: `Tags: ${tagLabel}`, values: tags }]
            })
          } else {
            setPendingFilters(prev => prev.filter(f => f.type !== 'tag'))
          }
          // Return to ViewTasksSheet
          setIsTagSheetVisible(false)
          setIsViewTasksSheetVisible(true)
        }}
        pendingFilters={pendingFilters}
        calculateMatchingTasks={calculateMatchingTasks}
        allDays={allDays}
      />

      <SortUserSheet
        isVisible={isCreatorSheetVisible}
        onClose={() => {
          setIsCreatorSheetVisible(false)
          setIsViewTasksSheetVisible(true)
        }}
        onBack={() => {
          setIsCreatorSheetVisible(false)
          setIsViewTasksSheetVisible(true)
        }}
        title="Filter by Creator"
        users={[
          { id: 'u-1', name: 'Pete Seager', initials: 'PS', color: 'orange' },
          { id: 'u-2', name: 'Jane Smith', initials: 'JS', color: 'blue' }
        ]}
        activeUserIds={creatorFilters}
        onApplyFilters={(userIds) => {
          setCreatorFilters(userIds)
          // Update pendingFilters
          if (userIds.length > 0) {
            const users = [
              { id: 'u-1', name: 'Pete Seager' },
              { id: 'u-2', name: 'Jane Smith' }
            ]
            const names = userIds.map(id => users.find(u => u.id === id)?.name || id).join(', ')
            setPendingFilters(prev => {
              const without = prev.filter(f => f.type !== 'creator')
              return [...without, { type: 'creator', label: `Creator: ${names}`, values: userIds }]
            })
          } else {
            setPendingFilters(prev => prev.filter(f => f.type !== 'creator'))
          }
          // Return to ViewTasksSheet
          setIsCreatorSheetVisible(false)
          setIsViewTasksSheetVisible(true)
        }}
        currentUserId={currentUserId}
        pendingFilters={pendingFilters}
        calculateMatchingTasks={calculateMatchingTasks}
        allDays={allDays}
        filterType="creator"
      />

      <SortUserSheet
        isVisible={isAssigneeSheetVisible}
        onClose={() => {
          setIsAssigneeSheetVisible(false)
          setIsViewTasksSheetVisible(true)
        }}
        onBack={() => {
          setIsAssigneeSheetVisible(false)
          setIsViewTasksSheetVisible(true)
        }}
        title="Filter by Assignee"
        users={[
          { id: 'u-1', name: 'Pete Seager', initials: 'PS', color: 'orange' },
          { id: 'u-2', name: 'Jane Smith', initials: 'JS', color: 'blue' }
        ]}
        activeUserIds={assigneeFilters}
        onApplyFilters={(userIds) => {
          setAssigneeFilters(userIds)
          // Update pendingFilters
          if (userIds.length > 0) {
            const users = [
              { id: 'u-1', name: 'Pete Seager' },
              { id: 'u-2', name: 'Jane Smith' }
            ]
            const names = userIds.map(id => users.find(u => u.id === id)?.name || id).join(', ')
            setPendingFilters(prev => {
              const without = prev.filter(f => f.type !== 'assignee')
              return [...without, { type: 'assignee', label: `Assignee: ${names}`, values: userIds }]
            })
          } else {
            setPendingFilters(prev => prev.filter(f => f.type !== 'assignee'))
          }
          // Return to ViewTasksSheet
          setIsAssigneeSheetVisible(false)
          setIsViewTasksSheetVisible(true)
        }}
        currentUserId={currentUserId}
        pendingFilters={pendingFilters}
        calculateMatchingTasks={calculateMatchingTasks}
        allDays={allDays}
        filterType="assignee"
      />

      <OverdueTasksModal
        isVisible={isOverdueModalVisible}
        onClose={() => setIsOverdueModalVisible(false)}
        tasks={overdueTasks}
        onMarkDone={(taskId) => console.log('Mark done:', taskId)}
        currentUserId={currentUserId}
      />

      <TaskEditor
        isVisible={isTaskEditorOpen}
        onClose={() => {
          setIsTaskEditorOpen(false)
          setEditingTask(null)
        }}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        onComplete={handleCompleteTask}
        initialTask={editingTask}
      />

      <DateRangeModal
        isVisible={isDateRangeVisible}
        onClose={() => {
          setIsDateRangeVisible(false)
          setIsViewTasksSheetVisible(true)
        }}
        onApply={handleDateRangeApply}
      />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}

export default function TasksPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <TasksPageContent />
    </Suspense>
  )
}
