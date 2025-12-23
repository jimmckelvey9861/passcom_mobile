"use client"

import { useState } from "react"
import { Search, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AVAILABLE_TAGS, Tag } from "@/data/tags"

interface TagSelectionSheetProps {
  isVisible: boolean
  onClose: () => void
  selectedTagIds: string[]
  onToggleTag: (tagId: string) => void
  onApply?: () => void
  title?: string
}

export default function TagSelectionSheet({
  isVisible,
  onClose,
  selectedTagIds,
  onToggleTag,
  onApply,
  title = "Select Tags"
}: TagSelectionSheetProps) {
  const [searchQuery, setSearchQuery] = useState("")

  if (!isVisible) return null

  // Filter tags based on search
  const filteredTags = AVAILABLE_TAGS.filter(tag =>
    tag.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleApply = () => {
    if (onApply) {
      onApply()
    }
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50" 
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl z-50 max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b">
          <h2 className="text-xl font-bold text-center">{title}</h2>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Tag List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-2">
            {filteredTags.map(tag => (
              <button
                key={tag.id}
                onClick={() => onToggleTag(tag.id)}
                className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Color Dot */}
                  <div className={`w-3 h-3 rounded-full ${tag.color}`} />
                  {/* Label */}
                  <span className="text-base font-medium text-gray-900">{tag.label}</span>
                </div>
                {/* Checkbox */}
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  selectedTagIds.includes(tag.id)
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-gray-300'
                }`}>
                  {selectedTagIds.includes(tag.id) && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {filteredTags.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No tags found
            </div>
          )}
        </div>

        {/* Apply Button */}
        <div className="px-6 py-4 border-t bg-white">
          <Button
            onClick={handleApply}
            className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white text-base font-medium rounded-lg"
          >
            Apply
          </Button>
        </div>
      </div>
    </>
  )
}

