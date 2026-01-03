'use client'

import Link from "next/link"
import { useState } from "react"
import { ChevronLeft, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PayPage() {
  const [selectedPayment, setSelectedPayment] = useState("direct-deposit")

  const paymentMethods = [
    { id: "direct-deposit", label: "Direct Deposit", details: "Wells Fargo ...4567" },
    { id: "pay-card", label: "Pay Card", details: null },
    { id: "check", label: "Check", details: null },
    { id: "cash", label: "Cash", details: null },
  ]

  const payStubs = [
    { period: "Dec 1 - Dec 15", amount: "$1,245.50" },
    { period: "Nov 16 - Nov 30", amount: "$1,320.00" },
    { period: "Nov 1 - Nov 15", amount: "$1,180.25" },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 flex items-center gap-4 sticky top-0 z-10">
        <Link href="/profile">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <ChevronLeft className="h-6 w-6 text-blue-500" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold flex-1">Pay</h1>
      </div>

      <div className="py-4 space-y-6">
        {/* Payment Method */}
        <div className="bg-white border-y border-gray-200">
          <div className="px-6 py-3 border-b border-gray-100">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment Method</h2>
          </div>
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedPayment(method.id)}
              className="w-full flex items-center gap-3 px-6 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50"
            >
              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                selectedPayment === method.id ? "border-blue-500" : "border-gray-300"
              }`}>
                {selectedPayment === method.id && <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />}
              </div>
              <div className="flex-1 text-left">
                <p className="text-base text-gray-900">{method.label}</p>
                {method.details && <p className="text-sm text-gray-500">{method.details}</p>}
              </div>
            </button>
          ))}
        </div>

        {/* Pay Stubs */}
        <div className="bg-white border-y border-gray-200">
          <div className="px-6 py-3 border-b border-gray-100">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pay Stubs</h2>
          </div>
          {payStubs.map((stub, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-4 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-red-100 rounded flex items-center justify-center">
                  <FileText className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{stub.period}</p>
                  <p className="text-sm text-gray-500">{stub.amount}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="h-7 text-xs">PDF</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
