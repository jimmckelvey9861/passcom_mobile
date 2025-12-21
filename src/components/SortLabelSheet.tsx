"use client"

import { useState, useEffect } from "react"
import { X, ChevronLeft, Search as SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Label {
  id: string
  name: string
  color: string
}

interface SortLabelSheetProps {
  isVisible: boolean
  onClose: () => void
  onBack: () => void
  availableLabels: Label[]
  activeLabelIds: string[]
  onApplyFilters: (selectedLabelIds: string[]) => void
}

export default function SortLabelSheet({
  isVisible,
  onClose,
  onBack,
  availableLabels,
  activeLabelIds,
  onApplyFilters,
}: SortLabelSheetProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [tempSelected, setTempSelected] = useState<string[]>(activeLabelIds)

  // Sync tempSelected with activeLabelIds when modal opens
  useEffect(() => {
    if (isVisible) {
      setTempSelected(activeLabelIds)
      setSearchQuery("") // Reset search when opening
    }
  }, [isVisible, activeLabelIds])

  if (!isVisible) return null

  // Filter labels based on search query
  const filteredLabels = availableLabels.filter((label) =>
    label.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleLabelToggle = (labelId: string) => {
    setTempSelected((prev) =>
      prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]
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
          <h2 className="text-lg font-bold text-gray-900 flex-1 text-center">Filter by Label</h2>
          <button
            onClick={handleClear}
            className="text-blue-500 font-medium text-sm px-2 py-1 hover:bg-blue-50 rounded transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 pt-4 pb-2 shrink-0">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search labels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Label List */}
        <div className="flex-1 overflow-y-auto py-2">
          {filteredLabels.length > 0 ? (
            filteredLabels.map((label, index) => (
              <div key={label.id}>
                <button
                  onClick={() => handleLabelToggle(label.id)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors min-h-[60px]"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-5 w-5 rounded-full shrink-0" 
                      style={{ backgroundColor: label.color }}
                    />
                    <span
                      className={`text-base text-gray-900 ${tempSelected.includes(label.id) ? "font-bold" : "font-normal"}`}
                    >
                      {label.name}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div
                      className={`h-6 w-6 rounded border-2 flex items-center justify-center transition-colors ${
                        tempSelected.includes(label.id) ? "bg-blue-500 border-blue-500" : "border-gray-300"
                      }`}
                    >
                      {tempSelected.includes(label.id) && (
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
                {index < filteredLabels.length - 1 && <div className="h-px bg-gray-100 mx-6" />}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <p className="text-gray-400 text-base">No labels found</p>
            </div>
          )}
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

