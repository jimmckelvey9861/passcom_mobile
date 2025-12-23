"use client"

import { useState } from "react"
import { Pencil, Trash2, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AVAILABLE_TAGS } from "@/data/tags"

interface Tag {
  id: string
  label: string
  color: string
}

const PRESET_COLORS = [
  { name: "Slate", value: "bg-slate-200 text-slate-800" },
  { name: "Red", value: "bg-red-200 text-red-800" },
  { name: "Orange", value: "bg-orange-200 text-orange-800" },
  { name: "Amber", value: "bg-amber-200 text-amber-800" },
  { name: "Yellow", value: "bg-yellow-200 text-yellow-800" },
  { name: "Lime", value: "bg-lime-200 text-lime-800" },
  { name: "Green", value: "bg-green-200 text-green-800" },
  { name: "Emerald", value: "bg-emerald-200 text-emerald-800" },
  { name: "Teal", value: "bg-teal-200 text-teal-800" },
  { name: "Cyan", value: "bg-cyan-200 text-cyan-800" },
  { name: "Sky", value: "bg-sky-200 text-sky-800" },
  { name: "Blue", value: "bg-blue-200 text-blue-800" },
  { name: "Indigo", value: "bg-indigo-200 text-indigo-800" },
  { name: "Violet", value: "bg-violet-200 text-violet-800" },
  { name: "Purple", value: "bg-purple-200 text-purple-800" },
  { name: "Fuchsia", value: "bg-fuchsia-200 text-fuchsia-800" },
  { name: "Pink", value: "bg-pink-200 text-pink-800" },
  { name: "Rose", value: "bg-rose-200 text-rose-800" },
]

interface TagSelectionSheetProps {
  isOpen: boolean
  onClose: () => void
  selectedTagIds: string[]
  onTagsChange: (ids: string[]) => void
}

export default function TagSelectionSheet({ isOpen, onClose, selectedTagIds, onTagsChange }: TagSelectionSheetProps) {
  // Initialize tags from AVAILABLE_TAGS
  const [tags, setTags] = useState<Tag[]>(AVAILABLE_TAGS)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [tagName, setTagName] = useState("")
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].value)
  const [searchQuery, setSearchQuery] = useState("")
  const [isEditMode, setIsEditMode] = useState(false)
  // Initialize selected tags from prop
  const [selectedTags, setSelectedTags] = useState<string[]>(selectedTagIds)

  if (!isOpen) return null

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag)
    setTagName(tag.label)
    setSelectedColor(tag.color)
    setIsPopoverOpen(true)
  }

  const handleDelete = (id: string) => {
    setTags(tags.filter((tag) => tag.id !== id))
    setSelectedTags(selectedTags.filter(tagId => tagId !== id))
  }

  const handleSave = () => {
    if (!tagName.trim()) return

    if (editingTag) {
      setTags(tags.map((tag) => (tag.id === editingTag.id ? { ...tag, label: tagName, color: selectedColor } : tag)))
    } else {
      const newTag: Tag = {
        id: Date.now().toString(),
        label: tagName,
        color: selectedColor,
      }
      setTags([...tags, newTag])
    }

    setIsPopoverOpen(false)
    setEditingTag(null)
    setTagName("")
    setSelectedColor(PRESET_COLORS[0].value)
  }

  const handleCancel = () => {
    setIsPopoverOpen(false)
    setEditingTag(null)
    setTagName("")
    setSelectedColor(PRESET_COLORS[0].value)
  }

  const toggleTagSelection = (id: string) => {
    if (selectedTags.includes(id)) {
      setSelectedTags(selectedTags.filter((tagId) => tagId !== id))
    } else {
      setSelectedTags([...selectedTags, id])
    }
  }

  const handleSelect = () => {
    onTagsChange(selectedTags)
    onClose()
  }

  const filteredTags = tags.filter((tag) => tag.label.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />}
      <div
        className={`fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl z-50 flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "80vh" }}
      >
        {/* Search Bar with Edit Mode Toggle */}
        <div className="p-4 pb-3 border-b">
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="flex-1 flex items-center gap-3 bg-gray-100 rounded-full px-4 h-[50px]">
              <Search className="h-5 w-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="flex-1 border-0 px-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400"
              />
            </div>
            {/* Edit Mode Toggle Button - Grey Circle */}
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className="h-[50px] w-[50px] rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
            >
              <Pencil className="h-5 w-5 text-gray-700" />
            </button>
            {/* Add New Tag Button - Blue Circle */}
            <button
              onClick={() => {
                setEditingTag(null)
                setTagName("")
                setSelectedColor(PRESET_COLORS[0].value)
                setIsPopoverOpen(true)
              }}
              className="h-[50px] w-[50px] rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-colors"
            >
              <X className="h-6 w-6 text-white rotate-45" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredTags.map((tag) => (
            <div
              key={tag.id}
              onClick={() => !isEditMode && toggleTagSelection(tag.id)}
              className={`flex items-center justify-between border-b last:border-b-0 px-4 py-3 hover:bg-gray-50 ${
                !isEditMode ? "cursor-pointer" : ""
              }`}
            >
              {/* Left: Colored Tag Pill */}
              <div className="flex items-center gap-3 flex-1">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${tag.color}`}>{tag.label}</div>
              </div>

              {/* Right: Edit/Delete Icons or Checkbox */}
              <div className="flex items-center gap-2">
                {isEditMode ? (
                  <>
                    <Button
                      onClick={() => handleEdit(tag)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(tag.id)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-600 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <div
                    className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all pointer-events-none ${
                      selectedTags.includes(tag.id) ? "bg-blue-500 border-blue-500" : "border-gray-300"
                    }`}
                  >
                    {selectedTags.includes(tag.id) && (
                      <svg
                        className="h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 bg-white border-t px-4 py-4 flex items-center gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 h-11 text-base font-medium rounded-full bg-transparent"
          >
            Close
          </Button>
          <Button
            onClick={handleSelect}
            className="flex-1 h-11 bg-blue-500 hover:bg-blue-600 text-white text-base font-medium rounded-full"
          >
            Select
          </Button>
        </div>
      </div>

      {/* Edit/Create Popover */}
      {isPopoverOpen && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/50 z-[60]" onClick={handleCancel} />

          {/* Popover Dialog */}
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl z-[70] max-w-md mx-auto">
            {/* Popover Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="text-lg font-semibold">{editingTag ? "Edit Tag" : "Create New Tag"}</h2>
              <Button onClick={handleCancel} variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Popover Content */}
            <div className="p-5 space-y-5">
              {/* Tag Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tag Name</label>
                <Input
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  placeholder="Enter tag name"
                  className="w-full"
                />
              </div>

              {/* Color Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Background Color</label>
                <div className="grid grid-cols-6 gap-3">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      className={`h-10 w-10 rounded-full ${color.value.split(" ")[0]} transition-all ${
                        selectedColor === color.value ? "ring-4 ring-blue-500 ring-offset-2" : "hover:scale-110"
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Live Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                <div className="flex items-center justify-center py-4 bg-gray-50 rounded-lg">
                  <div className={`px-4 py-1.5 rounded-full text-sm font-medium ${selectedColor}`}>
                    {tagName || "Tag Preview"}
                  </div>
                </div>
              </div>
            </div>

            {/* Popover Footer */}
            <div className="flex items-center gap-3 px-5 py-4 border-t bg-gray-50 rounded-b-2xl">
              <Button onClick={handleCancel} variant="outline" className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!tagName.trim()}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Tag
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
