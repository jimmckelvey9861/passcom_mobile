"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, Check } from "lucide-react"
import { TaskCard } from "@/components/TaskCard"

interface Task {
  id: string
  title: string
  startTime?: string
  dueTime?: string
  status?: string
  assigneeId?: string
  creatorId?: string
  tags?: string[]
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

  // Helper function to format date for TaskCard
  const formatTaskDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    const month = date.toLocaleString('en-US', { month: 'short' })
    const day = date.getDate()
    const time = date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    return `${month} ${day} ${time}`
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
              <p className="text-gray-400 text-sm mt-2">You&apos;re all caught up!</p>
            </div>
          ) : (
            taskGroups.map((group) => (
              <div key={group.date} className="mb-6">
                {/* Date Group Header */}
                <h2 className="text-base font-bold text-gray-900 mb-3">{group.date}</h2>
                {/* Task Cards */}
                <div className="space-y-3">
                  {group.tasks.map((task) => (
                    <div key={task.id} className="space-y-2">
                      <TaskCard
                        title={task.title}
                        startDate={formatTaskDate(task.startTime)}
                        dueDate={formatTaskDate(task.dueTime)}
                        status="late"
                        onClick={() => alert(`Open task details for: ${task.title}`)}
                      />
                      <Button
                        variant="ghost"
                        onClick={() => onMarkDone(task.id)}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg"
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

