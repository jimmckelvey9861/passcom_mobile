"use client"

import { Suspense } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, User } from "lucide-react"
import { Button } from "@/components/ui/button"

function EmergencyContactContent() {
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
        <h1 className="text-lg font-semibold flex-1">Emergency Contact</h1>
      </div>

      <div className="flex-1 overflow-auto py-6">
        {/* Section: Primary Contact */}
        <div className="mb-6">
          <h2 className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Primary Contact</h2>
          <div className="bg-white border-y border-gray-100 px-4 py-6">
            {/* Avatar/Icon */}
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center">
                <User className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Name
                </label>
                <div className="text-base font-medium text-gray-900">Sarah McKelvey</div>
              </div>

              {/* Relationship */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Relationship
                </label>
                <div className="text-base font-medium text-gray-900">Spouse</div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Phone
                </label>
                <div className="text-base font-medium text-gray-900">(555) 123-4567</div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <div className="px-4">
          <button
            onClick={() => console.log('Edit Contact')}
            className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
          >
            Edit Contact
          </button>
        </div>
      </div>
    </div>
  )
}

export default function EmergencyContactPage() {
  return (
    <Suspense fallback={null}>
      <EmergencyContactContent />
    </Suspense>
  )
}

