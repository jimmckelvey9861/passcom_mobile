"use client"

import { Suspense, useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bell, Play, Square, Coffee, DollarSign, Clock, MapPin, AlertCircle, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Break {
  start: Date
  end: Date | null
}

interface TimeEntry {
  id: string
  scheduledStart: string
  scheduledJob: string
  actualStart: Date | null
  actualEnd: Date | null
  breaks: Break[]
  declaredTips: number
  editNote?: string
}

type WizardStep = 'tips' | 'review' | 'success'

function TimeClockContent() {
  const router = useRouter()
  
  // Mock scheduled shift
  const scheduledShift = {
    job: "Line Cook",
    startTime: "9:00 AM",
  }
  
  // Time entry state
  const [timeEntry, setTimeEntry] = useState<TimeEntry>({
    id: "entry-1",
    scheduledStart: "9:00 AM",
    scheduledJob: "Line Cook",
    actualStart: null,
    actualEnd: null,
    breaks: [],
    declaredTips: 0,
    editNote: undefined,
  })
  
  // Clock state
  const [isClockedIn, setIsClockedIn] = useState(false)
  const [isOnBreak, setIsOnBreak] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Wizard state
  const [showWizard, setShowWizard] = useState(false)
  const [wizardStep, setWizardStep] = useState<WizardStep>('tips')
  const [tipAmount, setTipAmount] = useState("")
  const [editedStartTime, setEditedStartTime] = useState("")
  const [editedEndTime, setEditedEndTime] = useState("")
  const [editReason, setEditReason] = useState("")
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  
  // Timer effect
  useEffect(() => {
    if (isClockedIn && !isOnBreak && timeEntry.actualStart) {
      timerIntervalRef.current = setInterval(() => {
        const now = new Date()
        const start = new Date(timeEntry.actualStart!)
        
        // Subtract break time
        let breakTime = 0
        timeEntry.breaks.forEach(b => {
          if (b.end) {
            breakTime += (b.end.getTime() - b.start.getTime()) / 1000
          }
        })
        
        const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000) - breakTime
        setElapsedTime(Math.max(0, elapsed))
      }, 1000)
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
    
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [isClockedIn, isOnBreak, timeEntry])
  
  // Format elapsed time
  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  
  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }
  
  // Format time for input (24hr)
  const formatTimeForInput = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }
  
  // Parse time input to Date
  const parseTimeInput = (timeString: string, referenceDate: Date) => {
    const [hours, minutes] = timeString.split(':').map(Number)
    const date = new Date(referenceDate)
    date.setHours(hours, minutes, 0, 0)
    return date
  }
  
  // Calculate time difference in minutes
  const getTimeDifferenceMinutes = (date1: Date, date2: Date) => {
    return Math.abs((date1.getTime() - date2.getTime()) / (1000 * 60))
  }
  
  // Check if edit requires reason (>15 min)
  const requiresEditReason = () => {
    if (!timeEntry.actualStart || !timeEntry.actualEnd) return false
    
    const startDiff = editedStartTime 
      ? getTimeDifferenceMinutes(
          parseTimeInput(editedStartTime, timeEntry.actualStart),
          timeEntry.actualStart
        )
      : 0
    
    const endDiff = editedEndTime
      ? getTimeDifferenceMinutes(
          parseTimeInput(editedEndTime, timeEntry.actualEnd),
          timeEntry.actualEnd
        )
      : 0
    
    return startDiff > 15 || endDiff > 15
  }
  
  // Calculate total hours
  const calculateTotalHours = () => {
    if (!timeEntry.actualStart || !timeEntry.actualEnd) return 0
    
    const start = editedStartTime 
      ? parseTimeInput(editedStartTime, timeEntry.actualStart)
      : timeEntry.actualStart
    const end = editedEndTime
      ? parseTimeInput(editedEndTime, timeEntry.actualEnd)
      : timeEntry.actualEnd
    
    let totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
    
    // Subtract break time
    timeEntry.breaks.forEach(b => {
      if (b.end) {
        totalMinutes -= (b.end.getTime() - b.start.getTime()) / (1000 * 60)
      }
    })
    
    return (totalMinutes / 60).toFixed(2)
  }
  
  // Calculate break duration
  const calculateBreakDuration = () => {
    let totalMinutes = 0
    timeEntry.breaks.forEach(b => {
      if (b.end) {
        totalMinutes += (b.end.getTime() - b.start.getTime()) / (1000 * 60)
      }
    })
    return Math.floor(totalMinutes)
  }
  
  // Handle clock in
  const handleClockIn = () => {
    const now = new Date()
    setTimeEntry(prev => ({
      ...prev,
      actualStart: now,
    }))
    setIsClockedIn(true)
    console.log('Clocked in at:', now)
  }
  
  // Handle start break
  const handleStartBreak = () => {
    const now = new Date()
    setTimeEntry(prev => ({
      ...prev,
      breaks: [...prev.breaks, { start: now, end: null }]
    }))
    setIsOnBreak(true)
    console.log('Break started at:', now)
  }
  
  // Handle end break
  const handleEndBreak = () => {
    const now = new Date()
    setTimeEntry(prev => {
      const updatedBreaks = [...prev.breaks]
      const lastBreak = updatedBreaks[updatedBreaks.length - 1]
      if (lastBreak && !lastBreak.end) {
        lastBreak.end = now
      }
      return { ...prev, breaks: updatedBreaks }
    })
    setIsOnBreak(false)
    console.log('Break ended at:', now)
  }
  
  // Handle clock out (open wizard)
  const handleClockOut = () => {
    const now = new Date()
    setTimeEntry(prev => ({
      ...prev,
      actualEnd: now,
    }))
    
    // End any active break
    if (isOnBreak) {
      handleEndBreak()
    }
    
    // Initialize edited times
    setEditedStartTime("")
    setEditedEndTime("")
    setEditReason("")
    setTipAmount("0.00")
    
    setShowWizard(true)
    setWizardStep('tips')
    console.log('Clocked out at:', now)
  }
  
  // Handle wizard next
  const handleWizardNext = () => {
    if (wizardStep === 'tips') {
      setWizardStep('review')
    } else if (wizardStep === 'review') {
      // Validate
      const newErrors: { [key: string]: string } = {}
      
      if (requiresEditReason() && !editReason.trim()) {
        newErrors.editReason = 'Reason required for changes over 15 minutes'
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }
      
      // Submit
      handleSubmitTimesheet()
    }
  }
  
  // Handle submit
  const handleSubmitTimesheet = () => {
    console.log('=== TIMESHEET SUBMITTED ===')
    console.log({
      ...timeEntry,
      actualEnd: timeEntry.actualEnd,
      declaredTips: parseFloat(tipAmount),
      editedStartTime: editedStartTime || undefined,
      editedEndTime: editedEndTime || undefined,
      editNote: editReason || undefined,
      totalHours: calculateTotalHours(),
      breakDuration: calculateBreakDuration(),
    })
    
    setWizardStep('success')
    
    // Reset after success
    setTimeout(() => {
      setShowWizard(false)
      setIsClockedIn(false)
      setElapsedTime(0)
      setTimeEntry({
        id: `entry-${Date.now()}`,
        scheduledStart: "9:00 AM",
        scheduledJob: "Line Cook",
        actualStart: null,
        actualEnd: null,
        breaks: [],
        declaredTips: 0,
        editNote: undefined,
      })
      setWizardStep('tips')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
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
        <h1 className="text-lg font-semibold">Time Clock</h1>
        <Button variant="ghost" size="icon" className="h-10 w-10 -mr-2">
          <Bell className="h-6 w-6 text-gray-600" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {!isClockedIn ? (
          /* STATE A: CLOCKED OUT */
          <div className="w-full max-w-md space-y-8">
            {/* Scheduled Shift Info */}
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">
                Scheduled: {scheduledShift.job}
              </h2>
              <p className="text-3xl font-bold text-gray-700">
                {scheduledShift.startTime}
              </p>
            </div>

            {/* Location Map */}
            <div className="w-full max-w-sm mx-auto">
              <div className="relative w-full h-48 bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-lg">
                {/* Map Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="gray" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>
                
                {/* Location Pin */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Pulse rings */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-green-400 rounded-full animate-ping opacity-75"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    
                    {/* Pin icon */}
                    <div className="relative z-10 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
                      <MapPin className="h-6 w-6 text-white" fill="white" />
                    </div>
                  </div>
                </div>
                
                {/* Location Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center gap-2 text-white">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold">Restaurant Location</span>
                  </div>
                  <p className="text-xs text-white/80 mt-1">123 Main Street, Downtown</p>
                </div>
              </div>
              
              {/* Verification Badge */}
              <div className="flex justify-center mt-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">Location Verified</span>
                </div>
              </div>
            </div>

            {/* Clock In Button */}
            <div className="flex justify-center">
              <button
                onClick={handleClockIn}
                className="w-64 h-64 rounded-full bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 shadow-2xl hover:shadow-3xl transition-all duration-300 flex flex-col items-center justify-center gap-4 active:scale-95"
              >
                <Play className="h-16 w-16 text-white" strokeWidth={2.5} />
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">Clock In</div>
                  <div className="text-sm text-white/80">Tap to start</div>
                </div>
              </button>
            </div>
          </div>
        ) : (
          /* STATE B: CLOCKED IN */
          <div className="w-full max-w-md space-y-8">
            {/* Timer Display */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
                <Clock className="h-4 w-4 text-blue-600 animate-pulse" />
                <span className="text-sm font-medium text-blue-700">Currently Working</span>
              </div>
              
              <div className="text-7xl font-bold text-gray-900 font-mono tracking-tight">
                {formatElapsedTime(elapsedTime)}
              </div>
              
              <p className="text-sm text-gray-500">
                Started at {timeEntry.actualStart && formatTime(timeEntry.actualStart)}
              </p>
            </div>

            {/* Break Info */}
            {timeEntry.breaks.length > 0 && (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Break time: {calculateBreakDuration()} minutes
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Break Button */}
              <Button
                onClick={isOnBreak ? handleEndBreak : handleStartBreak}
                className={`w-full h-14 rounded-full text-base font-semibold transition-all ${
                  isOnBreak
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                }`}
              >
                <Coffee className="h-5 w-5 mr-2" />
                {isOnBreak ? 'End Break' : 'Start Break'}
              </Button>

              {/* Clock Out Button */}
              <Button
                onClick={handleClockOut}
                variant="outline"
                className="w-full h-14 rounded-full border-2 border-red-500 text-red-600 hover:bg-red-50 text-base font-semibold"
              >
                <Square className="h-5 w-5 mr-2" />
                Clock Out
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Submission Wizard Modal */}
      {showWizard && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200" />

          {/* Modal */}
          <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col">
            {wizardStep === 'tips' && (
              /* STEP 1: TIP DECLARATION */
              <>
                <div className="px-6 py-6 border-b">
                  <h2 className="text-2xl font-bold text-center">Declare Cash Tips</h2>
                </div>
                
                <div className="flex-1 overflow-auto px-6 py-8">
                  <div className="max-w-sm mx-auto space-y-6">
                    <div className="flex justify-center">
                      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                        <DollarSign className="h-10 w-10 text-green-600" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">
                        Cash Tips Received
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">
                          $
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={tipAmount}
                          onChange={(e) => setTipAmount(e.target.value)}
                          className="h-16 text-3xl font-bold text-center pl-12 pr-4"
                          placeholder="0.00"
                        />
                      </div>
                      <p className="text-xs text-gray-500 text-center mt-2">
                        Enter the total cash tips you received today
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 border-t">
                  <Button
                    onClick={handleWizardNext}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-base font-semibold"
                  >
                    Next
                  </Button>
                </div>
              </>
            )}

            {wizardStep === 'review' && timeEntry.actualStart && timeEntry.actualEnd && (
              /* STEP 2: REVIEW & EDIT */
              <>
                <div className="px-6 py-6 border-b">
                  <h2 className="text-2xl font-bold text-center">Review Timesheet</h2>
                </div>
                
                <div className="flex-1 overflow-auto px-6 py-6 space-y-6">
                  {/* Start Time */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={editedStartTime || formatTimeForInput(timeEntry.actualStart)}
                      onChange={(e) => {
                        setEditedStartTime(e.target.value)
                        if (errors.editReason) setErrors({})
                      }}
                      className="w-full h-12 px-4 bg-white border border-gray-300 rounded-lg text-lg font-semibold"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Actual: {formatTime(timeEntry.actualStart)}
                    </p>
                  </div>

                  {/* End Time */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={editedEndTime || formatTimeForInput(timeEntry.actualEnd)}
                      onChange={(e) => {
                        setEditedEndTime(e.target.value)
                        if (errors.editReason) setErrors({})
                      }}
                      className="w-full h-12 px-4 bg-white border border-gray-300 rounded-lg text-lg font-semibold"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Actual: {formatTime(timeEntry.actualEnd)}
                    </p>
                  </div>

                  {/* Break Duration */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Break Duration</span>
                      <span className="text-lg font-bold text-gray-900">
                        {calculateBreakDuration()} min
                      </span>
                    </div>
                  </div>

                  {/* Total Hours */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-blue-700">Total Hours</span>
                      <span className="text-2xl font-bold text-blue-900">
                        {calculateTotalHours()} hrs
                      </span>
                    </div>
                  </div>

                  {/* Edit Reason (Conditional) */}
                  {requiresEditReason() && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Reason for Change <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={editReason}
                        onChange={(e) => {
                          setEditReason(e.target.value)
                          if (errors.editReason) setErrors({})
                        }}
                        placeholder="Changes over 15 minutes require explanation..."
                        className={`w-full h-24 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm ${
                          errors.editReason ? 'border-red-500' : 'border-gray-300'
                        }`}
                        maxLength={200}
                      />
                      {errors.editReason && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.editReason}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {editReason.length}/200 characters
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="px-6 py-4 border-t flex gap-3">
                  <Button
                    onClick={() => setWizardStep('tips')}
                    variant="outline"
                    className="flex-1 h-12 rounded-full border-2"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleWizardNext}
                    className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold"
                  >
                    Confirm & Submit
                  </Button>
                </div>
              </>
            )}

            {wizardStep === 'success' && (
              /* STEP 3: SUCCESS */
              <>
                <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
                    <Check className="h-10 w-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-center mb-2">Timesheet Submitted!</h2>
                  <p className="text-gray-600 text-center">
                    Your hours have been recorded and sent for approval.
                  </p>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default function TimeClockPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <TimeClockContent />
    </Suspense>
  )
}

