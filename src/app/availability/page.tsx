"use client"

import { Suspense, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Repeat, Calendar as CalendarIcon, List, Sun, Thermometer, CircleSlash, Star, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

function AvailabilityHubContent() {
  const router = useRouter()
  
  // Tab State
  const [activeTab, setActiveTab] = useState<"pattern" | "calendar" | "requests">("pattern")
  
  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  // Sheet State
  const [isRequestSheetOpen, setIsRequestSheetOpen] = useState(false)
  
  // Form State
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reason, setReason] = useState("")

  // Mock Time Off Data
  const upcomingRequests = [
    {
      id: 1,
      month: "DEC",
      day: "23",
      title: "Vacation",
      duration: "5 days",
      status: "Pending",
      statusColor: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
    {
      id: 2,
      month: "JAN",
      day: "15",
      title: "Sick Leave",
      duration: "2 days",
      status: "Approved",
      statusColor: "bg-green-50 text-green-700 border-green-200",
    },
  ]

  const pastRequests = [
    {
      id: 3,
      month: "NOV",
      day: "20",
      title: "Personal Day",
      duration: "1 day",
      status: "Approved",
      statusColor: "bg-green-50 text-green-700 border-green-200",
    },
    {
      id: 4,
      month: "OCT",
      day: "12",
      title: "Vacation",
      duration: "3 days",
      status: "Approved",
      statusColor: "bg-green-50 text-green-700 border-green-200",
    },
  ]

  const timeOffTypes = [
    { id: "pto", label: "PTO", icon: Sun, color: "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100" },
    { id: "sick", label: "Sick", icon: Thermometer, color: "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" },
    { id: "unpaid", label: "Unpaid", icon: CircleSlash, color: "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100" },
    { id: "special", label: "Special", icon: Star, color: "bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100" },
  ]

  // Calendar helpers
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    
    // Get the day of week (0 = Sunday, 1 = Monday, etc.)
    let firstDayOfWeek = firstDay.getDay()
    // Convert to Monday = 0
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1
    
    const days = []
    
    // Add empty slots for days before month starts
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      // Mock indicators (Green = Available, Red = Blocked, Blue = Partial)
      const indicator = day % 7 === 0 ? 'red' : day % 5 === 0 ? 'blue' : day % 2 === 0 ? 'green' : null
      days.push({ day, indicator })
    }
    
    return days
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const handleDayClick = (day: number) => {
    console.log("Day clicked:", day)
    // TODO: Open override sheet
  }

  const handleSubmitRequest = () => {
    if (!selectedType || !startDate || !endDate) {
      alert("Please fill in all required fields")
      return
    }
    console.log({ selectedType, startDate, endDate, reason })
    // Reset and close
    setIsRequestSheetOpen(false)
    setSelectedType(null)
    setStartDate("")
    setEndDate("")
    setReason("")
  }

  const days = getDaysInMonth(currentMonth)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b px-4 py-2 flex items-center gap-2 z-20 h-14">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 -ml-2 rounded-full hover:bg-gray-100 text-gray-700"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold flex-1">Availability</h1>
      </div>

      {/* 3-Segment Navigation */}
      <div className="sticky top-14 bg-white border-b px-4 py-3 z-10">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("pattern")}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === "pattern"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Repeat className="h-4 w-4" />
            <span>Pattern</span>
          </button>
          <button
            onClick={() => setActiveTab("calendar")}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === "calendar"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <CalendarIcon className="h-4 w-4" />
            <span>Calendar</span>
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === "requests"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <List className="h-4 w-4" />
            <span>Requests</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto pb-20">
        
        {/* Tab 1: Pattern View */}
        {activeTab === "pattern" && (
          <div className="p-4">
            <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-xl mt-8 bg-white">
              <Repeat className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 font-medium">Weekly Pattern Painter Component</p>
              <p className="text-xs text-gray-400 mt-2">(Will be integrated here)</p>
            </div>
          </div>
        )}

        {/* Tab 2: Calendar View */}
        {activeTab === "calendar" && (
          <div className="p-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Month Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <button
                  onClick={handlePrevMonth}
                  className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <h2 className="text-base font-semibold text-gray-900">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h2>
                <button
                  onClick={handleNextMonth}
                  className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b border-gray-100">
                {dayNames.map((day) => (
                  <div key={day} className="text-center py-2 text-xs font-semibold text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7">
                {days.map((dayData, index) => (
                  <div
                    key={index}
                    className={`aspect-square border-r border-b border-gray-100 p-2 ${
                      dayData ? "hover:bg-gray-50 cursor-pointer" : ""
                    }`}
                    onClick={() => dayData && handleDayClick(dayData.day)}
                  >
                    {dayData && (
                      <div className="flex flex-col items-center justify-center h-full">
                        <span className="text-sm font-medium text-gray-900">{dayData.day}</span>
                        {dayData.indicator && (
                          <div className="flex gap-1 mt-1">
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                dayData.indicator === 'green'
                                  ? 'bg-green-500'
                                  : dayData.indicator === 'red'
                                  ? 'bg-red-500'
                                  : 'bg-blue-500'
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-gray-600">Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-gray-600">Partial</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-gray-600">Blocked</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Requests View */}
        {activeTab === "requests" && (
          <div className="py-4">
            {/* Upcoming Section */}
            <div className="mb-6">
              <h2 className="px-4 mb-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
                Upcoming
              </h2>
              <div className="bg-white border-y border-gray-100 divide-y divide-gray-100 shadow-sm">
                {upcomingRequests.map((request) => (
                  <div key={request.id} className="flex items-center gap-4 px-4 py-4">
                    {/* Date Stack */}
                    <div className="flex flex-col items-center justify-center w-14 h-14 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-xs font-bold text-gray-500">{request.month}</div>
                      <div className="text-xl font-bold text-gray-900">{request.day}</div>
                    </div>
                    
                    {/* Middle: Title & Duration */}
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{request.title}</div>
                      <div className="text-sm text-gray-500">{request.duration}</div>
                    </div>
                    
                    {/* Status Pill */}
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${request.statusColor}`}
                    >
                      {request.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Past Section */}
            <div className="mb-6">
              <h2 className="px-4 mb-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
                Past
              </h2>
              <div className="bg-white border-y border-gray-100 divide-y divide-gray-100 shadow-sm">
                {pastRequests.map((request) => (
                  <div key={request.id} className="flex items-center gap-4 px-4 py-4 opacity-60">
                    {/* Date Stack */}
                    <div className="flex flex-col items-center justify-center w-14 h-14 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-xs font-bold text-gray-500">{request.month}</div>
                      <div className="text-xl font-bold text-gray-900">{request.day}</div>
                    </div>
                    
                    {/* Middle: Title & Duration */}
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{request.title}</div>
                      <div className="text-sm text-gray-500">{request.duration}</div>
                    </div>
                    
                    {/* Status Pill */}
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${request.statusColor}`}
                    >
                      {request.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Button (Requests Tab Only) */}
      {activeTab === "requests" && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 z-10">
          <button
            onClick={() => setIsRequestSheetOpen(true)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            New Request
          </button>
        </div>
      )}

      {/* Bottom Sheet (Request Form) */}
      {isRequestSheetOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setIsRequestSheetOpen(false)}
          />

          {/* Sheet */}
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-40 max-h-[85vh] overflow-auto">
            {/* Sheet Header */}
            <div className="sticky top-0 bg-white border-b px-4 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-semibold">New Time Off Request</h2>
              <button
                onClick={() => setIsRequestSheetOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500"
              >
                ✕
              </button>
            </div>

            {/* Sheet Content */}
            <div className="p-4 space-y-6">
              {/* Step 1: Type Selector (2x2 Grid) */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Request Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {timeOffTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          selectedType === type.id
                            ? type.color.replace("hover:", "")
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Icon className="h-8 w-8 mx-auto mb-2" />
                        <div className="text-base font-semibold">{type.label}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Step 2: Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Starts
                  </label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Ends
                  </label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Step 3: Reason */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Reason / Note
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  placeholder="Optional: Add details about your request..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitRequest}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Submit Request
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function AvailabilityHubPage() {
  return (
    <Suspense fallback={null}>
      <AvailabilityHubContent />
    </Suspense>
  )
}
