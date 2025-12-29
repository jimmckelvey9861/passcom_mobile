"use client"

import { Suspense, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import TimeOffCard from "@/components/TimeOffCard"
import TimeOffStatsCard from "@/components/TimeOffStatsCard"
import { mockTimeOffRequests, mockTimeOffStats } from "@/data/dummyTimeOff"
import { TimeOffRequest } from "@/types/timeOff"

function TimeOffContent() {
  const router = useRouter()
  const [expandedSection, setExpandedSection] = useState<string>('pending')
  const [requests] = useState<TimeOffRequest[]>(mockTimeOffRequests)
  
  // Group requests by status
  const pendingRequests = requests.filter(r => r.status === 'pending')
  const approvedRequests = requests.filter(r => r.status === 'approved')
  const rejectedRequests = requests.filter(r => r.status === 'rejected')

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? '' : section)
  }

  const handleCancelRequest = (requestId: string) => {
    console.log('Cancel request:', requestId)
    // TODO: Implement backend API call
    alert('Request cancellation will be implemented with backend integration')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b px-4 py-4 flex items-center justify-between z-10 shadow-sm">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 -ml-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-6 w-6 text-blue-500" />
        </Button>
        <h1 className="text-lg font-semibold">Time Off Requests</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto pb-24">
        {/* Stats Card */}
        <div className="p-4">
          <TimeOffStatsCard stats={mockTimeOffStats} />
        </div>

        {/* Pending Requests */}
        <div className="bg-white mb-2 shadow-sm">
          <button
            onClick={() => toggleSection('pending')}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">📌</span>
              <h2 className="text-base font-semibold text-gray-900">
                Pending
              </h2>
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                {pendingRequests.length}
              </span>
            </div>
            {expandedSection === 'pending' ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
          </button>
          {expandedSection === 'pending' && (
            <div className="px-4 pb-4 space-y-3 border-t">
              {pendingRequests.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No pending requests
                </p>
              ) : (
                pendingRequests.map(request => (
                  <TimeOffCard 
                    key={request.id} 
                    request={request}
                    onCancel={handleCancelRequest}
                  />
                ))
              )}
            </div>
          )}
        </div>

        {/* Approved Requests */}
        <div className="bg-white mb-2 shadow-sm">
          <button
            onClick={() => toggleSection('approved')}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">✅</span>
              <h2 className="text-base font-semibold text-gray-900">
                Approved
              </h2>
              <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                {approvedRequests.length}
              </span>
            </div>
            {expandedSection === 'approved' ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
          </button>
          {expandedSection === 'approved' && (
            <div className="px-4 pb-4 space-y-3 border-t">
              {approvedRequests.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No approved requests
                </p>
              ) : (
                approvedRequests.map(request => (
                  <TimeOffCard key={request.id} request={request} />
                ))
              )}
            </div>
          )}
        </div>

        {/* Rejected Requests */}
        {rejectedRequests.length > 0 && (
          <div className="bg-white mb-2 shadow-sm">
            <button
              onClick={() => toggleSection('rejected')}
              className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">❌</span>
                <h2 className="text-base font-semibold text-gray-900">
                  Rejected
                </h2>
                <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                  {rejectedRequests.length}
                </span>
              </div>
              {expandedSection === 'rejected' ? (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
            </button>
            {expandedSection === 'rejected' && (
              <div className="px-4 pb-4 space-y-3 border-t">
                {rejectedRequests.map(request => (
                  <TimeOffCard key={request.id} request={request} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Info Message */}
        <div className="px-4 py-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 leading-relaxed">
              💡 <strong>Tip:</strong> Time off requests require manager approval. 
              You'll receive a notification when your request is reviewed.
            </p>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
        <Button
          onClick={() => router.push('/time-off/request')}
          className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center gap-2"
        >
          <Plus className="h-5 w-5" strokeWidth={3} />
          Request Time Off
        </Button>
      </div>
    </div>
  )
}

export default function TimeOffPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <TimeOffContent />
    </Suspense>
  )
}

