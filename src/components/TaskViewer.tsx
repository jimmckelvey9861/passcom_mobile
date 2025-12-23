"use client"

import { useState, useRef } from "react"
import { ChevronLeft, MoreVertical, Copy, Edit, Trash2, Clock, AlertCircle, User, Tag, MapPin, CheckCircle, Check, Camera, X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DUMMY_USERS } from "@/data/dummyTasks"
import { AVAILABLE_TAGS } from "@/data/tags"

// Helper function to format date
function formatTaskDate(dateString: string | Date): string {
  const date = new Date(dateString)
  const month = date.toLocaleString('en-US', { month: 'short' })
  const day = date.getDate()
  const time = date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  return `${month} ${day} ${time}`
}

interface ChecklistItem {
  id: string
  text: string
  isChecked: boolean
}

interface Task {
  id?: string
  title: string
  description?: string
  images?: string[]
  attachments?: string[]
  startTime?: string
  dueTime?: string
  assigneeId?: string
  assignedTo?: {
    name: string
    avatar: string
    color: string
  }
  tags?: string[]
  location?: string
  checklist?: ChecklistItem[]
  requirePhoto?: boolean
  proofPhoto?: string
  createdBy?: {
    name: string
    avatar: string
    color: string
    date: string
  }
}

interface TaskViewerProps {
  task: Task
  onClose: () => void
  onEdit: (task: Task) => void
  onCopy: (task: Task) => void
  onDelete: (taskId: string) => void
}

