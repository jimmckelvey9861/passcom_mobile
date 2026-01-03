"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bell, Calendar, MessageCircle, Clock, Megaphone } from "lucide-react"

export default function NotificationsPage() {
  const router = useRouter()
  
  const [settings, setSettings] = useState({
    schedule: true,
    tasks: true,
    messages: true,
    timeClock: false,
    announcements: true,
  })

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b px-4 py-2 flex items-center gap-2 z-10 h-14">
        <button 
          className="h-12 w-12 rounded-full flex items-center justify-center hover:bg-blue-50 text-blue-600 transition-colors -ml-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-[30px] w-[30px]" strokeWidth={2.5} />
        </button>
        <h1 className="text-lg font-semibold flex-1">Notifications</h1>
      </div>

      {/* Notification Toggles */}
      <div className="mt-6">
        <div className="bg-white border-y border-gray-100 divide-y divide-gray-100">
          {/* Schedule */}
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-base font-medium text-gray-900">Schedule Updates</div>
                <div className="text-sm text-gray-500">New shifts and changes</div>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('schedule')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.schedule ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.schedule ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Tasks */}
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                <Bell className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-base font-medium text-gray-900">Task Assignments</div>
                <div className="text-sm text-gray-500">New tasks and updates</div>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('tasks')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.tasks ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.tasks ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Messages */}
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-base font-medium text-gray-900">Messages</div>
                <div className="text-sm text-gray-500">Direct messages and replies</div>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('messages')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.messages ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.messages ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Time Clock */}
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-base font-medium text-gray-900">Time Clock Reminders</div>
                <div className="text-sm text-gray-500">Clock in/out reminders</div>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('timeClock')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.timeClock ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.timeClock ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Announcements */}
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
                <Megaphone className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-base font-medium text-gray-900">Announcements</div>
                <div className="text-sm text-gray-500">Company updates and news</div>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('announcements')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.announcements ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.announcements ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

