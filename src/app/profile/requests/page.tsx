"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronRight, Calendar, Repeat } from "lucide-react"

export default function RequestsPage() {
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
        <h1 className="text-lg font-semibold flex-1">Requests</h1>
      </div>

      {/* Options List */}
      <div className="mt-6">
        <div className="bg-white border-y border-gray-100 divide-y divide-gray-100">
          {/* Time Off */}
          <button 
            onClick={() => router.push('/availability')}
            className="flex items-center justify-between px-4 py-4 w-full hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-base font-medium text-gray-900">Time Off</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>

          {/* Shift Swaps */}
          <button 
            onClick={() => router.push('/schedule')}
            className="flex items-center justify-between px-4 py-4 w-full hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                <Repeat className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-base font-medium text-gray-900">Shift Swaps</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  )
}