export function TaskViewer({ task, onClose, onEdit, onCopy, onDelete }: TaskViewerProps) {
  const [showReminderSheet, setShowReminderSheet] = useState(false)
  const [checklist, setChecklist] = useState<ChecklistItem[]>(task.checklist || [])
  const [proofPhoto, setProofPhoto] = useState<string | null>(task.proofPhoto || null)
  const [isProofMenuOpen, setIsProofMenuOpen] = useState(false)
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Helper to get user details from assigneeId
  const getAssignedUser = () => {
    if (task.assignedTo) return task.assignedTo // Use existing object if available
    if (!task.assigneeId) return null
    const user = DUMMY_USERS.find(u => u.id === task.assigneeId)
    if (!user || user.id === 'unassigned') return null
    return {
      name: user.name,
      avatar: user.initials,
      color: 'bg-orange-400'
    }
  }
  
  const assignedUser = getAssignedUser()

  // Toggle checklist item
  const toggleChecklistItem = (itemId: string) => {
    setChecklist(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
      )
    )
  }

  // Check if all checklist items are complete
  const isChecklistComplete = () => {
    if (!checklist || checklist.length === 0) return true // No checklist = can mark done
    return checklist.every(item => item.isChecked)
  }

  // Handle proof photo upload
  const handleProofPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const photoUrl = URL.createObjectURL(file)
      setProofPhoto(photoUrl)
      setIsProofMenuOpen(false)
      // TODO: In production, upload to server and get permanent URL
    }
  }

  // Check if photo proof requirement is met
  const isPhotoProofComplete = () => {
    if (!task.requirePhoto) return true // No photo required = always ok
    return proofPhoto !== null
  }

  // Check if task can be marked as done
  const canMarkAsDone = () => {
    return isChecklistComplete() && isPhotoProofComplete()
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-white flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-4 py-4 flex items-center gap-4 z-10">
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault()
              onClose()
            }}
            className="h-auto p-3 shrink-0 flex items-center justify-center -ml-3"
          >
            <ChevronLeft className="h-6 w-6 text-gray-900" strokeWidth={2.5} />
          </button>
          <h1 className="text-lg font-semibold flex-1 text-center">Task details</h1>
          <div className="relative">
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault()
                setIsActionsMenuOpen(!isActionsMenuOpen)
              }}
              className="h-auto p-3 shrink-0 flex items-center justify-center -mr-3"
            >
              <MoreVertical className="h-6 w-6 text-gray-600" />
            </button>

            {/* Actions Menu Dropdown */}
            {isActionsMenuOpen && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsActionsMenuOpen(false)}
                />
                
                {/* Menu */}
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 z-50">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      onCopy(task)
                      setIsActionsMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer text-left border-b"
                  >
                    <Copy className="h-5 w-5 text-gray-600" />
                    <span className="text-base text-gray-900">Copy Task</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      onEdit(task)
                      setIsActionsMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer text-left border-b"
                  >
                    <Edit className="h-5 w-5 text-gray-600" />
                    <span className="text-base text-gray-900">Edit Task</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      if (task.id) {
                        onDelete(task.id)
                        setIsActionsMenuOpen(false)
                        onClose()
                      }
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer text-left border-b"
                  >
                    <Trash2 className="h-5 w-5 text-red-600" />
                    <span className="text-base text-red-600">Delete Task</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      setIsActionsMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer text-left"
                  >
                    <X className="h-5 w-5 text-gray-600" />
                    <span className="text-base text-gray-900">Cancel</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-auto px-6 py-6">
          {/* Title */}
          <h2 className="text-3xl font-bold text-blue-500 mb-2">{task.title}</h2>

          {/* Description */}
          {task.description && (
            <p className="text-base text-gray-700 mb-4 leading-relaxed">{task.description}</p>
          )}

          {/* Media */}
          {((task.images && task.images.length > 0) || (task.attachments && task.attachments.length > 0)) && (
            <div className="mb-6">
              <img
                src={task.images?.[0] || task.attachments?.[0]}
                alt="Task attachment"
                className="w-32 h-32 object-cover rounded-lg border border-gray-200"
              />
            </div>
          )}

          {/* Meta Rows - Only render if data exists */}
          <div className="space-y-0">
            {/* Start time */}
            {task.startTime && (
              <div className="flex items-center gap-3 py-4 border-b">
                <Clock className="h-5 w-5 text-blue-400" />
                <span className="font-bold text-gray-900 flex-1">Start time</span>
                <span className="text-gray-700">{formatTaskDate(task.startTime)}</span>
              </div>
            )}

            {/* Due date */}
            {task.dueTime && (
              <div className="flex items-center gap-3 py-4 border-b">
                <AlertCircle className="h-5 w-5 text-blue-400" />
                <span className="font-bold text-gray-900 flex-1">Due date</span>
                <span className="text-gray-700">{formatTaskDate(task.dueTime)}</span>
              </div>
            )}

            {/* Assigned to */}
            {assignedUser && (
              <div className="flex items-center gap-3 py-4 border-b">
                <User className="h-5 w-5 text-blue-400" />
                <span className="font-bold text-gray-900 flex-1">Assigned to</span>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-7 w-7 rounded-full ${assignedUser.color} flex items-center justify-center text-white text-xs font-semibold`}
                  >
                    {assignedUser.avatar}
                  </div>
                  <span className="text-gray-700">{assignedUser.name}</span>
                </div>
              </div>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center gap-3 py-4 border-b">
                <Tag className="h-5 w-5 text-blue-400" />
                <span className="font-bold text-gray-900 flex-1">Tags</span>
                <div className="flex gap-2 flex-wrap">
                  {task.tags.map((tagId, index) => {
                    const tag = AVAILABLE_TAGS.find(t => t.id === tagId)
                    return tag ? (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${tag.color}`}
                      >
                        {tag.label}
                      </span>
                    ) : null
                  })}
                </div>
              </div>
            )}

            {/* Location */}
            {task.location && (
              <div className="flex items-center gap-3 py-4 border-b">
                <MapPin className="h-5 w-5 text-blue-400" />
                <span className="font-bold text-gray-900 flex-1">Location</span>
                <span className="text-blue-500 text-sm truncate max-w-[200px]">{task.location}</span>
              </div>
            )}

            {/* Checklist */}
            {checklist && checklist.length > 0 && (
              <div className="py-4 border-b">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="h-5 w-5 text-blue-400" />
                  <span className="font-bold text-gray-900">Checklist</span>
                  <span className={`text-sm font-medium ${
                    isChecklistComplete() ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {checklist.filter(item => item.isChecked).length} / {checklist.length}
                    {isChecklistComplete() && ' ✓'}
                  </span>
                </div>
                <div className="space-y-2 ml-8">
                  {checklist.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 -ml-2 pl-2 pr-2 py-1 rounded transition-colors"
                      onClick={() => toggleChecklistItem(item.id)}
                    >
                      <div className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all ${
                        item.isChecked 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'border-gray-300 hover:border-blue-400'
                      }`}>
                        {item.isChecked && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className={`transition-all ${item.isChecked ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Proof of Completion Section */}
          {task.requirePhoto && (
            <div className="mt-6 mb-4 px-6 py-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Camera className="h-5 w-5 text-amber-600" />
                    <span className="font-bold text-gray-900">Proof of Completion</span>
                    <span className="text-xs px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full font-medium">
                      Required
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Upload a photo to complete this task</p>
                </div>

                {proofPhoto ? (
                  <div className="relative">
                    <img
                      src={proofPhoto}
                      alt="Proof of completion"
                      className="h-24 w-24 object-cover rounded-lg border-2 border-amber-300"
                    />
                    <button
                      onClick={() => setProofPhoto(null)}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => setIsProofMenuOpen(!isProofMenuOpen)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm flex items-center gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      Take Photo
                    </button>

                    {/* Photo Upload Menu */}
                    {isProofMenuOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setIsProofMenuOpen(false)}
                        />
                        <div className="absolute right-0 top-12 z-20 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-48">
                          <button
                            onClick={() => {
                              cameraInputRef.current?.click()
                              setIsProofMenuOpen(false)
                            }}
                            className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-left"
                          >
                            <Camera className="h-5 w-5 text-blue-500" />
                            <span className="text-base">Camera</span>
                          </button>
                          <button
                            onClick={() => {
                              fileInputRef.current?.click()
                              setIsProofMenuOpen(false)
                            }}
                            className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-left"
                          >
                            <FileText className="h-5 w-5 text-blue-500" />
                            <span className="text-base">Choose File</span>
                          </button>
                        </div>
                      </>
                    )}

                    {/* Hidden file inputs */}
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleProofPhotoSelect}
                      className="hidden"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProofPhotoSelect}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white px-6 py-6 border-t">
          {/* Action Buttons */}
          <div className="flex gap-3 mb-4">
            <Button
              onClick={() => setShowReminderSheet(true)}
              className="flex-1 h-12 bg-purple-500 hover:bg-purple-600 text-white text-base font-medium rounded-full"
            >
              Send reminder
            </Button>
            <Button 
              disabled={!canMarkAsDone()}
              className={`flex-1 h-12 text-white text-base font-medium rounded-full flex items-center justify-center gap-2 transition-all ${
                canMarkAsDone() 
                  ? 'bg-teal-400 hover:bg-teal-500' 
                  : 'bg-gray-300 cursor-not-allowed opacity-60'
              }`}
              onClick={() => {
                if (!canMarkAsDone()) {
                  if (!isPhotoProofComplete()) {
                    alert("You must upload a photo to complete this task.")
                  } else if (!isChecklistComplete()) {
                    alert("Please complete all checklist items first.")
                  }
                }
              }}
            >
              <CheckCircle className="h-5 w-5" />
              Mark as done
              {!canMarkAsDone() && (
                <span className="text-xs ml-1">
                  {!isPhotoProofComplete() ? '(Photo required)' : '(Complete checklist)'}
                </span>
              )}
            </Button>
          </div>

          {/* Created by */}
          {task.createdBy && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <span>Created by</span>
              <div
                className={`h-5 w-5 rounded-full ${task.createdBy.color} flex items-center justify-center text-white text-xs font-semibold`}
              >
                {task.createdBy.avatar}
              </div>
              <span>{task.createdBy.name}</span>
              <span>At {task.createdBy.date}</span>
            </div>
          )}
        </div>
      </div>

      {/* Reminder Sheet Modal */}
      {showReminderSheet && <ReminderSheet onClose={() => setShowReminderSheet(false)} />}
    </>
  )
}

function ReminderSheet({ onClose }: { onClose: () => void }) {
  const [reminders, setReminders] = useState([
    { id: 1, name: "Pete Seager", avatar: "PS", color: "bg-orange-400", sent: false },
    { id: 2, name: "Sarah Johnson", avatar: "SJ", color: "bg-blue-400", sent: false },
    { id: 3, name: "Mike Chen", avatar: "MC", color: "bg-green-400", sent: false },
    { id: 4, name: "Emma Davis", avatar: "ED", color: "bg-purple-400", sent: false },
  ])

  const handleRemindOne = (id: number) => {
    setReminders(reminders.map((r) => (r.id === id ? { ...r, sent: true } : r)))
  }

  const handleRemindEveryone = () => {
    setReminders(reminders.map((r) => ({ ...r, sent: true })))
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b">
          <h2 className="text-xl font-semibold text-center">Send reminder</h2>
        </div>

        {/* Assignee List - Scrollable */}
        <div className="flex-1 overflow-auto px-6 py-4">
          <div className="space-y-3">
            {reminders.map((person) => (
              <div key={person.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-full ${person.color} flex items-center justify-center text-white text-sm font-semibold`}
                  >
                    {person.avatar}
                  </div>
                  <span className="text-base font-medium text-gray-900">{person.name}</span>
                </div>

                {person.sent ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    <CheckCircle className="h-4 w-4" />
                    Sent
                  </div>
                ) : (
                  <Button
                    onClick={() => handleRemindOne(person.id)}
                    className="px-4 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-full text-sm font-medium h-auto"
                  >
                    Remind
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 h-12 bg-white border-gray-300 text-gray-700 rounded-full text-base font-medium"
          >
            Cancel
          </Button>
          <Button
            onClick={handleRemindEveryone}
            className="flex-[2] h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full text-base font-medium"
          >
            Remind everyone
          </Button>
        </div>
      </div>
    </>
  )
}

