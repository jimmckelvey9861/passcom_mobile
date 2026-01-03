"use client"

import Link from "next/link"
import {
  ChevronRight,
  FileText,
  User,
  Bell,
  DollarSign,
  Settings,
  FileIcon,
} from "lucide-react"

export default function ProfilePage() {
  const menuItems = [
    { id: "requests", label: "Requests", icon: FileText, href: "/profile/requests" },
    { id: "myInfo", label: "My Info", icon: User, href: "/profile/my-info" },
    { id: "notifications", label: "Notifications", icon: Bell, href: "/profile/notifications" },
    { id: "pay", label: "Pay", icon: DollarSign, href: "/profile/pay" },
    { id: "settings", label: "Settings", icon: Settings, href: "/profile/settings" },
    { id: "documents", label: "Documents", icon: FileIcon, href: "/profile/documents" },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      {/* Header with User Info */}
      <div className="bg-white px-6 py-8 text-center border-b">
        <div className="flex justify-center mb-4">
          <div className="h-24 w-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-semibold">
            JM
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Jim McKelvey</h1>
        <p className="text-gray-500 mt-1">Shift Lead</p>
      </div>

      {/* Menu List */}
      <div className="flex-1 bg-white mt-4 border-y border-gray-200">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-6 w-6 text-gray-600" />
              <span className="text-base text-gray-900">{item.label}</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="py-8 text-center space-y-4">
        <p className="text-sm text-gray-400">Version 1.0.0</p>
        <Link 
            href="/admin" 
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
            Switch to Manager View
        </Link>
      </div>
    </div>
  )
}
