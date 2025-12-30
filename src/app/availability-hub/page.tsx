"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Sun, Thermometer, CircleSlash, Star, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

export default function AvailabilityHubPage() {
  const router = useRouter()
  
  // Tab State
  const [activeTab, setActiveTab] = useState<"availability" | "timeOff">("availability")
  
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
      startDate: "Dec 23",
      endDate: "Dec 27",
      duration: "5 Days",
      type: "PTO",
      typeColor: "bg-orange-50 text-orange-700 border-orange-200",
      status: "Pending",
      statusColor: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
    {
      id: 2,
      startDate: "Jan 15",
      endDate: "Jan 16",
      duration: "2 Days",
      type: "Sick",
      typeColor: "bg-red-50 text-red-700 border-red-200",
      status: "Approved",
      statusColor: "bg-green-50 text-green-700 border-green-200",
    },
  ]

  const pastRequests = [
    {
      id: 3,
      startDate: "Nov 20",
      endDate: "Nov 22",
      duration: "3 Days",
      type: "PTO",
      typeColor: "bg-orange-50 text-orange-700 border-orange-200",
      status: "Approved",
      statusColor: "bg-green-50 text-green-700 border-green-200",
    },
    {
      id: 4,
      startDate: "Oct 5",
      endDate: "Oct 5",
      duration: "1 Day",
      type: "Unpaid",
      typeColor: "bg-gray-50 text-gray-700 border-gray-200",
      status: "Denied",
      statusColor: "bg-red-50 text-red-700 border-red-200",
    },
  ]

  const timeOffTypes = [
    { id: "pto", label: "PTO", icon: Sun, color: "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100" },
    { id: "sick", label: "Sick", icon: Thermometer, color: "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" },
    { id: "unpaid", label: "Unpaid", icon: CircleSlash, color: "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100" },
    { id: "special", label: "Special", icon: Star, color: "bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100" },
  ]

  const handleSubmitRequest = () => {
    if (!selectedType || !startDate || !endDate) {
      alert("Please fill in all required fields")
      return
    }
    // Submit logic here
    console.log({ selectedType, startDate, endDate, reason })
    // Reset and close
    setIsRequestSheetOpen(false)
    setSelectedType(null)
    setStartDate("")
    setEndDate("")
    setReason("")
  }

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

      {/* Segmented Control (Tabs) */}
      <div className="sticky top-14 bg-white border-b px-4 py-3 z-10">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("availability")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === "availability"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Availability
          </button>
          <button
            onClick={() => setActiveTab("timeOff")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === "timeOff"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Time Off
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto pb-20">
        {activeTab === "availability" && (
          <div className="p-8 text-center text-gray-500">
            <p className="text-sm">Existing Availability Calendar Component</p>
            <p className="text-xs text-gray-400 mt-2">(Will be integrated here)</p>
          </div>
        )}

        {activeTab === "timeOff" && (
          <div className="py-4">
            {/* Upcoming Section */}
            <div className="mb-6">
              <h2 className="px-4 mb-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
                Upcoming
              </h2>
              <div className="bg-white border-y border-gray-100 divide-y divide-gray-100">
                {upcomingRequests.map((request) => (
                  <div key={request.id} className="flex items-center gap-3 px-4 py-4">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {request.startDate} - {request.endDate}
                      </div>
                      <div className="text-sm text-gray-500">{request.duration}</div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${request.typeColor}`}
                    >
                      {request.type}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${request.statusColor}`}
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
              <div className="bg-white border-y border-gray-100 divide-y divide-gray-100">
                {pastRequests.map((request) => (
                  <div key={request.id} className="flex items-center gap-3 px-4 py-4 opacity-60">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {request.startDate} - {request.endDate}
                      </div>
                      <div className="text-sm text-gray-500">{request.duration}</div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${request.typeColor}`}
                    >
                      {request.type}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${request.statusColor}`}
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

      {/* Fixed Bottom Button (Time Off Tab Only) */}
      {activeTab === "timeOff" && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 z-10">
          <button
            onClick={() => setIsRequestSheetOpen(true)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Request Time Off
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
              {/* Step 1: Type Selector */}
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

