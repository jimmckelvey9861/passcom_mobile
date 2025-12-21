"use client"

import { X, ChevronRight } from "lucide-react"

interface ViewTasksSheetProps {
  isVisible: boolean
  onClose: () => void
  currentViewMode: "list" | "calendar"
  onChangeViewMode: (mode: "list" | "calendar") => void
  activeSortCategory: string
  onSelectSortCategory: (category: string) => void
  onOpenDateSort: () => void
  onOpenStatusFilter: () => void
  onOpenLabelFilter: () => void
}

export default function ViewTasksSheet({
  isVisible,
  onClose,
  currentViewMode,
  onChangeViewMode,
  activeSortCategory,
  onSelectSortCategory,
  onOpenDateSort,
  onOpenStatusFilter,
  onOpenLabelFilter,
}: ViewTasksSheetProps) {
  if (!isVisible) return null

  const sortMenuItems = [
    { id: 1, label: "Date" },
    { id: 2, label: "Status" },
    { id: 3, label: "Label" },
    { id: 4, label: "Creator" },
    { id: 5, label: "Teammate" },
  ]

  const handleSortItemClick = (label: string) => {
    if (label === "Date") {
      onOpenDateSort()
    } else if (label === "Status") {
      onOpenStatusFilter()
    } else if (label === "Label") {
      onOpenLabelFilter()
    } else {
      onSelectSortCategory(label)
      onClose()
    }
  }

  const isSortingDisabled = currentViewMode === "calendar"

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[75vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <h2 className="text-lg font-bold text-gray-900 flex-1 text-center">View Tasks</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* View Mode Section */}
        <div className="py-4 border-b">
          <button
            onClick={() => onChangeViewMode("calendar")}
            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors min-h-[60px]"
          >
            <svg className="h-6 w-6 text-gray-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
              <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
              <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
              <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
            </svg>
            <span className="text-base text-gray-900 flex-1 text-left">Calendar View</span>
            <div
              className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                currentViewMode === "calendar" ? "border-blue-500" : "border-gray-300"
              }`}
            >
              {currentViewMode === "calendar" && <div className="h-3 w-3 rounded-full bg-blue-500" />}
            </div>
          </button>

          <button
            onClick={() => onChangeViewMode("list")}
            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors min-h-[60px]"
          >
            <svg className="h-6 w-6 text-gray-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <line x1="8" y1="6" x2="21" y2="6" strokeWidth="2" />
              <line x1="8" y1="12" x2="21" y2="12" strokeWidth="2" />
              <line x1="8" y1="18" x2="21" y2="18" strokeWidth="2" />
              <line x1="3" y1="6" x2="3.01" y2="6" strokeWidth="2" />
              <line x1="3" y1="12" x2="3.01" y2="12" strokeWidth="2" />
              <line x1="3" y1="18" x2="3.01" y2="18" strokeWidth="2" />
            </svg>
            <span className="text-base text-gray-900 flex-1 text-left">List View</span>
            <div
              className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                currentViewMode === "list" ? "border-blue-500" : "border-gray-300"
              }`}
            >
              {currentViewMode === "list" && <div className="h-3 w-3 rounded-full bg-blue-500" />}
            </div>
          </button>
        </div>

        {/* Sort List By Section */}
        <div className={`flex-1 overflow-y-auto ${isSortingDisabled ? "opacity-50" : ""}`}>
          <div className="px-6 py-3">
            <h3 className="text-xs font-semibold text-gray-500 tracking-wider">SORT LIST BY</h3>
          </div>
          <div className="py-2">
            {sortMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => !isSortingDisabled && handleSortItemClick(item.label)}
                disabled={isSortingDisabled}
                className={`w-full flex items-center justify-between px-6 py-4 transition-colors min-h-[60px] ${
                  isSortingDisabled ? "cursor-not-allowed" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  {activeSortCategory === item.label && currentViewMode === "list" ? (
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-500 shrink-0" />
                  ) : (
                    <div className="h-2.5 w-2.5 shrink-0" />
                  )}
                  <span
                    className={`text-base ${
                      activeSortCategory === item.label && currentViewMode === "list"
                        ? "font-bold text-blue-500"
                        : "text-gray-900"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

