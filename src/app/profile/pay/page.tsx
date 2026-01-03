"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronRight, DollarSign, FileText, CreditCard, Banknote } from "lucide-react"

export default function PayPage() {
  const router = useRouter()

  const payStubs = [
    { id: 1, date: "Dec 15, 2025", amount: "$1,245.50" },
    { id: 2, date: "Dec 1, 2025", amount: "$1,320.00" },
    { id: 3, date: "Nov 15, 2025", amount: "$1,180.25" },
  ]

  const taxDocs = [
    { id: 1, year: "2025", type: "W-2" },
    { id: 2, year: "2024", type: "W-2" },
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
        <h1 className="text-lg font-semibold flex-1">Pay</h1>
      </div>

      {/* Pay Method */}
      <div className="mt-6">
        <h2 className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Pay Method</h2>
        <div className="bg-white border-y border-gray-100">
          <button 
            onClick={() => console.log('Change pay method')}
            className="flex items-center justify-between px-4 py-4 w-full hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                <Banknote className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-left">
                <div className="text-base font-medium text-gray-900">Direct Deposit</div>
                <div className="text-sm text-gray-500">Bank: Wells Fargo ••••4567</div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Pay Stubs */}
      <div className="mt-6">
        <h2 className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Pay Stubs</h2>
        <div className="bg-white border-y border-gray-100 divide-y divide-gray-100">
          {payStubs.map((stub) => (
            <button 
              key={stub.id}
              onClick={() => console.log('View pay stub', stub.id)}
              className="flex items-center justify-between px-4 py-4 w-full hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="text-base font-medium text-gray-900">{stub.date}</div>
                  <div className="text-sm text-gray-500">{stub.amount}</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Tax Documents */}
      <div className="mt-6 mb-6">
        <h2 className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wide">W2 / 1099</h2>
        <div className="bg-white border-y border-gray-100 divide-y divide-gray-100">
          {taxDocs.map((doc) => (
            <button 
              key={doc.id}
              onClick={() => console.log('View tax document', doc.id)}
              className="flex items-center justify-between px-4 py-4 w-full hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <div className="text-base font-medium text-gray-900">{doc.type} - {doc.year}</div>
                  <div className="text-sm text-gray-500">Tax Document</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

