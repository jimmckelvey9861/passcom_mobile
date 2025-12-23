"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronDown } from "lucide-react"
import { TaskCard } from "@/components/TaskCard"

// Helper function to format date
function formatTaskDate(dateString: string | Date | undefined): string {
  if (!dateString) return "No date"
  const date = new Date(dateString)
  const month = date.toLocaleString('en-US', { month: 'short' })
  const day = date.getDate()
  const time = date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  return `${month} ${day} ${time}`
}

interface Task {
  id: number | string
  title: string
  subtitle?: string
  completed: boolean
  dueDate?: Date
  priority?: string
  startTime?: Date | string
  dueTime?: Date | string
  status?: string
}

interface CalendarAgendaViewProps {
  tasks: Task[]
  onCreateTask: () => void
  onDateSelect?: (date: Date) => void
  currentDate: Date | undefined
  viewMode: "Day" | "Week" | "Month"
  onPreviousRange: () => void
  onNextRange: () => void
}

export default function CalendarAgendaView({
  tasks,
  onCreateTask,
  onDateSelect,
  currentDate,
  viewMode,
  onPreviousRange,
  onNextRange,
}: CalendarAgendaViewProps) {
  // State for accordion - track which dates are expanded (allow multiple)
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set())
  // Generate days based on view mode
  const generateDays = (): Date[] => {
    const days: Date[] = []
    if (!currentDate) return days
    const startDate = new Date(currentDate)

    if (viewMode === "Day") {
      // Show current day only
      days.push(startDate)
    } else if (viewMode === "Week") {
      // Show 7 days starting from the beginning of the week
      const dayOfWeek = startDate.getDay()
      startDate.setDate(startDate.getDate() - dayOfWeek)
      for (let i = 0; i < 7; i++) {
        const day = new Date(startDate)
        day.setDate(startDate.getDate() + i)
        days.push(day)
      }
    } else if (viewMode === "Month") {
      // Show all days in the current month
      const year = startDate.getFullYear()
      const month = startDate.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const daysInMonth = lastDay.getDate()

      for (let i = 0; i < daysInMonth; i++) {
        const day = new Date(year, month, i + 1)
        days.push(day)
      }
    }

    return days
  }

  // Helper function to get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false
      const taskDate = new Date(task.dueDate)
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      )
    })
  }

  // Check if a date is today
  const isToday = (date: Date): boolean => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  // Check if a date is yesterday
  const isYesterday = (date: Date): boolean => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    )
  }

  // Format date for display
  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
    }
    return date.toLocaleDateString("en-US", options)
  }

  // Format date range for the pill
  const formatDateRange = (): string => {
    const days = generateDays()
    if (days.length === 0) return ""

    const first = days[0]
    const last = days[days.length - 1]

    if (viewMode === "Day") {
      return formatDate(first)
    }

    const formatShort = (d: Date) => {
      return `${d.getMonth() + 1}/${d.getDate()}`
    }

    return `${formatShort(first)} - ${formatShort(last)}`
  }

  const agendaDays = generateDays()

  // Helper to get date key for comparison
  const getDateKey = (date: Date): string => {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
  }

  // Toggle accordion
  const toggleDate = (date: Date) => {
    const dateKey = getDateKey(date)
    setExpandedDates((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(dateKey)) {
        newSet.delete(dateKey)
      } else {
        newSet.add(dateKey)
      }
      return newSet
    })
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      {/* Agenda List */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 bg-white">
        {agendaDays.map((day, index) => {
          const dayTasks = getTasksForDate(day)
          const openCount = dayTasks.filter((t) => !t.completed).length
          const doneCount = dayTasks.filter((t) => t.completed).length
          const totalCount = dayTasks.length
          const dateKey = getDateKey(day)
          const isExpanded = expandedDates.has(dateKey)

          return (
            <div key={index} className="border-b border-gray-100 last:border-0">
              {/* Date Header Row */}
              <button
                onClick={() => toggleDate(day)}
                className="w-full flex items-center justify-between py-4 hover:bg-gray-50 transition-colors"
              >
                {/* Left: Date */}
                <div className="text-base text-left flex items-center gap-2">
                  {/* Chevron Icon */}
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                  <span className={isToday(day) || isYesterday(day) ? "font-normal" : ""}>{formatDate(day)}</span>
                  {isYesterday(day) && <span className="font-bold"> - Yesterday</span>}
                  {isToday(day) && <span className="font-bold"> - Today</span>}
                </div>

                {/* Right: Task Summary (only show when collapsed) */}
                {!isExpanded && (
                  <div className="flex items-center gap-2">
                    {totalCount === 0 ? (
                      <span className="text-gray-400 text-sm">No tasks</span>
                    ) : (
                      <>
                        {openCount > 0 && (
                          <div className="px-3 py-1 bg-blue-100 rounded-full">
                            <span className="text-blue-700 text-sm font-medium">
                              {openCount} open
                            </span>
                          </div>
                        )}
                        {doneCount > 0 && (
                          <div className="px-3 py-1 bg-green-100 rounded-full">
                            <span className="text-green-700 text-sm font-medium">
                              {doneCount} done
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </button>

              {/* Expanded Task Cards */}
              {isExpanded && (
                <div className="pb-4">
                  {dayTasks.length === 0 ? (
                    <div className="text-center py-6 text-gray-400">
                      No tasks for this day
                    </div>
                  ) : (
                    dayTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        title={task.title}
                        startDate={formatTaskDate(task.startTime)}
                        dueDate={formatTaskDate(task.dueTime)}
                        status={task.status || 'todo'}
                        onClick={() => alert(`Open task details for: ${task.title}`)}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Fixed Action Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <Button
          onClick={onCreateTask}
          className="w-full h-14 bg-cyan-400 hover:bg-cyan-500 text-white text-base font-medium rounded-full"
        >
          Create task
        </Button>
      </div>
    </div>
  )
}

