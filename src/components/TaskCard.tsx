"use client"

import { ChevronRight } from "lucide-react"

interface Task {
  id: string | number
  title: string
  startTime?: string
  dueTime?: string
  status?: string
  completed?: boolean
  assigneeId?: string
  [key: string]: any // Allow other task properties
}

interface TaskCardProps {
  task: Task
  onPress?: () => void
  onToggleStatus?: (taskId: string | number) => void
}

export default function TaskCard({ task, onPress, onToggleStatus }: TaskCardProps) {
  const isCompleted = task.completed || task.status?.toLowerCase() === "done"

  // Format date/time
  const formatDateTime = (isoString?: string): string => {
    if (!isoString) return ""
    
    const date = new Date(isoString)
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)

    // Check if it's today, tomorrow, or yesterday
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()

    const isTomorrow =
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear()

    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()

    const timeString = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })

    if (isToday) return `Today, ${timeString}`
    if (isTomorrow) return `Tomorrow, ${timeString}`
    if (isYesterday) return `Yesterday, ${timeString}`

    // Otherwise show date
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  // Get assignee name or ID
  const getAssigneeName = (): string => {
    if (!task.assigneeId) return "Unassigned"
    if (task.assigneeId === "u1") return "Me"
    if (task.assigneeId === "unassigned") return "Unassigned"
    // Return the ID as a fallback (could be enhanced with user lookup)
    return task.assigneeId
  }

  const handleStatusToggle = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering onPress
    if (onToggleStatus) {
      onToggleStatus(task.id)
    }
  }

  return (
    <div
      onClick={onPress}
      className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
    >
      {/* Left: Status Circle/Checkbox */}
      <div
        onClick={handleStatusToggle}
        className="shrink-0 cursor-pointer"
      >
        {isCompleted ? (
          <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        ) : (
          <div className="h-10 w-10 rounded-full border-2 border-gray-300 hover:border-gray-400 transition-colors" />
        )}
      </div>

      {/* Middle: 2-Line Content */}
      <div className="flex-1 min-w-0">
        {/* Line 1: Task Title */}
        <h3
          className={`font-medium text-base text-gray-900 truncate ${
            isCompleted ? "line-through text-gray-400" : ""
          }`}
        >
          {task.title}
        </h3>
        
        {/* Line 2: Due Date • Assignee Name */}
        <div className={`flex items-center gap-2 text-sm ${isCompleted ? "text-gray-400" : "text-gray-500"}`}>
          <span>{formatDateTime(task.dueTime)}</span>
          <span>•</span>
          <span>{getAssigneeName()}</span>
        </div>
      </div>

      {/* Right: Chevron */}
      <ChevronRight className="h-5 w-5 text-gray-400 shrink-0" />
    </div>
  )
}

