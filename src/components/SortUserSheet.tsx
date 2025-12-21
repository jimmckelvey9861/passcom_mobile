"use client"

import { useState, useEffect } from "react"
import { X, ChevronLeft, Search as SearchIcon, UserX, Check } from "lucide-react"

interface User {
  id: string
  name: string
  initials: string
  avatarUrl?: string | null
  color: string
}

interface SortUserSheetProps {
  isVisible: boolean
  onClose: () => void
  onBack: () => void
  title: string
  users: User[]
  activeUserIds: string[]
  onApplyFilters: (selectedIds: string[]) => void
  currentUserId: string
}

export default function SortUserSheet({
  isVisible,
  onClose,
  onBack,
  title,
  users,
  activeUserIds,
  onApplyFilters,
  currentUserId,
}: SortUserSheetProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [tempSelected, setTempSelected] = useState<string[]>(activeUserIds)

  // Sync tempSelected with activeUserIds when modal opens
  useEffect(() => {
    if (isVisible) {
      setTempSelected(activeUserIds)
      setSearchQuery("") // Reset search when opening
    }
  }, [isVisible, activeUserIds])

  if (!isVisible) return null

  // Filter users based on search query
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleUserToggle = (userId: string) => {
    setTempSelected((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
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
        className="fixed inset-0 bg-black/40 z-[60] animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-[70] bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <button
            onClick={onBack}
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 flex-1 text-center">{title}</h2>
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
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto py-2">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user, index) => (
              <div key={user.id}>
                <button
                  onClick={() => handleUserToggle(user.id)}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors min-h-[60px]"
                >
                  {/* Avatar */}
                  <div
                    className={`h-10 w-10 rounded-full ${user.color} flex items-center justify-center shrink-0 ${
                      user.id === "unassigned" ? "border-2 border-dashed border-gray-300" : ""
                    }`}
                  >
                    {user.id === "unassigned" ? (
                      <UserX className="h-5 w-5 text-gray-400" />
                    ) : user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-sm font-medium text-gray-700">{user.initials}</span>
                    )}
                  </div>

                  {/* Name */}
                  <span
                    className={`flex-1 text-left text-base ${
                      tempSelected.includes(user.id) ? "font-bold text-gray-900" : "text-gray-900"
                    }`}
                  >
                    {user.name}
                  </span>

                  {/* Checkbox */}
                  <div
                    className={`h-6 w-6 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                      tempSelected.includes(user.id) ? "bg-blue-500 border-blue-500" : "border-gray-300 bg-white"
                    }`}
                  >
                    {tempSelected.includes(user.id) && (
                      <Check className="h-4 w-4 text-white" strokeWidth={3} />
                    )}
                  </div>
                </button>
                {index < filteredUsers.length - 1 && <div className="h-px bg-gray-100 mx-6" />}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <p className="text-gray-400 text-base">No people found</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t shrink-0">
          <button
            onClick={handleApply}
            className={`w-full h-14 rounded-full font-semibold text-base transition-colors ${
              tempSelected.length > 0
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Apply Filter {tempSelected.length > 0 && `(${tempSelected.length})`}
          </button>
        </div>
      </div>
    </>
  )
}

