"use client"

import { Suspense } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronRight, FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

function DocumentsContent() {
  const router = useRouter()

  const payStubs = [
    { id: 1, period: "Nov 1 - 15, 2024", amount: "$1,240.50" },
    { id: 2, period: "Oct 16 - 31, 2024", amount: "$1,185.00" },
    { id: 3, period: "Oct 1 - 15, 2024", amount: "$1,312.75" },
  ]

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
        <h1 className="text-lg font-semibold flex-1">Documents</h1>
      </div>

      <div className="flex-1 overflow-auto py-6">
        {/* Section: Tax Documents */}
        <div className="mb-6">
          <h2 className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Tax Documents</h2>
          <div className="bg-white border-y border-gray-100 divide-y divide-gray-100">
            {/* 2024 W-2 */}
            <button 
              onClick={() => console.log('Download 2024 W-2')}
              className="flex items-center justify-between px-4 py-4 w-full hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-base font-medium text-gray-900">2024 W-2</span>
              </div>
              <Download className="h-5 w-5 text-gray-400" />
            </button>

            {/* 2023 W-2 */}
            <button 
              onClick={() => console.log('Download 2023 W-2')}
              className="flex items-center justify-between px-4 py-4 w-full hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-base font-medium text-gray-900">2023 W-2</span>
              </div>
              <Download className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Section: Pay Stubs */}
        <div className="mb-6">
          <h2 className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Pay Stubs</h2>
          <div className="bg-white border-y border-gray-100 divide-y divide-gray-100">
            {payStubs.map((stub) => (
              <button 
                key={stub.id}
                onClick={() => console.log('View pay stub:', stub.period)}
                className="flex items-center justify-between px-4 py-4 w-full hover:bg-gray-50 transition-colors"
              >
                <span className="text-base font-medium text-gray-900">{stub.period}</span>
                <div className="flex items-center gap-3">
                  <span className="text-base font-semibold text-green-700">{stub.amount}</span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={null}>
      <DocumentsContent />
    </Suspense>
  )
}

