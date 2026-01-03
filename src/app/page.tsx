"use client"

import { Suspense, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { useGlobalApp } from "@/context/GlobalContext"

function HomeContent() {
  const router = useRouter()
  const { userProfile, profilePhoto } = useGlobalApp()
  const [showEarnings, setShowEarnings] = useState(true)
  const earnings = 127.5
  
  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

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
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/pay")}
            className="text-xl font-bold text-green-600 hover:text-green-700 transition-colors"
          >
            {showEarnings ? `$${earnings.toFixed(2)}` : "•••••"}
          </button>
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
          <span className="text-base font-bold text-gray-900">{userProfile.name}</span>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
            {profilePhoto ? (
              <img src={profilePhoto} alt={userProfile.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-xs font-bold">{getInitials(userProfile.name)}</span>
            )}
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {/* Section 1: Alerts */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Alerts</h2>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <button
                key={alert.id}
                className="w-full flex gap-3 hover:opacity-70 transition-opacity text-left py-1"
              >
                <div className={`h-3 w-3 rounded-full ${alert.dotColor} mt-1 shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-base font-semibold text-gray-900">{alert.title}</h3>
                    <span className="text-sm text-gray-400 shrink-0">{alert.time}</span>
                  </div>
                  <p className="text-sm text-gray-600">{alert.subtext}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Announcements */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Announcements</h2>
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <button
                key={announcement.id}
                className="w-full flex gap-3 hover:opacity-70 transition-opacity text-left py-1"
              >
                <div className={`h-3 w-3 rounded-full ${announcement.dotColor} mt-1 shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-base font-semibold text-gray-900">
                      {announcement.title}
                    </h3>
                    <span className="text-sm text-gray-400 shrink-0">
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
