"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

export default function TimeOffSettingsPage() {
  const router = useRouter()
  
  const [requestStatus, setRequestStatus] = useState(true)
  const [upcomingTimeOff, setUpcomingTimeOff] = useState(true)
  const [accrualUpdates, setAccrualUpdates] = useState(false)
  const [teamTimeOff, setTeamTimeOff] = useState(true)

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
        <h1 className="text-lg font-semibold flex-1">Time Off Settings</h1>
      </div>

      <div className="flex-1 overflow-auto py-6">
        
        {/* Section 1: My Requests */}
        <div className="mb-6">
          <h2 className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wide">My Requests</h2>
          <div className="bg-white border-y border-gray-100 divide-y divide-gray-100">
            
            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-base text-gray-900">Request approved or denied</span>
              <Switch checked={requestStatus} onCheckedChange={setRequestStatus} />
            </div>

            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-base text-gray-900">Upcoming time off reminder</span>
              <Switch checked={upcomingTimeOff} onCheckedChange={setUpcomingTimeOff} />
            </div>

            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-base text-gray-900">Balance accrual updates</span>
              <Switch checked={accrualUpdates} onCheckedChange={setAccrualUpdates} />
            </div>
          </div>
        </div>

        {/* Section 2: Team Visibility */}
        <div className="mb-6">
          <h2 className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Team Visibility</h2>
          <div className="bg-white border-y border-gray-100 divide-y divide-gray-100">
            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-base text-gray-900">Notify when teammates are off</span>
              <Switch checked={teamTimeOff} onCheckedChange={setTeamTimeOff} />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

