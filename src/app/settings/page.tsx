"use client"

import { Suspense } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronRight, Palette, Accessibility, Lock, Bell, User } from "lucide-react"

function SettingsContent() {
  const router = useRouter()
  
  const settingsItems = [
    {
      id: "appearance",
      icon: Palette,
      label: "Appearance",
      description: "Theme and display settings",
    },
    {
      id: "accessibility",
      icon: Accessibility,
      label: "Accessibility",
      description: "Accessibility features",
    },
    {
      id: "privacy",
      icon: Lock,
      label: "Privacy",
      description: "Privacy and security settings",
    },
    {
      id: "notifications",
      icon: Bell,
      label: "Notifications",
      description: "Manage notification preferences",
    },
    {
      id: "account",
      icon: User,
      label: "Account",
      description: "Account and profile settings",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b px-4 py-2 flex items-center gap-2 z-10 h-14">
        <button
          onClick={() => router.push("/")}
          className="h-12 w-12 -ml-2 rounded-full flex items-center justify-center hover:bg-blue-50 text-blue-600 transition-colors focus:outline-none"
        >
          <ArrowLeft className="h-[30px] w-[30px]" strokeWidth={2.5} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 flex-1">Settings</h1>
      </div>

      {/* Content */}
      <div className="py-6">
        <div className="bg-white border-y border-gray-100 divide-y divide-gray-100">
          {settingsItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'notifications') {
                    router.push('/notification-settings')
                  } else {
                    console.log(`Navigate to ${item.id}`)
                  }
                }}
                className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-gray-600" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" strokeWidth={2} />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsContent />
    </Suspense>
  )
}

