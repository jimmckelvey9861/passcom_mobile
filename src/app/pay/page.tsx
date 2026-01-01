"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import BottomNav from "@/components/BottomNav"

export default function PayDashboardPage() {
  const router = useRouter()
  const [onTimeArrival] = useState(98)
  const [shiftAcceptance] = useState(100)
  // Logic to determine if metrics are "good" (Green)
  const metricsGood = onTimeArrival >= 95 && shiftAcceptance >= 95

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white border-b px-4 py-4 flex items-center z-10">
        <button 
          className="h-12 w-12 rounded-full flex items-center justify-center hover:bg-blue-50 text-blue-600 transition-colors -ml-2 absolute left-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-[30px] w-[30px]" strokeWidth={2.5} />
        </button>
        <h1 className="text-lg font-semibold flex-1 text-center">Pay</h1>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto">
        
        {/* Hero Section */}
        <div className="py-8 px-4 text-center">
          <p className="text-sm text-gray-500 mb-2">Available Balance</p>
          <div className="text-5xl font-bold text-gray-900 mb-3">$342.50</div>
          <div className="inline-block bg-blue-50 text-blue-500 text-sm px-3 py-1 rounded-full">
            Next auto-deposit: Fri, Dec 28
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="flex items-center justify-center gap-6 pb-6 border-b">
          <div className="flex items-center gap-1 text-sm">
            <span>🟢</span>
            <span className="font-medium">98% On-Time</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <span>🟢</span>
            <span className="font-medium">100% Acceptance</span>
          </div>
        </div>

        {/* Balances */}
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Balances</h2>
            <button className="text-blue-500 text-sm font-medium hover:underline">request time off</button>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 bg-gray-100 rounded-lg p-4 text-center">
              <div className="text-base text-gray-600 mb-1">Time Off</div>
              <div className="text-2xl font-bold text-gray-900">0</div>
            </div>
            <div className="flex-1 bg-gray-100 rounded-lg p-4 text-center">
              <div className="text-base text-gray-600 mb-1">Sick Leave</div>
              <div className="text-2xl font-bold text-gray-900">0</div>
            </div>
            <div className="flex-1 bg-gray-100 rounded-lg p-4 text-center">
              <div className="text-base text-gray-600 mb-1">Unpaid Leave</div>
              <div className="text-2xl font-bold text-gray-900">0</div>
            </div>
          </div>
        </div>

        {/* Work History List */}
        <div className="px-4 pb-24">
          <h2 className="text-lg font-semibold mb-4">Work History</h2>
          <div className="space-y-3">
            
            {/* Friday Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="text-center min-w-[60px]">
                  <div className="text-3xl font-bold text-gray-400">12</div>
                  <div className="text-sm text-gray-400 font-medium">Fri</div>
                </div>
                <div className="h-12 w-px bg-gray-200"></div>
                <div className="flex-1 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Regular</div>
                    <div className="text-sm font-semibold text-gray-500">8.5h</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">OT</div>
                    <div className="text-sm font-semibold text-gray-500">1.5h</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Tips</div>
                    <div className="text-sm font-semibold text-gray-500">$42</div>
                  </div>
                </div>
                <div className="text-center min-w-[70px]">
                  <div className="text-xs text-blue-500 mb-1">Total</div>
                  <div className="text-lg font-bold text-blue-500">$285</div>
                </div>
              </div>
            </div>

            {/* Thursday Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="text-center min-w-[60px]">
                  <div className="text-3xl font-bold text-gray-400">11</div>
                  <div className="text-sm text-gray-400 font-medium">Thu</div>
                </div>
                <div className="h-12 w-px bg-gray-200"></div>
                <div className="flex-1 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Regular</div>
                    <div className="text-sm font-semibold text-gray-500">7.0h</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">OT</div>
                    <div className="text-sm font-semibold text-gray-500">0.0h</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Tips</div>
                    <div className="text-sm font-semibold text-gray-500">$28</div>
                  </div>
                </div>
                <div className="text-center min-w-[70px]">
                  <div className="text-xs text-blue-500 mb-1">Total</div>
                  <div className="text-lg font-bold text-blue-500">$168</div>
                </div>
              </div>
            </div>

            {/* Wednesday Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="text-center min-w-[60px]">
                  <div className="text-3xl font-bold text-gray-400">10</div>
                  <div className="text-sm text-gray-400 font-medium">Wed</div>
                </div>
                <div className="h-12 w-px bg-gray-200"></div>
                <div className="flex-1 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Regular</div>
                    <div className="text-sm font-semibold text-gray-500">8.0h</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">OT</div>
                    <div className="text-sm font-semibold text-gray-500">0.5h</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Tips</div>
                    <div className="text-sm font-semibold text-gray-500">$35</div>
                  </div>
                </div>
                <div className="text-center min-w-[70px]">
                  <div className="text-xs text-blue-500 mb-1">Total</div>
                  <div className="text-lg font-bold text-blue-500">$205</div>
                </div>
              </div>
            </div>
            
            {/* Tuesday Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-4">
                <div className="text-center min-w-[60px]">
                    <div className="text-3xl font-bold text-gray-400">09</div>
                    <div className="text-sm text-gray-400 font-medium">Tue</div>
                </div>
                <div className="h-12 w-px bg-gray-200"></div>
                <div className="flex-1 grid grid-cols-3 gap-3 text-center">
                    <div>
                    <div className="text-xs text-gray-400 mb-1">Regular</div>
                    <div className="text-sm font-semibold text-gray-500">6.5h</div>
                    </div>
                    <div>
                    <div className="text-xs text-gray-400 mb-1">OT</div>
                    <div className="text-sm font-semibold text-gray-500">--</div>
                    </div>
                    <div>
                    <div className="text-xs text-gray-400 mb-1">Tips</div>
                    <div className="text-sm font-semibold text-gray-500">$18</div>
                    </div>
                </div>
                <div className="text-center min-w-[70px]">
                    <div className="text-xs text-blue-500 mb-1">Total</div>
                    <div className="text-lg font-bold text-blue-500">$148</div>
                </div>
                </div>
            </div>

          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 bg-white border-t px-4 py-4">
        <Button className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-xl text-base font-semibold">
          <Zap className="h-5 w-5 mr-2" />
          Instant Cash Out
        </Button>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}

