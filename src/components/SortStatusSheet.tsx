"use client"

import { useState, useEffect } from "react"
import { X, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SortStatusSheetProps {
  isVisible: boolean
  onClose: () => void
  onBack: () => void
  activeFilters: string[]
  onApplyFilters: (selectedStatuses: string[]) => void
  counts?: Record<string, number>
}

export default function SortStatusSheet({
  isVisible,
  onClose,
  onBack,
  activeFilters,
  onApplyFilters,
  counts = {},
}: SortStatusSheetProps) {
  const [tempSelected, setTempSelected] = useState<string[]>(activeFilters)

  // Sync tempSelected with activeFilters when modal opens
  useEffect(() => {
    if (isVisible) {
      setTempSelected(activeFilters)
    }
  }, [isVisible, activeFilters])

  if (!isVisible) return null

  const statusOptions = [
    { id: "late", label: "Late", color: "text-red-600" },
    { id: "new", label: "New", color: "text-gray-900" },
    { id: "to do", label: "Open", color: "text-gray-900" },
    { id: "done", label: "Done", color: "text-gray-900" },
  ]

  const handleStatusToggle = (statusId: string) => {
    setTempSelected((prev) =>
      prev.includes(statusId) ? prev.filter((id) => id !== statusId) : [...prev, statusId]
    )
  }

  const handleClear = () => {
    setTempSelected([])
  }

  const handleApply = () => {
    onApplyFilters(tempSelected)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[60] animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-[70] bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[75vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <button
            onClick={onBack}
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 flex-1 text-center">Filter by Status</h2>
          <button
            onClick={handleClear}
            className="text-blue-500 font-medium text-sm px-2 py-1 hover:bg-blue-50 rounded transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Status List */}
        <div className="flex-1 overflow-y-auto py-2">
          {statusOptions.map((status, index) => (
            <div key={status.id}>
              <button
                onClick={() => handleStatusToggle(status.id)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors min-h-[60px]"
              >
                <span
                  className={`text-base ${status.color} ${tempSelected.includes(status.id) ? "font-bold" : "font-normal"}`}
                >
                  {status.label} {counts[status.id] !== undefined && `(${counts[status.id]})`}
                </span>
                <div className="flex items-center">
                  <div
                    className={`h-6 w-6 rounded border-2 flex items-center justify-center transition-colors ${
                      tempSelected.includes(status.id)
                        ? status.id === "late"
                          ? "bg-red-500 border-red-500"
                          : "bg-blue-500 border-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {tempSelected.includes(status.id) && (
                      <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <polyline
                          points="20 6 9 17 4 12"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
              {index < statusOptions.length - 1 && <div className="h-px bg-gray-100 mx-6" />}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t shrink-0">
          <Button
            onClick={handleApply}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white h-14 rounded-lg text-base font-semibold"
          >
            Apply Filter {tempSelected.length > 0 && `(${tempSelected.length})`}
          </Button>
        </div>
      </div>
    </>
  )
}

