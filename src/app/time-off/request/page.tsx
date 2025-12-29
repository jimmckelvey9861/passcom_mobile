"use client"

import { Suspense, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, AlertCircle, Sun, Thermometer, CircleSlash, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import DateRangeModal from "@/components/DateRangeModal"
import { TimeOffType, calculateDaysBetween } from "@/types/timeOff"

const timeOffTypes = [
  { id: 'vacation' as TimeOffType, icon: Sun, label: 'PTO', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { id: 'sick' as TimeOffType, icon: Thermometer, label: 'Sick', color: 'bg-red-50 border-red-200 text-red-700' },
  { id: 'personal' as TimeOffType, icon: CircleSlash, label: 'Unpaid', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { id: 'other' as TimeOffType, icon: MoreHorizontal, label: 'Other', color: 'bg-gray-50 border-gray-200 text-gray-700' },
]

function RequestTimeOffContent() {
  const router = useRouter()
  
  // Mock available days (would come from API)
  const availableDays = {
    pto: 12,
    sick: 5,
  }
  
  // Form state
  const [selectedType, setSelectedType] = useState<TimeOffType>('vacation')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [otherReason, setOtherReason] = useState('') // For "Other" type
  const [reason, setReason] = useState('')
  const [isDateModalOpen, setIsDateModalOpen] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  
  // Validation state
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calculate total days
  const totalDays = startDate && endDate 
    ? calculateDaysBetween(startDate, endDate)
    : 0

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return ''
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Handle date range selection
  const handleDateRangeApply = (range: { start: Date; end: Date } | null) => {
    if (range) {
      setStartDate(range.start)
      setEndDate(range.end)
      if (errors.startDate || errors.endDate) {
        setErrors({ ...errors, startDate: '', endDate: '' })
      }
    }
    setIsDateModalOpen(false)
  }

  // Validate form
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!startDate) {
      newErrors.dates = 'Date range is required'
    }

    if (!endDate) {
      newErrors.dates = 'Date range is required'
    }

    if (startDate && endDate) {
      // Check if start date is in the past
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (startDate < today) {
        newErrors.dates = 'Start date cannot be in the past'
      }
    }

    // If "Other" is selected, otherReason is required
    if (selectedType === 'other' && !otherReason.trim()) {
      newErrors.otherReason = 'Reason for request is required'
    }

    // Reason is required for Sick, Unpaid, and Other - NOT for PTO
    if (selectedType !== 'vacation' && !reason.trim()) {
      newErrors.reason = 'Reason is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle initial submit (show confirmation modal)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Show confirmation modal
    setShowConfirmModal(true)
  }

  // Handle final submit after confirmation
  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false)
    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    console.log('=== TIME OFF REQUEST SUBMITTED ===')
    console.log({
      type: selectedType,
      ...(selectedType === 'other' && { otherReason }),
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      totalDays,
      reason,
    })

    // Show success message
    const typeLabel = timeOffTypes.find(t => t.id === selectedType)?.label
    const otherReasonText = selectedType === 'other' ? `\nType: ${otherReason}` : ''
    alert(`✅ Time Off Request Submitted!\n\nType: ${typeLabel}${otherReasonText}\nDates: ${formatDate(startDate)} - ${formatDate(endDate)}\nDays: ${totalDays}\n\nYour manager will review your request.`)

    // Navigate back to time off list
    router.push('/time-off')
  }

  // Handle type selection
  const handleTypeSelect = (type: TimeOffType) => {
    setSelectedType(type)
  }

  // Get selected type info
  const selectedTypeInfo = timeOffTypes.find(t => t.id === selectedType)!

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b px-4 py-4 flex items-center justify-between z-10 shadow-sm">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 -ml-2"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          <ArrowLeft className="h-6 w-6 text-blue-500" />
        </Button>
        <h1 className="text-lg font-semibold">Request Time Off</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-auto pb-24">
        <div className="p-4 space-y-6">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Type of Leave
            </label>
            <div className="grid grid-cols-4 gap-2">
              {timeOffTypes.map((type) => {
                const IconComponent = type.icon
                const availableText = type.id === 'vacation' 
                  ? `${availableDays.pto} days` 
                  : type.id === 'sick' 
                    ? `${availableDays.sick} days` 
                    : null
                
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleTypeSelect(type.id)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      selectedType === type.id
                        ? `${type.color} border-current shadow-md`
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="h-7 w-7 mx-auto mb-1.5" strokeWidth={2} />
                    <div className={`text-xs font-semibold ${
                      selectedType === type.id ? '' : 'text-gray-700'
                    }`}>
                      {type.label}
                    </div>
                    {availableText && (
                      <div className={`text-[10px] mt-0.5 font-medium ${
                        selectedType === type.id ? 'opacity-80' : 'text-gray-500'
                      }`}>
                        {availableText}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Dates <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setIsDateModalOpen(true)}
              className={`w-full bg-white rounded-xl p-4 shadow-sm border-2 transition-all hover:border-blue-300 ${
                errors.dates ? 'border-red-500' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-blue-500" />
                <div className="flex-1 text-left">
                  {startDate && endDate ? (
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {formatDate(startDate)} - {formatDate(endDate)}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {totalDays} {totalDays === 1 ? 'day' : 'days'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Select date range
                    </div>
                  )}
                </div>
              </div>
            </button>
            {errors.dates && (
              <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.dates}
              </p>
            )}
          </div>

          {/* Conditional "Other" Reason Field */}
          {selectedType === 'other' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Reason for request <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g., Bereavement, Jury duty, Moving"
                value={otherReason}
                onChange={(e) => {
                  setOtherReason(e.target.value)
                  if (errors.otherReason) {
                    setErrors({ ...errors, otherReason: '' })
                  }
                }}
                className={`h-12 ${errors.otherReason ? 'border-red-500' : ''}`}
                maxLength={50}
              />
              {errors.otherReason && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.otherReason}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {otherReason.length}/50 characters
              </p>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Reason {selectedType !== 'vacation' && <span className="text-red-500">*</span>}
              {selectedType === 'vacation' && <span className="text-gray-500 text-xs font-normal ml-1">(Optional)</span>}
            </label>
            <textarea
              placeholder={selectedType === 'vacation' ? 'e.g., Family vacation (optional)' : 'e.g., Medical appointment, Family emergency'}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                if (errors.reason) {
                  setErrors({ ...errors, reason: '' })
                }
              }}
              className={`w-full h-20 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm ${
                errors.reason ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={100}
            />
            {errors.reason && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.reason}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {reason.length}/100 characters
            </p>
          </div>
        </div>
      </form>

      {/* Fixed Bottom Buttons */}
      <div className="sticky bottom-0 bg-white border-t px-4 py-4 flex items-center gap-3 shadow-lg">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="flex-1 h-12 rounded-full text-base font-semibold border-2"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-full disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </span>
          ) : (
            'Submit Request'
          )}
        </Button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-[60] animate-in fade-in duration-200"
            onClick={() => setShowConfirmModal(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center">
                  <span className="text-4xl">💡</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-semibold text-center mb-4">
                What happens next?
              </h2>

              {/* Message */}
              <p className="text-base text-gray-700 text-center mb-6 leading-relaxed">
                Your manager will review your request and approve or decline it. 
                You'll receive a notification once they've made a decision. 
                You'll remain scheduled for all shifts until your request is approved.
              </p>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowConfirmModal(false)}
                  variant="outline"
                  className="flex-1 h-12 rounded-full text-base font-semibold border-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmSubmit}
                  className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-full"
                >
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Date Range Modal */}
      <DateRangeModal
        isVisible={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        onApply={handleDateRangeApply}
        initialRange={startDate && endDate ? { start: startDate, end: endDate } : null}
      />
    </div>
  )
}

export default function RequestTimeOffPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <RequestTimeOffContent />
    </Suspense>
  )
}

