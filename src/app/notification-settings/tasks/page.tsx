"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

export default function TaskSettingsPage() {
  const router = useRouter()
  
  // My Tasks State
  const [taskAssigned, setTaskAssigned] = useState(true)
  const [taskEdited, setTaskEdited] = useState(true)
  const [taskOverdue, setTaskOverdue] = useState(true)
  const [taskApproaching, setTaskApproaching] = useState(false)

  // Created Tasks State
  const [createdCompleted, setCreatedCompleted] = useState(true)
  const [createdComment, setCreatedComment] = useState(true)
  const [createdViewed, setCreatedViewed] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b px-4 py-2 flex items-center gap-2 z-10 h-14">
        <button 
           className="h-12 w-12 rounded-full flex items-center justify-center hover:bg-blue-50 text-blue-600 transition-colors -ml-2"
           onClick={() => router.back()}
        >
          <ArrowLeft className="h-[30px] w-[30px]" strokeWidth={2.5} />
        </button>
        <h1 className="text-lg font-semibold flex-1">Task Settings</h1>
      </div>

      <div className="flex-1 overflow-auto py-6">
        
        {/* Section 1: My Tasks */}
        <div className="mb-6">
          <h2 className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Tasks Assigned to Me</h2>
          <div className="bg-white border-y border-gray-100 divide-y divide-gray-100">
            
            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-base text-gray-900">New task assigned</span>
              <Switch checked={taskAssigned} onCheckedChange={setTaskAssigned} />
            </div>

            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-base text-gray-900">Task details edited</span>
              <Switch checked={taskEdited} onCheckedChange={setTaskEdited} />
            </div>

            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-base text-gray-900">Task is past due</span>
              <Switch checked={taskOverdue} onCheckedChange={setTaskOverdue} />
            </div>

            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-base text-gray-900">Start time is approaching</span>
              <Switch checked={taskApproaching} onCheckedChange={setTaskApproaching} />
            </div>
          </div>
        </div>

        {/* Section 2: Created Tasks */}
        <div className="mb-6">
          <h2 className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Tasks I Created</h2>
          <div className="bg-white border-y border-gray-100 divide-y divide-gray-100">
            
            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-base text-gray-900">User completes a task</span>
              <Switch checked={createdCompleted} onCheckedChange={setCreatedCompleted} />
            </div>

            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-base text-gray-900">User adds a comment</span>
              <Switch checked={createdComment} onCheckedChange={setCreatedComment} />
            </div>

            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-base text-gray-900">User views the task</span>
              <Switch checked={createdViewed} onCheckedChange={setCreatedViewed} />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

