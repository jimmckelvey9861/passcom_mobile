"use client"

import { Suspense } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Settings, PartyPopper, Calendar, Clock, CheckSquare, MoreVertical } from "lucide-react"
import Link from "next/link"

function NotificationsContent() {
  const router = useRouter()
  
  const notifications = [
    {
      id: 1,
      type: "celebration",
      icon: PartyPopper,
      iconBg: "bg-purple-500",
      title: "Liz Carter has a birthday today!",
      time: "1 hr ago",
      section: "Today",
    },
    {
      id: 2,
      type: "schedule",
      icon: Calendar,
      iconBg: "bg-orange-500",
      title: "New shift published: Fri 19/12",
      time: "2 hrs ago",
      section: "Today",
    },
    {
      id: 3,
      type: "system",
      icon: Clock,
      iconBg: "bg-gray-500",
      title: "You have been auto-clocked out",
      time: "Yesterday",
      section: "Earlier",
    },
    {
      id: 4,
      type: "task",
      icon: CheckSquare,
      iconBg: "bg-green-500",
      title: "The task 'Clean Deep Fryer' is past due",
      time: "2 days ago",
      section: "Earlier",
    },
  ]

  const todayNotifications = notifications.filter((n) => n.section === "Today")
  const earlierNotifications = notifications.filter((n) => n.section === "Earlier")

  // Shared button class for header
  const headerBtnClass = "h-10 w-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-700 transition-colors"

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b px-4 py-2 flex items-center justify-between z-10 h-14">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => router.back()} 
            className={`${headerBtnClass} -ml-2`}
          >
            <ArrowLeft className="h-6 w-6" strokeWidth={2} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
        </div>
        
        <Link href="/notification-settings">
          <button className={headerBtnClass}>
            <Settings className="h-6 w-6" strokeWidth={2} />
          </button>
        </Link>
      </div>

      {/* Content */}
      <div className="divide-y divide-gray-100">
        {/* Today Section */}
        {todayNotifications.length > 0 && (
          <div>
            <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Today</h2>
            </div>
            {todayNotifications.map((notification) => {
              const Icon = notification.icon
              return (
                <div key={notification.id} className="flex items-start gap-3 px-4 py-4 bg-white hover:bg-gray-50 transition-colors">
                  <div
                    className={`h-10 w-10 rounded-full ${notification.iconBg} flex items-center justify-center shrink-0 shadow-sm`}
                  >
                    <Icon className="h-5 w-5 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-base font-medium text-gray-900 leading-snug">{notification.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{notification.time}</p>
                  </div>
                  <button className="h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 -mr-2">
                    <MoreVertical className="h-5 w-5" strokeWidth={2} />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Earlier Section */}
        {earlierNotifications.length > 0 && (
          <div>
            <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100 border-t">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Earlier</h2>
            </div>
            {earlierNotifications.map((notification) => {
              const Icon = notification.icon
              return (
                <div key={notification.id} className="flex items-start gap-3 px-4 py-4 bg-white hover:bg-gray-50 transition-colors">
                  <div
                    className={`h-10 w-10 rounded-full ${notification.iconBg} flex items-center justify-center shrink-0 shadow-sm`}
                  >
                    <Icon className="h-5 w-5 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-base font-medium text-gray-900 leading-snug">{notification.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{notification.time}</p>
                  </div>
                  <button className="h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 -mr-2">
                    <MoreVertical className="h-5 w-5" strokeWidth={2} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={null}>
      <NotificationsContent />
    </Suspense>
  )
}
