"use client"

import { usePathname, useRouter } from "next/navigation"
import { Home, CheckSquare, Clock, Calendar, MessageCircle, Settings } from "lucide-react"

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { id: "home", label: "Home", icon: Home, path: "/" },
    { id: "tasks", label: "Tasks", icon: CheckSquare, path: "/tasks" },
    { id: "clock", label: "Clock", icon: Clock, path: "/time-clock" },
    { id: "schedule", label: "Schedule", icon: Calendar, path: "/schedule" },
    { id: "chat", label: "Chat", icon: MessageCircle, path: "/chat" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
  ]

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)

          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className="flex flex-col items-center justify-center min-w-0 flex-1 py-1 px-2 transition-colors"
            >
              <Icon
                className={`h-6 w-6 mb-1 ${
                  active ? "text-blue-500" : "text-gray-500"
                }`}
                strokeWidth={2}
              />
              <span
                className={`text-xs font-medium truncate ${
                  active ? "text-blue-500" : "text-gray-500"
                }`}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

