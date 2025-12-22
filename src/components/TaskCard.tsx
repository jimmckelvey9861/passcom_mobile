"use client"

import { ChevronRight } from "lucide-react"

interface TaskCardProps {
  title: string
  startDate: string
  dueDate: string
  status: 'late' | 'new' | 'todo' | 'done' | string // Allow string for flexibility
  onClick?: () => void
}

export function TaskCard({ title, startDate, dueDate, status, onClick }: TaskCardProps) {
  
  // Helper to determine background color based on status
  const getCardStyle = (s: string) => {
    switch (s.toLowerCase()) {
      case 'late':
        return 'bg-red-50 border-red-100 hover:bg-red-100'
      case 'new':
        return 'bg-green-50 border-green-100 hover:bg-green-100'
      case 'todo': // covers "open" as well if needed
      case 'open':
        return 'bg-blue-50 border-blue-100 hover:bg-blue-100'
      case 'done':
        return 'bg-gray-100 border-gray-200 hover:bg-gray-200 opacity-80'
      default:
        return 'bg-white border-gray-100 hover:bg-gray-50'
    }
  }

  const isDone = status.toLowerCase() === 'done';

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 border-b cursor-pointer transition-colors ${getCardStyle(status)}`}
    >
      {/* Middle: 2-Line Content */}
      <div className="flex-1 min-w-0">
        {/* Line 1: Task Title */}
        <h3 className={`font-medium text-[16px] text-gray-900 truncate leading-tight ${isDone ? 'line-through text-gray-500' : ''}`}>
          {title}
        </h3>

        {/* Line 2: Start and Due dates */}
        <div className="flex items-center text-[13px] text-gray-500 mt-1 leading-tight">
          <span className="truncate">
            Start: {startDate} • Due: {dueDate}
          </span>
        </div>
      </div>

      {/* Right: Chevron */}
      <ChevronRight className="h-5 w-5 text-gray-400 shrink-0" />
    </div>
  )
}
