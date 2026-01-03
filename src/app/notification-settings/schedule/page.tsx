"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useGlobalApp } from "@/context/GlobalContext"

export default function ScheduleSettingsPage() {
  const router = useRouter()
  const { setBottomSheetOpen } = useGlobalApp()
  
  // State
  const [calendarSync, setCalendarSync] = useState(false)
  const [notifyBeforeShift, setNotifyBeforeShift] = useState(true)
  const [beforeShiftTime, setBeforeShiftTime] = useState(60) // minutes (default 1 hour)
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false)
  const [notifyShiftStart, setNotifyShiftStart] = useState(false)
  const [notifyPublish, setNotifyPublish] = useState(true)
  const [notifyChange, setNotifyChange] = useState(true)
  const [notifySwap, setNotifySwap] = useState(true)
  
  const [emailAssign, setEmailAssign] = useState(true)
  const [emailEdit, setEmailEdit] = useState(false)

  // Generate time values with custom increments (same as Clock In Reminder)
  const generateTimeValues = () => {
    const values: number[] = []
    
    // 1-10: 1-minute increments
    for (let i = 1; i <= 10; i++) {
      values.push(i)
    }
    
    // 15: 5-minute increment from 10
    values.push(15)
    
    // 30, 45, 60: 15-minute increments
    values.push(30, 45, 60)
    
    // 80, 100, 120: 20-minute increments from 60
    values.push(80, 100, 120)
    
    return values
  }

  const timeValues = generateTimeValues()

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    } else if (minutes === 60) {
      return '1 hour'
    } else {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return mins > 0 ? `${hours}h ${mins}m` : `${hours} hours`
    }
  }

  const handleSaveTime = (minutes: number) => {
    setBeforeShiftTime(minutes)
    setIsTimePickerOpen(false)
    setBottomSheetOpen(false)
    // TODO: Save to localStorage or backend
  }

  const handleRowClick = () => {
    if (!notifyBeforeShift) {
      setNotifyBeforeShift(true)
    }
    setIsTimePickerOpen(true)
    setBottomSheetOpen(true)
  }

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
            
            <button
              onClick={handleRowClick}
              className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors"
            >
              <span className="text-base text-gray-900">Before shift starts</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-blue-600 font-medium">
                  {formatTime(beforeShiftTime)} before
                </span>
                <div onClick={(e) => e.stopPropagation()}>
                  <Switch 
                    checked={notifyBeforeShift} 
                    onCheckedChange={(checked) => {
                      setNotifyBeforeShift(checked)
                      if (checked) {
                        setIsTimePickerOpen(true)
                        setBottomSheetOpen(true)
                      }
                    }} 
                  />
                </div>
              </div>
            </button>

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

      {/* Time Picker Bottom Sheet */}
      {isTimePickerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
            onClick={() => {
              setIsTimePickerOpen(false)
              setBottomSheetOpen(false)
            }}
          />

          {/* Sheet */}
          <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl z-50 animate-in slide-in-from-bottom duration-300">
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Content */}
            <div className="px-6 pb-8">
              {/* Slider */}
              <div className="py-8">
                <input
                  type="range"
                  min="0"
                  max={timeValues.length - 1}
                  value={timeValues.indexOf(beforeShiftTime)}
                  onChange={(e) => {
                    const index = parseInt(e.target.value)
                    setBeforeShiftTime(timeValues[index])
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 
                    [&::-webkit-slider-thumb]:appearance-none 
                    [&::-webkit-slider-thumb]:w-7 
                    [&::-webkit-slider-thumb]:h-7 
                    [&::-webkit-slider-thumb]:rounded-full 
                    [&::-webkit-slider-thumb]:bg-blue-500
                    [&::-webkit-slider-thumb]:shadow-lg
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:w-7
                    [&::-moz-range-thumb]:h-7
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-blue-500
                    [&::-moz-range-thumb]:border-0
                    [&::-moz-range-thumb]:shadow-lg
                    [&::-moz-range-thumb]:cursor-pointer"
                />
                
                {/* Time Display */}
                <div className="text-center mt-6">
                  <div className="text-4xl font-bold text-gray-900">
                    {formatTime(beforeShiftTime)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">before shift</div>
                </div>
              </div>

              {/* Done Button */}
              <button
                onClick={() => handleSaveTime(beforeShiftTime)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

