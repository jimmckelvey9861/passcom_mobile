"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

export default function CelebrationSettingsPage() {
  const router = useRouter()
  
  const [birthdays, setBirthdays] = useState(true)
  const [anniversaries, setAnniversaries] = useState(true)
  const [newHires, setNewHires] = useState(true)

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
        <h1 className="text-lg font-semibold flex-1">Celebrations</h1>
      </div>

      <div className="flex-1 overflow-auto py-6">
        
        <div className="mb-6">
          <h2 className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Team Updates</h2>
          <div className="bg-white border-y border-gray-100 divide-y divide-gray-100">
            
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex flex-col">
                <span className="text-base text-gray-900">Birthdays</span>
                <span className="text-xs text-gray-500">Notify me on my teammates' birthdays</span>
              </div>
              <Switch checked={birthdays} onCheckedChange={setBirthdays} />
            </div>

            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex flex-col">
                <span className="text-base text-gray-900">Work Anniversaries</span>
                <span className="text-xs text-gray-500">Celebrate years of service</span>
              </div>
              <Switch checked={anniversaries} onCheckedChange={setAnniversaries} />
            </div>

            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-base text-gray-900">New team members joining</span>
              <Switch checked={newHires} onCheckedChange={setNewHires} />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

