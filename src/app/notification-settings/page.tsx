"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Clock, Calendar, CheckSquare, PartyPopper, Palmtree, ChevronRight } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

export default function NotificationSettingsPage() {
  const router = useRouter()
  
  // -- STATE --
  const [allowNotifications, setAllowNotifications] = useState(true)
  const [scheduleMode, setScheduleMode] = useState<"always" | "clocked-in" | "custom">("always")
  const [customDays, setCustomDays] = useState<Set<number>>(new Set([1, 2, 3, 4, 5]))
  const [muteDuration, setMuteDuration] = useState<number | null>(null)
  
  const [categoryToggles, setCategoryToggles] = useState({
    timeClock: true,
    schedule: true,
    quickTasks: true,
    celebrations: true,
    timeOff: true,
  })

  // -- CONSTANTS --
  const days = ["S", "M", "T", "W", "T", "F", "S"]
  const muteOptions = [
    { label: "1 hour", hours: 1 },
    { label: "8 hours", hours: 8 },
    { label: "2 days", hours: 48 },
  ]

  const categories = [
    { id: "timeClock", label: "Time Clock", icon: Clock, iconColor: "text-blue-500", iconBg: "bg-blue-50" },
    { id: "schedule", label: "Schedule", icon: Calendar, iconColor: "text-orange-500", iconBg: "bg-orange-50" },
    { id: "quickTasks", label: "Quick Tasks", icon: CheckSquare, iconColor: "text-green-500", iconBg: "bg-green-50" },
    { id: "celebrations", label: "Celebrations", icon: PartyPopper, iconColor: "text-purple-500", iconBg: "bg-purple-50" },
    { id: "timeOff", label: "Time Off", icon: Palmtree, iconColor: "text-teal-500", iconBg: "bg-teal-50" },
  ]

  // -- HANDLERS --
  const toggleDay = (index: number) => {
    const newDays = new Set(customDays)
    if (newDays.has(index)) newDays.delete(index)
    else newDays.add(index)
    setCustomDays(newDays)
  }

  const toggleCategory = (categoryId: string) => {
    setCategoryToggles((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId as keyof typeof prev],
    }))
  }

  const getStatusMessage = () => {
    if (!allowNotifications) return "🔕 All notifications disabled"
    if (muteDuration) {
      const endTime = new Date(Date.now() + muteDuration * 60 * 60 * 1000)
      return `🔕 Muted until ${endTime.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
    }
    if (scheduleMode === "always") return "🔔 Notifications active (All the time)"
    if (scheduleMode === "clocked-in") return "🔔 Notifications active (Only when clocked in)"
    if (scheduleMode === "custom") {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      const activeDays = Array.from(customDays).sort().map((i) => dayNames[i])
      return `🔔 Notifications active (${activeDays.join(", ")})`
    }
    return "🔔 Notifications active"
  }

  // -- RENDER --
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b px-4 py-2 flex items-center gap-2 z-10 h-14">
        <Button 
           variant="ghost" 
           size="icon" 
           className="h-10 w-10 -ml-2 rounded-full hover:bg-gray-100 text-gray-700"
           onClick={() => router.back()}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold flex-1">Notification Settings</h1>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto pb-8">
        
        {/* 1. Global Toggle */}
        <div className="bg-white px-4 py-4 mb-4 mt-4 border-y border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-gray-900">Allow Notifications</span>
            <Switch checked={allowNotifications} onCheckedChange={setAllowNotifications} />
          </div>
        </div>

        {/* 2. Notification Schedule */}
        <div className={`bg-white px-4 py-4 mb-4 border-y border-gray-100 ${!allowNotifications ? "opacity-50 pointer-events-none" : ""}`}>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Notification Schedule</h2>

          <div className="space-y-4">
            {/* Options */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" name="schedule" checked={scheduleMode === "always"} onChange={() => setScheduleMode("always")} className="h-5 w-5 text-blue-500 accent-blue-500" disabled={!allowNotifications} />
              <span className="text-base text-gray-900">Always</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" name="schedule" checked={scheduleMode === "clocked-in"} onChange={() => setScheduleMode("clocked-in")} className="h-5 w-5 text-blue-500 accent-blue-500" disabled={!allowNotifications} />
              <span className="text-base text-gray-900">Only when I'm clocked in</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" name="schedule" checked={scheduleMode === "custom"} onChange={() => setScheduleMode("custom")} className="h-5 w-5 text-blue-500 accent-blue-500" disabled={!allowNotifications} />
              <span className="text-base text-gray-900">Custom schedule</span>
            </label>
          </div>

          {/* Day Selector (Conditional) */}
          {scheduleMode === "custom" && (
            <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between gap-1">
                {days.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => toggleDay(index)}
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      customDays.has(index)
                        ? "bg-blue-500 text-white shadow-sm"
                        : "bg-gray-100 text-gray-400"
                    }`}
                    disabled={!allowNotifications}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 text-center mt-3">Notifications are muted on unselected days.</p>
            </div>
          )}
        </div>

        {/* 3. Temporary Mute */}
        <div className={`bg-white px-4 py-4 mb-4 border-y border-gray-100 ${!allowNotifications ? "opacity-50 pointer-events-none" : ""}`}>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Temporary Mute</h2>
          <div className="flex gap-2">
            {muteOptions.map((option) => (
              <button
                key={option.hours}
                onClick={() => setMuteDuration(muteDuration === option.hours ? null : option.hours)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  muteDuration === option.hours
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
                disabled={!allowNotifications}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Categories */}
        <div className={`bg-white border-y border-gray-100 ${!allowNotifications ? "opacity-50 pointer-events-none" : ""}`}>
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Categories</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <div key={category.id} className="flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors">
                  <div className={`h-10 w-10 rounded-full ${category.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className={`h-5 w-5 ${category.iconColor}`} strokeWidth={2.5} />
                  </div>
                  <span className="flex-1 text-base font-medium text-gray-900">{category.label}</span>
                  <Switch
                    checked={categoryToggles[category.id as keyof typeof categoryToggles]}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  {/* Visual Chevron for affordance */}
                  <ChevronRight className="h-5 w-5 text-gray-300 ml-1" strokeWidth={2} />
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* Footer Status */}
      <div className="sticky bottom-0 bg-white border-t px-4 py-3 z-10">
        <p className="text-xs font-medium text-center text-gray-500 flex items-center justify-center gap-2">
           {getStatusMessage()}
        </p>
      </div>
    </div>
  )
}
