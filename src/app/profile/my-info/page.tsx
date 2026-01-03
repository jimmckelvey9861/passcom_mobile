"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, User, Mail, Phone, MapPin, Shirt, CheckCircle } from "lucide-react"
import { useGlobalApp } from "@/context/GlobalContext"

export default function MyInfoPage() {
  const router = useRouter()
  const { userProfile } = useGlobalApp()

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
        <h1 className="text-lg font-semibold flex-1">My Info</h1>
      </div>

      {/* Personal Information */}
      <div className="mt-6">
        <h2 className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Personal Information</h2>
        <div className="bg-white border-y border-gray-100 divide-y divide-gray-100">
          {/* Name */}
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Name</div>
                <div className="text-base font-medium text-gray-900">{userProfile.name}</div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Address</div>
                <div className="text-base font-medium text-gray-900">{userProfile.address}</div>
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                <Mail className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Email</div>
                <div className="text-base font-medium text-gray-900">{userProfile.email}</div>
              </div>
            </div>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>

          {/* Mobile */}
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                <Phone className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Mobile</div>
                <div className="text-base font-medium text-gray-900">{userProfile.phone}</div>
              </div>
            </div>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
        </div>
      </div>

      {/* Uniform Sizes */}
      <div className="mt-6">
        <h2 className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Uniform Sizes</h2>
        <div className="bg-white border-y border-gray-100 divide-y divide-gray-100">
          <div className="px-4 py-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center">
                <Shirt className="h-5 w-5 text-indigo-600" />
              </div>
              <span className="text-base font-medium text-gray-900">Sizes</span>
            </div>
            <div className="flex gap-2 ml-13">
              <span className="px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium text-gray-700">Shirt: L</span>
              <span className="px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium text-gray-700">Pants: 32</span>
              <span className="px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium text-gray-700">Shoe: 10.5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="mt-6">
        <h2 className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Location</h2>
        <div className="bg-white border-y border-gray-100">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Primary Location</div>
                <div className="text-base font-medium text-gray-900">Chelsea Market</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="mt-6 mb-6">
        <h2 className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Emergency Contact</h2>
        <div className="bg-white border-y border-gray-100 divide-y divide-gray-100">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
                <Phone className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Phone</div>
                <div className="text-base font-medium text-gray-900">(555) 987-6543</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-pink-50 flex items-center justify-center">
                <Mail className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Email</div>
                <div className="text-base font-medium text-gray-900">emergency@example.com</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

