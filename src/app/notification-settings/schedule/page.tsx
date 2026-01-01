"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

export default function ScheduleSettingsPage() {
  const router = useRouter()
  
  // State
  const [calendarSync, setCalendarSync] = useState(false)
  const [notifyBeforeShift, setNotifyBeforeShift] = useState(true)
  const [notifyShiftStart, setNotifyShiftStart] = useState(false)
  const [notifyPublish, setNotifyPublish] = useState(true)
  const [notifyChange, setNotifyChange] = useState(true)
  const [notifySwap, setNotifySwap] = useState(true)
  
  const [emailAssign, setEmailAssign] = useState(true)
  const [emailEdit, setEmailEdit] = useState(false)

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
        <h1 className="text-lg font-semibold flex-1">Schedule Settings</h1>
        <button
          onClick={() => router.push('/notification-settings')}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          set notifications
        </button>
      </div>

      <div className="flex-1 overflow-auto py-6">
        
        {/* Section 1: Integrations */}
        <div className="bg-white border-y border-gray-100 mb-6">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Calendar className="h-5 w-5" />
              </div>
              <span className="text-base font-medium text-gray-900">Sync to Phone Calendar</span>
            </div>
            <Switch checked={calendarSync} onCheckedChange={setCalendarSync} />
          </div>
        </div>

        {/* Section 2: Push Notifications */}
        <div className="mb-6">
          <h2 className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Push Notifications</h2>
          <div className="bg-white border-y border-gray-100 divide-y divide-gray-100">
            
            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-base text-gray-900">Before shift starts</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-blue-600 font-medium">1 Hour before</span>
                <Switch checked={notifyBeforeShift} onCheckedChange={setNotifyBeforeShift} />
              </div>
            </div>

            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-base text-gray-900">When shift starts</span>
              <Switch checked={notifyShiftStart} onCheckedChange={setNotifyShiftStart} />
            </div>

            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-base text-gray-900">New schedule published</span>
              <Switch checked={notifyPublish} onCheckedChange={setNotifyPublish} />
            </div>

            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-base text-gray-900">Shift status changed</span>
              <Switch checked={notifyChange} onCheckedChange={setNotifyChange} />
            </div>

            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-base text-gray-900">Shift swap requests</span>
              <Switch checked={notifySwap} onCheckedChange={setNotifySwap} />
            </div>

          </div>
        </div>

        {/* Section 3: Email */}
        <div className="mb-6">
          <h2 className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Email Me When</h2>
          <div className="bg-white border-y border-gray-100 divide-y divide-gray-100">
            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-base text-gray-900">A shift is assigned to me</span>
              <Switch checked={emailAssign} onCheckedChange={setEmailAssign} />
            </div>

            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-base text-gray-900">A shift is edited</span>
              <Switch checked={emailEdit} onCheckedChange={setEmailEdit} />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

