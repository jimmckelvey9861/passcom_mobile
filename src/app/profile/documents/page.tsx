"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronRight, FileText, Shield, Clipboard, Award } from "lucide-react"

export default function DocumentsPage() {
  const router = useRouter()

  const documents = [
    { id: 1, name: "Employee Handbook", icon: FileText, color: "blue" },
    { id: 2, name: "Safety Training Certificate", icon: Shield, color: "green" },
    { id: 3, name: "Code of Conduct", icon: Clipboard, color: "purple" },
    { id: 4, name: "Benefits Summary", icon: Award, color: "orange" },
  ]

  const getIconBgColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: "bg-blue-50",
      green: "bg-green-50",
      purple: "bg-purple-50",
      orange: "bg-orange-50",
    }
    return colors[color] || "bg-gray-50"
  }

  const getIconColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: "text-blue-600",
      green: "text-green-600",
      purple: "text-purple-600",
      orange: "text-orange-600",
    }
    return colors[color] || "text-gray-600"
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
        <h1 className="text-lg font-semibold flex-1">Documents</h1>
      </div>

      {/* Documents List */}
      <div className="mt-6">
        <h2 className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wide">HR Documents</h2>
        <div className="bg-white border-y border-gray-100 divide-y divide-gray-100">
          {documents.map((doc) => {
            const Icon = doc.icon
            return (
              <button 
                key={doc.id}
                onClick={() => console.log('View document', doc.id)}
                className="flex items-center justify-between px-4 py-4 w-full hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full ${getIconBgColor(doc.color)} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${getIconColor(doc.color)}`} />
                  </div>
                  <span className="text-base font-medium text-gray-900">{doc.name}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            )
          })}
        </div>
      </div>

      {/* Placeholder Text */}
      <div className="px-4 py-6">
        <p className="text-sm text-gray-500 text-center">
          Additional documents will appear here as they become available.
        </p>
      </div>
    </div>
  )
}
