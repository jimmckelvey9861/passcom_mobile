"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Task {
  id: number
  title: string
  subtitle: string
  completed: boolean
  dueDate?: Date
  priority?: string
}

interface CalendarAgendaViewProps {
  tasks: Task[]
  onCreateTask: () => void
  onDateSelect?: (date: Date) => void
  currentDate: Date
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
  // Generate days based on view mode
  const generateDays = (): Date[] => {
    const days: Date[] = []
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

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Date Range Indicator */}
      <div className="bg-white px-4 py-4 border-b">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={onPreviousRange}
            className="h-10 w-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="px-6 py-2 bg-gray-100 rounded-full">
            <span className="text-sm font-medium text-gray-700">{formatDateRange()}</span>
          </div>
          <button
            onClick={onNextRange}
            className="h-10 w-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Agenda List */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 bg-white">
        {agendaDays.map((day, index) => {
          const dayTasks = getTasksForDate(day)
          const openCount = dayTasks.filter((t) => !t.completed).length
          const doneCount = dayTasks.filter((t) => t.completed).length
          const totalCount = dayTasks.length

          return (
            <button
              key={index}
              onClick={() => onDateSelect?.(day)}
              className="w-full flex items-center justify-between py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
            >
              {/* Left: Date */}
              <div className="text-base text-left">
                <span className={isToday(day) || isYesterday(day) ? "font-normal" : ""}>{formatDate(day)}</span>
                {isYesterday(day) && <span className="font-bold"> - Yesterday</span>}
                {isToday(day) && <span className="font-bold"> - Today</span>}
              </div>

              {/* Right: Task Summary */}
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
            </button>
          )
        })}
      </div>

      {/* Floating Action Button */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center px-4">
        <Button
          onClick={onCreateTask}
          className="w-full max-w-md h-14 bg-cyan-400 hover:bg-cyan-500 text-white text-base font-medium rounded-full shadow-lg"
        >
          Create task
        </Button>
      </div>
    </div>
  )
}

