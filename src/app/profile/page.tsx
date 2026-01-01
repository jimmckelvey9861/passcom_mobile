"use client"

import { Suspense } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronRight, User, Shirt, Award, FileText, DollarSign, Phone, Bell, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

function ProfileContent() {
  const router = useRouter()

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
        <h1 className="text-lg font-semibold flex-1">Profile</h1>
      </div>

      {/* Hero Section */}
      <div className="bg-white border-b px-4 py-8 text-center">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
          JM
        </div>
        
        {/* Name */}
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Jim McKelvey</h1>
        
        {/* Role */}
        <p className="text-sm text-gray-500 mb-4">Shift Lead • Level 3</p>
        
        {/* Stats Row */}
        <div className="flex items-center justify-center gap-8 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">4.9</div>
            <div className="text-xs text-gray-500 mt-1">Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">98%</div>
            <div className="text-xs text-gray-500 mt-1">Reliability</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">1.2k</div>
            <div className="text-xs text-gray-500 mt-1">Hours</div>
          </div>
        </div>
      </div>

      {/* Section: My Essentials */}
      <div className="mt-6">
        <h2 className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Essentials</h2>
        <div className="bg-white border-y border-gray-100 divide-y divide-gray-100">
          {/* Uniform Sizes */}
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                <Shirt className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-base font-medium text-gray-900">Uniform Sizes</span>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">Shirt: L</span>
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">Shoe: 10.5</span>
            </div>
          </div>

          {/* Home Base */}
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-base font-medium text-gray-900">Home Base</span>
            </div>
            <span className="text-sm text-gray-600">Chelsea Market Location</span>
          </div>
        </div>
      </div>

      {/* Section: Work & Skills */}
      <div className="mt-6">
        <h2 className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Qualifications</h2>
        <div className="bg-white border-y border-gray-100 px-4 py-4">
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-sm font-medium">
              Food Handler
            </span>
            <span className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-sm font-medium">
              Alcohol Server
            </span>
            <span className="px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-full text-sm font-medium">
              Key Holder
            </span>
            <span className="px-3 py-1.5 bg-purple-50 border border-purple-200 text-purple-700 rounded-full text-sm font-medium">
              Barista Certified
            </span>
          </div>
        </div>
      </div>

      {/* Section: HR & Admin */}
      <div className="mt-6">
        <h2 className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Documents & Pay</h2>
        <div className="bg-white border-y border-gray-100 divide-y divide-gray-100">
          {/* Pay Stubs & W-2s */}
          <button 
            onClick={() => router.push('/profile/documents')}
            className="flex items-center justify-between px-4 py-4 w-full hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-base font-medium text-gray-900">Pay Stubs & W-2s</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>

          {/* Direct Deposit */}
          <button 
            onClick={() => router.push('/profile/direct-deposit')}
            className="flex items-center justify-between px-4 py-4 w-full hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-base font-medium text-gray-900">Direct Deposit</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>

          {/* Emergency Contact */}
          <button 
            onClick={() => router.push('/profile/emergency-contact')}
            className="flex items-center justify-between px-4 py-4 w-full hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
                <Phone className="h-5 w-5 text-red-600" />
              </div>
              <span className="text-base font-medium text-gray-900">Emergency Contact</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Section: App Settings */}
      <div className="mt-6 mb-6">
        <h2 className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wide">App Settings</h2>
        <div className="bg-white border-y border-gray-100 divide-y divide-gray-100">
          {/* Notifications */}
          <button 
            onClick={() => router.push('/notification-settings')}
            className="flex items-center justify-between px-4 py-4 w-full hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-base font-medium text-gray-900">Notifications</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>

          {/* Switch to Manager Mode */}
          <button 
            onClick={() => console.log('Switch to Manager Mode')}
            className="flex items-center justify-between px-4 py-4 w-full hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Award className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-base font-semibold text-blue-600">Switch to Manager Mode</span>
            </div>
            <ChevronRight className="h-5 w-5 text-blue-600" />
          </button>

          {/* Log Out */}
          <button 
            onClick={() => console.log('Log Out')}
            className="flex items-center justify-center px-4 py-4 w-full hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-base font-semibold text-red-600">Log Out</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileContent />
    </Suspense>
  )
}
