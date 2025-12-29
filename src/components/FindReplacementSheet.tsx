"use client"

import { useState } from "react"
import { X, Search, ArrowLeftRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface User {
  id: string
  name: string
  initials: string
  avatarColor: string
  photoUrl?: string
}

interface FindReplacementSheetProps {
  isOpen: boolean
  onClose: () => void
  onSendRequest: (selectedUserIds: string[]) => void
  currentShiftId: string
  availableUsers: User[]
}

export default function FindReplacementSheet({
  isOpen,
  onClose,
  onSendRequest,
  currentShiftId,
  availableUsers,
}: FindReplacementSheetProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

  if (!isOpen) return null

  // Filter users based on search
  const filteredUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Toggle user selection
  const toggleUser = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  // Select all users
  const selectAll = () => {
    setSelectedUserIds(filteredUsers.map(u => u.id))
  }

  // Deselect all users
  const deselectAll = () => {
    setSelectedUserIds([])
  }

  // Handle send request
  const handleSend = () => {
    if (selectedUserIds.length > 0) {
      onSendRequest(selectedUserIds)
      setSelectedUserIds([])
      setSearchQuery("")
      // Parent component will handle closing and showing confirmation
    }
  }

  // Handle cancel
  const handleCancel = () => {
    setSelectedUserIds([])
    setSearchQuery("")
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
        onClick={handleCancel}
      />

      {/* Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center">
              <ArrowLeftRight className="h-8 w-8 text-teal-500" />
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-center mb-2">
            Find replacement
          </h2>
          <p className="text-base text-gray-700 text-center mb-1">
            Select a user to replace you in this shift
          </p>
          <p className="text-sm text-gray-500 text-center">
            Replacement requires admin approval
          </p>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-gray-100 border-0 rounded-lg"
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-4">
            {/* Header with count */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">
                Available teammates ({filteredUsers.length})
              </span>
              {selectedUserIds.length > 0 ? (
                <button
                  onClick={deselectAll}
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  Deselect all
                </button>
              ) : (
                <button
                  onClick={selectAll}
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  Select all
                </button>
              )}
            </div>

            {/* User List */}
            <div className="space-y-3">
              {filteredUsers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No teammates found
                </p>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selectedUserIds.includes(user.id)
                  
                  return (
                    <button
                      key={user.id}
                      onClick={() => toggleUser(user.id)}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        {user.photoUrl ? (
                          <img
                            src={user.photoUrl}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                            style={{ backgroundColor: user.avatarColor }}
                          >
                            {user.initials}
                          </div>
                        )}
                        
                        {/* Name */}
                        <span className="text-base font-medium text-gray-900">
                          {user.name}
                        </span>
                      </div>

                      {/* Checkbox */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-blue-600'
                            : 'border-2 border-gray-300 bg-white'
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 h-12 rounded-full text-base font-semibold border-2 border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={selectedUserIds.length === 0}
            className="flex-1 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send request
          </Button>
        </div>
      </div>
    </>
  )
}

