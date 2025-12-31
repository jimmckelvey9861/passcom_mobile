"use client"

import { Suspense, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import BottomNav from "@/components/BottomNav"

function HomeContent() {
  const router = useRouter()
  const [showEarnings, setShowEarnings] = useState(true)
  const earnings = 127.5

  const alerts = [
    {
      id: 1,
      dotColor: "bg-red-500",
      title: "Shift change request",
      subtext: "Please review shift swap from John Doe",
      time: "10m",
    },
    {
      id: 2,
      dotColor: "bg-yellow-400",
      title: "PTO request",
      subtext: "Please review PTO request from Amy Brock",
      time: "8:11pm",
    },
  ]

  const announcements = [
    {
      id: 1,
      dotColor: "bg-blue-500",
      title: "New policy update",
      subtext: "Please review the updated time-off request policy",
      time: "1d",
    },
    {
      id: 2,
      dotColor: "bg-blue-500",
      title: "Holiday hours reminder",
      subtext: "All branches will be closed on the following dates..",
      time: "12/8/2025",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-green-600">
            {showEarnings ? `$${earnings.toFixed(2)}` : "•••••"}
          </span>
          <button
            onClick={() => setShowEarnings(!showEarnings)}
            className="h-6 w-6 flex items-center justify-center text-gray-400 hover:text-gray-600"
          >
            {showEarnings ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        </div>

        <button
          onClick={() => router.push("/profile")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="text-base font-bold text-gray-900">John Smith</span>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">JS</span>
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {/* Section 1: Alerts */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Alerts</h2>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <button
                key={alert.id}
                className="w-full bg-white rounded-lg p-4 flex gap-3 hover:bg-gray-50 transition-colors text-left"
              >
                <div className={`h-2 w-2 rounded-full ${alert.dotColor} mt-2 shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-base font-semibold text-gray-900">{alert.title}</h3>
                    <span className="text-xs text-gray-400 shrink-0 ml-2">{alert.time}</span>
                  </div>
                  <p className="text-sm text-gray-600">{alert.subtext}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Announcements */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Announcements</h2>
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <button
                key={announcement.id}
                className="w-full bg-white rounded-lg p-4 flex gap-3 hover:bg-gray-50 transition-colors text-left"
              >
                <div className={`h-2 w-2 rounded-full ${announcement.dotColor} mt-2 shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-base font-semibold text-gray-900">
                      {announcement.title}
                    </h3>
                    <span className="text-xs text-gray-400 shrink-0 ml-2">
                      {announcement.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{announcement.subtext}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  )
}
