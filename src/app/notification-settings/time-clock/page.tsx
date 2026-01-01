"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

export default function TimeClockSettingsPage() {
  const router = useRouter()
  
  // Reminder State
  const [clockInReminder, setClockInReminder] = useState(true)
  const [clockOutReminder, setClockOutReminder] = useState(true)
  const [breakReminder, setBreakReminder] = useState(true)
  
  // Alert State
  const [overtimeAlert, setOvertimeAlert] = useState(true)
  const [autoClockOut, setAutoClockOut] = useState(true)
  const [editedTime, setEditedTime] = useState(true)

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
        <h1 className="text-lg font-semibold flex-1">Time Clock Settings</h1>
      </div>

      <div className="flex-1 overflow-auto py-6">
        
        {/* Section 1: Reminders */}
        <div className="mb-6">
          <h2 className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Reminders</h2>
          <div className="bg-white border-y border-gray-100 divide-y divide-gray-100">
            
            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-base text-gray-900">Clock in reminder</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-blue-600 font-medium">15 min before</span>
                <Switch checked={clockInReminder} onCheckedChange={setClockInReminder} />
              </div>
            </div>

            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-base text-gray-900">Clock out reminder</span>
              <div className="flex items-center gap-3">
                 {/* This implies geofence or end of scheduled shift */}
                <Switch checked={clockOutReminder} onCheckedChange={setClockOutReminder} />
              </div>
            </div>

            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-base text-gray-900">Break start/end reminders</span>
              <Switch checked={breakReminder} onCheckedChange={setBreakReminder} />
            </div>
          </div>
        </div>

        {/* Section 2: Alerts & Compliance */}
        <div className="mb-6">
          <h2 className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Alerts & Compliance</h2>
          <div className="bg-white border-y border-gray-100 divide-y divide-gray-100">
            
            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-base text-gray-900">Approaching overtime</span>
              <Switch checked={overtimeAlert} onCheckedChange={setOvertimeAlert} />
            </div>

            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-base text-gray-900">System auto-clocked me out</span>
              <Switch checked={autoClockOut} onCheckedChange={setAutoClockOut} />
            </div>

            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-base text-gray-900">Manager edited my time card</span>
              <Switch checked={editedTime} onCheckedChange={setEditedTime} />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

