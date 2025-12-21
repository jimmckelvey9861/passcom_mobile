"use client"

import { X, ChevronRight } from "lucide-react"

interface SortMenuSheetProps {
  isVisible: boolean
  onClose: () => void
  activeCategory: string
  onSelectCategory: (category: string) => void
}

export default function SortMenuSheet({
  isVisible,
  onClose,
  activeCategory,
  onSelectCategory,
}: SortMenuSheetProps) {
  const sortMenuItems = [
    { id: 1, label: "Date" },
    { id: 2, label: "Status" },
    { id: 3, label: "Label" },
    { id: 4, label: "Creator" },
    { id: 5, label: "Teammate" },
  ]

  const handleItemClick = (label: string) => {
    onSelectCategory(label)
    onClose()
  }

  if (!isVisible) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[60vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-900 flex-1 text-center">Sort Tasks by</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(60vh-64px)]">
          {sortMenuItems.map((item) => {
            const isSelected = activeCategory === item.label
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.label)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors min-h-[60px] border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 flex items-center justify-center">
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                  </div>
                  <span
                    className={`text-base ${isSelected ? "font-bold text-blue-500" : "font-medium text-gray-900"}`}
                  >
                    {item.label}
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}

