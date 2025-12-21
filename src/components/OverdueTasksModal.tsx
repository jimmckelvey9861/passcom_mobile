"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, Check, MessageSquare, X } from "lucide-react"

interface Task {
  id: string
  title: string
  startTime?: string
  dueTime?: string
  status?: string
  assigneeId?: string
  creatorId?: string
  labels?: string[]
  comments?: number
  completed?: boolean
}

interface TaskGroup {
  date: string
  tasks: Task[]
}

interface OverdueTasksModalProps {
  isVisible: boolean
  onClose: () => void
  tasks: Task[]
  onMarkDone: (taskId: string) => void
  currentUserId?: string
}

export default function OverdueTasksModal({
  isVisible,
  onClose,
  tasks,
  onMarkDone,
  currentUserId = "current-user"
}: OverdueTasksModalProps) {
  const [selectedFilter, setSelectedFilter] = useState("My tasks")
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

  // Filter overdue tasks
  const overdueTasks = useMemo(() => {
    const now = new Date()
    return tasks.filter(task => {
      // Check if task is overdue and not done (must match TaskList.tsx logic)
      const isDue = task.dueTime ? new Date(task.dueTime) < now : false
      const isDone = task.status?.toLowerCase() === 'done' || task.completed === true
      
      if (!isDue || isDone) return false

      // Apply selected filter
      if (selectedFilter === "My tasks") {
        return task.assigneeId === currentUserId
      } else if (selectedFilter === "Tasks I created") {
        return task.creatorId === currentUserId
      }
      // "All tasks"
      return true
    })
  }, [tasks, selectedFilter, currentUserId])

  // Group tasks by due date
  const taskGroups = useMemo(() => {
    const groups: { [key: string]: Task[] } = {}
    
    overdueTasks.forEach(task => {
      if (!task.dueTime) return
      
      const dueDate = new Date(task.dueTime)
      const dateKey = dueDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      })
      
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(task)
    })

    // Convert to array and sort by date (most recent first)
    return Object.entries(groups)
      .map(([date, tasks]) => ({
        date,
        tasks: tasks.sort((a, b) => {
          const dateA = a.dueTime ? new Date(a.dueTime).getTime() : 0
          const dateB = b.dueTime ? new Date(b.dueTime).getTime() : 0
          return dateB - dateA
        })
      }))
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime()
        const dateB = new Date(b.date).getTime()
        return dateB - dateA
      })
  }, [overdueTasks])

  const formatDateTime = (dateTimeString?: string) => {
    if (!dateTimeString) return ""
    const date = new Date(dateTimeString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    })
  }

  const getInitials = (name: string) => {
    const parts = name.split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const getAvatarColor = (id: string) => {
    // Generate consistent color from ID
    const colors = ["#FF9E7A", "#A78BFA", "#60A5FA", "#34D399", "#FBBF24", "#F87171"]
    const index = parseInt(id.substring(0, 2), 36) % colors.length
    return colors[index]
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      {/* Modal Container */}
      <div className="bg-white w-full max-h-[90vh] rounded-t-3xl flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b flex items-center justify-between">
          <h1 className="text-2xl font-bold">Overdue tasks</h1>
          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-1 text-base text-gray-700 hover:text-gray-900"
            >
              {selectedFilter}
              <ChevronDown className="h-4 w-4" />
            </button>
            {showFilterDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowFilterDropdown(false)}
                />
                <div className="absolute right-0 top-full mt-2 bg-white border rounded-lg shadow-lg py-2 w-48 z-20">
                  <button
                    onClick={() => {
                      setSelectedFilter("My tasks")
                      setShowFilterDropdown(false)
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    My tasks
                  </button>
                  <button
                    onClick={() => {
                      setSelectedFilter("All tasks")
                      setShowFilterDropdown(false)
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    All tasks
                  </button>
                  <button
                    onClick={() => {
                      setSelectedFilter("Tasks I created")
                      setShowFilterDropdown(false)
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Tasks I created
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Scrollable Task List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {taskGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-gray-500 text-base">No overdue tasks found</p>
              <p className="text-gray-400 text-sm mt-2">You're all caught up!</p>
            </div>
          ) : (
            taskGroups.map((group) => (
              <div key={group.date} className="mb-6">
                {/* Date Group Header */}
                <h2 className="text-base font-bold text-gray-900 mb-3">{group.date}</h2>
                {/* Task Cards */}
                <div className="space-y-3">
                  {group.tasks.map((task) => (
                    <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      {/* Row 1: Task Title */}
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base font-semibold text-gray-900">{task.title}</h3>
                        <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      </div>
                      {/* Row 2: Urgency Time Range in RED */}
                      <p className="text-sm font-medium mb-3" style={{ color: "#D32F2F" }}>
                        Starts {formatDateTime(task.startTime)} - Due {formatDateTime(task.dueTime)}
                      </p>
                      {/* Row 3: Meta Information */}
                      <div className="flex items-center justify-between mb-3">
                        {/* Left: Label (if exists) + Avatar + Name */}
                        <div className="flex items-center gap-2">
                          {task.labels && task.labels.length > 0 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                              {task.labels[0]}
                            </span>
                          )}
                          <div
                            className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                            style={{ backgroundColor: getAvatarColor(task.assigneeId || task.id) }}
                          >
                            {getInitials(task.assigneeId || "User")}
                          </div>
                          <span className="text-sm text-gray-700">{task.assigneeId || "Unassigned"}</span>
                        </div>
                        {/* Right: Comments */}
                        <div className="flex items-center gap-1 text-gray-500">
                          <MessageSquare className="h-4 w-4" />
                          <span className="text-sm">{task.comments || 0}</span>
                        </div>
                      </div>
                      {/* Row 4: Mark as Done Button */}
                      <Button
                        variant="ghost"
                        onClick={() => onMarkDone(task.id)}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Mark as done
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: Sticky Close Button */}
        <div className="px-6 py-4 border-t bg-white">
          <Button
            variant="outline"
            className="w-full rounded-full py-6 text-base font-medium bg-transparent"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

