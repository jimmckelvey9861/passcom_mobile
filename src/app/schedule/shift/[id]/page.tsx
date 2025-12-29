"use client"

import { Suspense, use, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Clock, Briefcase, Users, MessageCircle, MoreVertical, Clock4 } from "lucide-react"
import { Button } from "@/components/ui/button"
import FindReplacementSheet from "@/components/FindReplacementSheet"
import ReplacementRequestSentModal from "@/components/ReplacementRequestSentModal"

// Mock function to get shift details - will be replaced with real data later
function getShiftDetails(id: string) {
  // Mock data - in production this would fetch from API/database
  return {
    id,
    job: "Bartender",
    status: "scheduled" as const,
    date: new Date(2025, 0, 15), // Jan 15, 2025
    startTime: "16:00",
    endTime: "23:00",
    duration: "7 hours",
    assignedUserId: "u-1",
    assignedUserName: "Pete Seager",
    assignedUserInitials: "PS",
    publishedBy: {
      id: "u-3",
      name: "Robert Zhang",
      initials: "RZ"
    },
    breakMinutes: 30,
  }
}

// Mock function to get available teammates - will be replaced with real data later
function getAvailableTeammates(shiftId: string) {
  // Mock data - in production this would fetch from API
  return [
    {
      id: "u-2",
      name: "Robert Zimmerman",
      initials: "RZ",
      avatarColor: "#F59E0B", // Orange
    },
    {
      id: "u-4",
      name: "Sam Thompson",
      initials: "ST",
      avatarColor: "#10B981", // Green
    },
    {
      id: "u-5",
      name: "Liz Carter",
      initials: "LC",
      avatarColor: "#8B5CF6", // Purple
    },
  ]
}

function ShiftDetailsContent({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const shift = getShiftDetails(id)
  const availableTeammates = getAvailableTeammates(id)

  // State for find replacement sheet and confirmation
  const [isFindReplacementOpen, setIsFindReplacementOpen] = useState(false)
  const [isRequestSentModalOpen, setIsRequestSentModalOpen] = useState(false)

  // Status indicator styling
  const statusConfig = {
    'scheduled': { dot: 'bg-blue-500', text: 'text-blue-500', label: 'Scheduled' },
    'clocked-in': { dot: 'bg-green-500', text: 'text-green-500', label: 'Clocked In' },
    'completed': { dot: 'bg-gray-500', text: 'text-gray-500', label: 'Completed' },
    'no-show': { dot: 'bg-red-500', text: 'text-red-500', label: 'No Show' },
  }

  const currentStatus = statusConfig[shift.status]

  // Format date
  const formattedDate = shift.date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })

  // Handle replacement request
  const handleSendReplacementRequest = (selectedUserIds: string[]) => {
    console.log('=== REPLACEMENT REQUEST ===')
    console.log('Shift ID:', shift.id)
    console.log('Selected Users:', selectedUserIds)
    console.log('Selected Users Details:', availableTeammates.filter(u => selectedUserIds.includes(u.id)))
    
    // Close the find replacement sheet
    setIsFindReplacementOpen(false)
    
    // Show confirmation modal
    setIsRequestSentModalOpen(true)
    
    // TODO: Send to backend API
  }

  // Handle confirmation modal close
  const handleConfirmationClose = () => {
    setIsRequestSentModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b px-4 py-4 flex items-center justify-between z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 -ml-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-6 w-6 text-blue-500" />
        </Button>
        <h1 className="text-lg font-semibold">Shift details</h1>
        <Button variant="ghost" size="icon" className="h-10 w-10 -mr-2">
          <MoreVertical className="h-6 w-6 text-blue-500" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4">
        {/* Shift Title */}
        <div className="py-6">
          <h2 className="text-3xl font-bold">{shift.job}</h2>
        </div>

        {/* Current Shift Status */}
        <div className="py-4 border-t flex items-center justify-between">
          <span className="text-base">Current shift status</span>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${currentStatus.dot}`} />
            <span className={`text-base font-medium ${currentStatus.text}`}>
              {currentStatus.label}
            </span>
          </div>
        </div>

        {/* Date */}
        <div className="py-4 border-t flex items-start gap-3">
          <Calendar className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <span className="text-base">{formattedDate}</span>
        </div>

        {/* Time */}
        <div className="py-4 border-t flex items-start gap-3">
          <Clock className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <span className="text-base">
            {shift.startTime} - {shift.endTime} ({shift.duration})
          </span>
        </div>

        {/* Job */}
        <div className="py-4 border-t flex items-start gap-3">
          <Briefcase className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="flex items-center gap-2">
            <span className="text-base">Job</span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-sm font-medium">
              {shift.job}
            </span>
          </div>
        </div>

        {/* Assigned To */}
        <div className="py-4 border-t flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-orange-400 flex items-center justify-center text-white text-sm font-semibold">
                {shift.assignedUserInitials}
              </div>
              <span className="text-base">{shift.assignedUserName}</span>
            </div>
          </div>
          <button 
            className="text-blue-500 text-sm hover:underline flex items-center gap-1"
            onClick={() => setIsFindReplacementOpen(true)}
          >
            <Users className="h-4 w-4" />
            Find replacement
          </button>
        </div>

        {/* Published By */}
        <div className="py-4 border-t flex items-start justify-between">
          <div className="flex items-start gap-3">
            <span className="text-base text-gray-700 mt-1">
              Published
              <br />
              by
            </span>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center text-white text-sm font-semibold">
                {shift.publishedBy.initials}
              </div>
              <span className="text-base">{shift.publishedBy.name}</span>
            </div>
          </div>
          <button className="text-blue-500 text-sm hover:underline flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            Chat
          </button>
        </div>

        {/* Break Time (if applicable) */}
        {shift.breakMinutes > 0 && (
          <div className="py-4 border-t flex items-start gap-3">
            <Clock4 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <span className="text-base">{shift.breakMinutes} minute break</span>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="sticky bottom-0 bg-white border-t px-4 py-4 flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14 rounded-full border-2 border-purple-500 text-purple-500 hover:bg-purple-50 shrink-0 bg-transparent"
          onClick={() => console.log('Clock action')}
        >
          <Clock4 className="h-6 w-6" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14 rounded-full border-2 border-gray-300 text-gray-400 hover:bg-gray-50 shrink-0 bg-transparent"
          onClick={() => console.log('More options')}
        >
          <MoreVertical className="h-6 w-6" />
        </Button>
        <Button 
          className="flex-1 h-14 bg-cyan-400 hover:bg-cyan-500 text-white text-base font-semibold rounded-full flex items-center justify-center gap-2"
          onClick={() => console.log('Open timeclock')}
        >
          <Clock className="h-5 w-5" />
          Open Timeclock
        </Button>
      </div>

      {/* Find Replacement Sheet */}
      <FindReplacementSheet
        isOpen={isFindReplacementOpen}
        onClose={() => setIsFindReplacementOpen(false)}
        onSendRequest={handleSendReplacementRequest}
        currentShiftId={shift.id}
        availableUsers={availableTeammates}
      />

      {/* Replacement Request Sent Confirmation Modal */}
      <ReplacementRequestSentModal
        isOpen={isRequestSentModalOpen}
        onClose={handleConfirmationClose}
      />
    </div>
  )
}

export default function ShiftDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ShiftDetailsContent params={params} />
    </Suspense>
  )
}


