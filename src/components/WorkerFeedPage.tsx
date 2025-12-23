"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckSquare, Clock, Calendar, MessageSquare, User, Search } from "lucide-react"

export default function WorkerFeedPage() {
  const router = useRouter()
  // Dynamic user data
  const [userData] = useState({
    firstName: "Pete",
    lastName: "Seager",
    initials: "PS",
    greeting: "Good afternoon",
  })

  const [currentPay] = useState(127.5)

  const [notificationCount] = useState(3)
  const [taskCount] = useState(1)
  const [currentShift] = useState({
    startTime: "9:52 AM",
    elapsedTime: "05:49:19",
  })

  const [alerts] = useState([
    {
      id: 1,
      title: "Urgent: Shift change request",
      message: "Please review shift swap request from John Doe",
      time: "10 mins ago",
    },
  ])

  const [announcements] = useState([
    {
      id: 1,
      title: "Team meeting scheduled",
      message: "Monthly team meeting is scheduled for Friday at 2 PM",
      time: "2 hours ago",
    },
    {
      id: 2,
      title: "New policy update",
      message: "Please review the updated time-off request policy",
      time: "1 day ago",
    },
  ])

  const [upcomingShifts] = useState([
    {
      date: "Today",
      startTime: "9:00 AM",
      endTime: "5:00 PM",
      role: "Shift manager",
      worker: "Pete Seager",
    },
  ])

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col">
      <div className="bg-white py-3 flex items-center justify-between">
        <div className="flex items-start gap-0 pl-4">
          <div className="text-3xl font-bold text-green-700 leading-none">$</div>
          <div className="text-3xl font-bold text-green-700 leading-none">{Math.floor(currentPay)}</div>
          <div className="text-base font-bold text-green-700 leading-none mt-1">{((currentPay % 1) * 100).toFixed(0).padStart(2, '0')}</div>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 absolute left-1/2 -translate-x-1/2">{userData.firstName}</h1>
        <div className="relative pr-4">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
        </div>
      </div>

      <div className="h-[0.5px] bg-gray-400" />

      <div className="py-4 bg-white">
        <div className="flex gap-2.5 px-4">
          <button 
            onClick={() => router.push('/tasks')}
            className="flex-1 flex flex-col items-center gap-2 relative min-w-0"
          >
            <div className="w-full h-[54px] rounded-2xl bg-[#D4EEF0] flex items-center justify-center">
              <CheckSquare className="w-7 h-7 text-[#5FA7AB]" />
            </div>
            {taskCount > 0 && (
              <div className="absolute top-0 right-2 w-5 h-5 bg-[#E25C4A] rounded-full flex items-center justify-center text-white text-xs font-bold">
                {taskCount}
              </div>
            )}
            <span className="text-sm font-medium text-gray-900">Tasks</span>
          </button>

          <button className="flex-1 flex flex-col items-center gap-2 min-w-0">
            <div className="w-full h-[54px] rounded-2xl bg-[#E6E3F5] flex items-center justify-center">
              <Clock className="w-7 h-7 text-[#8B7DC3]" />
            </div>
            <span className="text-sm font-medium text-gray-900">Clock</span>
          </button>

          <button className="flex-1 flex flex-col items-center gap-2 min-w-0">
            <div className="w-full h-[54px] rounded-2xl bg-[#F0F4D4] flex items-center justify-center">
              <MessageSquare className="w-7 h-7 text-[#B4BE6C]" />
            </div>
            <span className="text-sm font-medium text-gray-900">Messages</span>
          </button>

          <button className="flex-1 flex flex-col items-center gap-2 min-w-0">
            <div className="w-full h-[54px] rounded-2xl bg-[#FCE9E6] flex items-center justify-center">
              <Calendar className="w-7 h-7 text-[#E89B8C]" />
            </div>
            <span className="text-sm font-medium text-gray-900">Schedule</span>
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white overflow-y-auto">
        {/* Alerts section - only shows if there are alerts */}
        {alerts.length > 0 && (
          <div>
            <div className="py-4 px-4 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-sm font-bold text-gray-900">Alerts</h3>
              <button className="p-1">
                <Search className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="px-4 pb-4 space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#E25C4A] mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900">{alert.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {alerts.length > 0 && <div className="h-[2.5px] bg-gray-300" />}

        {/* Announcements section - always visible */}
        <div className="bg-white">
          <div className="py-4 px-4 flex items-center justify-between sticky top-0 bg-white z-10">
            <h3 className="text-sm font-bold text-gray-900">Announcements</h3>
            <button className="p-1">
              <Search className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="px-4 pb-4 space-y-3">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-[#5A9FD4] mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900">{announcement.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{announcement.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{announcement.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

