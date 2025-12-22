"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, Paperclip, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface Task {
  id?: string
  title: string
  description?: string
  startTime?: string
  dueTime?: string
  assigneeId?: string
  tags?: string[]
  status?: string
  priority?: string
  creatorId?: string
  completed?: boolean
  requirePhoto?: boolean
}

interface TaskEditorProps {
  isVisible: boolean
  onClose: () => void
  onSave: (task: Task) => void
  initialTask?: Task | null
}

export function TaskEditor({ isVisible, onClose, onSave, initialTask }: TaskEditorProps) {
  const [taskTitle, setTaskTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("December 18, 2025")
  const [startTime, setStartTime] = useState("2:00 PM")
  const [dueDate, setDueDate] = useState("December 18, 2025")
  const [dueTime, setDueTime] = useState("3:00 PM")
  const [requirePhoto, setRequirePhoto] = useState(false)

  // Initialize form from initialTask when it changes
  useEffect(() => {
    if (initialTask) {
      setTaskTitle(initialTask.title || "")
      setDescription(initialTask.description || "")
      setRequirePhoto(initialTask.requirePhoto || false)
      // TODO: Parse and set dates from initialTask.startTime and initialTask.dueTime
    } else {
      // Reset to defaults for create mode
      setTaskTitle("")
      setDescription("")
      setRequirePhoto(false)
      setStartDate("December 18, 2025")
      setStartTime("2:00 PM")
      setDueDate("December 18, 2025")
      setDueTime("3:00 PM")
    }
  }, [initialTask, isVisible])

  const handlePublish = () => {
    const newTask: Task = {
      id: initialTask?.id || `t${Date.now()}`,
      title: taskTitle,
      description,
      requirePhoto,
      // TODO: Convert dates to proper ISO format
      startTime: new Date().toISOString(),
      dueTime: new Date().toISOString(),
      status: initialTask?.status || "new",
      priority: initialTask?.priority || "medium",
      assigneeId: initialTask?.assigneeId || "u1",
      creatorId: initialTask?.creatorId || "u1",
      tags: initialTask?.tags || [],
      completed: initialTask?.completed || false,
    }
    onSave(newTask)
    onClose()
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-white flex flex-col z-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b px-4 py-4 flex items-center gap-4 z-10">
        <Button variant="ghost" size="icon" className="h-10 w-10 -ml-2" onClick={onClose}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold flex-1 text-center mr-10">
          {initialTask ? "Edit task" : "Create new task"}
        </h1>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto px-4 pt-0">
        {/* Task Title */}
        <div className="h-[50px] flex items-center border-b">
          <Input
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            className="text-xl font-bold border-0 px-0 h-full focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Task title"
          />
        </div>

        {/* Description Area */}
        <div className="mt-5 mb-3">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Task description"
            className="min-h-[120px] resize-none border border-gray-200 rounded-lg px-3 py-2 text-lg placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-blue-500"
          />
          <div className="flex items-center justify-between mt-2">
            <label className="flex items-center gap-2 text-base text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={requirePhoto}
                onChange={(e) => setRequirePhoto(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <span>Require photo for completion</span>
            </label>
            <button className="hover:opacity-80">
              <Paperclip className="h-6 w-6 text-blue-500" />
            </button>
          </div>
        </div>

        {/* Start Time */}
        <div className="flex items-center justify-between h-[50px] border-b">
          <span className="text-lg font-normal">Start time</span>
          <div className="flex items-center gap-2">
            <span className="text-blue-500 text-base">{startDate}</span>
            <span className="text-blue-500 text-base">{startTime}</span>
            <button className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Due Time */}
        <div className="flex items-center justify-between h-[50px] border-b">
          <span className="text-lg font-normal">Due time</span>
          <div className="flex items-center gap-2">
            <span className="text-blue-500 text-base">{dueDate}</span>
            <span className="text-blue-500 text-base">{dueTime}</span>
            <button className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Assigned To */}
        <div className="flex items-center justify-between h-[50px] border-b">
          <span className="text-lg font-normal">Assigned to</span>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100">
            <div className="h-6 w-6 rounded-full bg-orange-400 flex items-center justify-center text-white text-xs font-semibold">
              PS
            </div>
            <span className="text-base">Pete Seager</span>
          </button>
        </div>

        {/* Labels */}
        <div className="flex items-center justify-between h-[50px] border-b">
          <span className="text-lg font-normal">Labels</span>
          <Button variant="ghost" className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 h-auto py-1 text-base">
            Select
          </Button>
        </div>

        {/* Location */}
        <div className="flex items-center justify-between h-[50px] border-b">
          <span className="text-lg font-normal">Location</span>
          <Button variant="ghost" className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 h-auto py-1 text-base">
            Select
          </Button>
        </div>

        {/* Sub-tasks */}
        <div className="flex items-center justify-between h-[50px] border-b">
          <span className="text-lg font-normal">Sub-tasks</span>
          <Button variant="ghost" className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 h-auto py-1 text-base">
            Add
          </Button>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="sticky bottom-0 bg-white border-t px-4 py-4 flex items-center gap-3">
        <Button 
          variant="outline" 
          className="flex-1 h-11 text-lg font-medium bg-transparent rounded-full"
          onClick={onClose}
        >
          Discard
        </Button>
        <Button 
          className="flex-1 h-11 bg-teal-400 hover:bg-teal-500 text-white text-lg font-medium rounded-full"
          onClick={() => alert("Save draft functionality not yet implemented")}
        >
          Save draft
        </Button>
        <Button 
          className="flex-1 h-11 bg-blue-500 hover:bg-blue-600 text-white text-lg font-medium rounded-full"
          onClick={handlePublish}
        >
          Publish task
        </Button>
      </div>
    </div>
  )
}
