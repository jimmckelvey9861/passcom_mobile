"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Moon, Globe, Lock, Eye } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  
  const [settings, setSettings] = useState({
    darkMode: false,
    autoClockOut: true,
    privateProfile: false,
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
        <h1 className="text-lg font-semibold flex-1">Settings</h1>
      </div>

      {/* Appearance */}
      <div className="mt-6">
        <h2 className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Appearance</h2>
        <div className="bg-white border-y border-gray-100">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center">
                <Moon className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <div className="text-base font-medium text-gray-900">Dark Mode</div>
                <div className="text-sm text-gray-500">Use dark theme</div>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('darkMode')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.darkMode ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="mt-6">
        <h2 className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Preferences</h2>
        <div className="bg-white border-y border-gray-100 divide-y divide-gray-100">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center">
                <Globe className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-base font-medium text-gray-900">Auto Clock Out</div>
                <div className="text-sm text-gray-500">After 12 hours</div>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('autoClockOut')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.autoClockOut ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.autoClockOut ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Privacy */}
      <div className="mt-6">
        <h2 className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Privacy</h2>
        <div className="bg-white border-y border-gray-100 divide-y divide-gray-100">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
                <Lock className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-base font-medium text-gray-900">Private Profile</div>
                <div className="text-sm text-gray-500">Hide from other employees</div>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('privateProfile')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.privateProfile ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.privateProfile ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <button 
            onClick={() => console.log('Change password')}
            className="flex items-center justify-between px-4 py-4 w-full hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                <Eye className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-base font-medium text-gray-900">Change Password</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

