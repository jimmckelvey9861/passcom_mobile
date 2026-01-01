"use client"

import { Suspense } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Building2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

function DirectDepositContent() {
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
        <h1 className="text-lg font-semibold flex-1">Direct Deposit</h1>
      </div>

      <div className="flex-1 overflow-auto py-6">
        {/* Section: Active Accounts */}
        <div className="mb-6">
          <h2 className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Active Accounts</h2>
          <div className="bg-white border-y border-gray-100">
            <div className="px-4 py-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-base font-semibold text-gray-900">Chase Checking</div>
                    <div className="text-sm text-gray-500">(...4455)</div>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-50 border border-green-200 text-green-700 rounded-full text-xs font-semibold">
                  Active
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-2">
                Distribution: <span className="font-semibold">100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Add Account Button */}
        <div className="px-4">
          <button
            onClick={() => console.log('Add Bank Account')}
            className="w-full px-4 py-3 border-2 border-blue-500 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Bank Account
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DirectDepositPage() {
  return (
    <Suspense fallback={null}>
      <DirectDepositContent />
    </Suspense>
  )
}

