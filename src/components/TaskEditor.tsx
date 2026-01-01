"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Paperclip, X, Check, Camera, FileText, Image, Play, Clock, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { AVAILABLE_TAGS } from "@/data/tags"
import TagSelectionSheet from "@/components/TagSelectionSheet"
import { MediaCropEditor } from "@/components/MediaCropEditor"
import { RecurrenceSheet, Recurrence } from "@/components/RecurrenceSheet"
import { BountyConfigSheet } from "@/components/BountyConfigSheet"

const AVAILABLE_LOCATIONS = [
  { id: "room101", name: "Room 101" },
  { id: "room102", name: "Room 102" },
  { id: "warehouse", name: "Warehouse" },
  { id: "office", name: "Main Office" },
  { id: "remote", name: "Remote" },
]

interface ChecklistItem {
  id: string
  text: string
  isChecked: boolean
}

interface Task {
  id?: string
  title: string
  description?: string
  startTime?: string
  dueTime?: string
  assigneeId?: string
  tags?: string[]
  status?: string
  priority?: string
  creatorId?: string
  completed?: boolean
  requirePhoto?: boolean
  attachments?: string[]
  location?: string
  checklist?: ChecklistItem[]
  recurrence?: Recurrence | null
}

interface TaskEditorProps {
  isVisible: boolean
  onClose: () => void
  onSave: (task: Task) => void
  onDelete?: (taskId: string) => void
  onComplete?: (taskId: string | number) => void
  initialTask?: Task | null
}

export function TaskEditor({ isVisible, onClose, onSave, onDelete, onComplete, initialTask }: TaskEditorProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const filesInputRef = useRef<HTMLInputElement>(null)
  const imagesInputRef = useRef<HTMLInputElement>(null)
  const startTimeInputRef = useRef<HTMLInputElement>(null)
  const dueTimeInputRef = useRef<HTMLInputElement>(null)
  
  const [taskTitle, setTaskTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDateTime, setStartDateTime] = useState("")
  const [dueDateTime, setDueDateTime] = useState("")
  const [isDueTimeExplicitlySet, setIsDueTimeExplicitlySet] = useState(false)
  const [requirePhoto, setRequirePhoto] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [attachmentUrls, setAttachmentUrls] = useState<string[]>([])
  const [originalAttachmentUrls, setOriginalAttachmentUrls] = useState<string[]>([]) // Preserve originals for re-editing
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>("")
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [isAddingChecklistItem, setIsAddingChecklistItem] = useState(false)
  const [newChecklistItem, setNewChecklistItem] = useState("")
  const [isTagSheetOpen, setIsTagSheetOpen] = useState(false)
  const [showLocationSelector, setShowLocationSelector] = useState(false)
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isStartDateOpen, setIsStartDateOpen] = useState(false)
  const [isDueDateOpen, setIsDueDateOpen] = useState(false)
  const [mediaInEditor, setMediaInEditor] = useState<{ url: string; index: number } | null>(null)
  const [recurrence, setRecurrence] = useState<Recurrence | null>(null)
  const [isRecurrenceSheetOpen, setIsRecurrenceSheetOpen] = useState(false)
  const [videoInViewer, setVideoInViewer] = useState<string | null>(null)
  
  // Bounty state
  const [isBillable, setIsBillable] = useState(false)
  const [billableDurationMinutes, setBillableDurationMinutes] = useState(15)
  const [billableRate, setBillableRate] = useState(5.00)
  const [bountyAutoApprove, setBountyAutoApprove] = useState(false)
  const [isBountySheetOpen, setIsBountySheetOpen] = useState(false)

  // Ensure we're on the client before using Date functions
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Helper: Get default start time (now)
  const getDefaultStartTime = () => {
    const now = new Date()
    return now.toISOString().slice(0, 16)
  }

  // Helper: Get default due time (1 hour from start)
  const getDefaultDueTime = (startTime?: string) => {
    const start = startTime ? new Date(startTime) : new Date()
    const due = new Date(start.getTime() + 60 * 60 * 1000) // Add 1 hour
    return due.toISOString().slice(0, 16)
  }

  // Get the effective due time to display (only if explicitly set)
  const getEffectiveDueTime = () => {
    if (!isClient) return "" // Wait for client-side hydration
    if (isDueTimeExplicitlySet && dueDateTime) {
      return dueDateTime
    }
    // Return empty string so "Select" is shown for new tasks
    return ""
  }

  // Get current datetime for min attribute (client-side only)
  const getCurrentDateTime = () => {
    if (typeof window === 'undefined') return "" // Server-side guard
    const now = new Date()
    return now.toISOString().slice(0, 16)
  }

  // Format datetime for display
  const formatDateTime = (isoString: string) => {
    if (!isoString) return ""
    const date = new Date(isoString)
    return date.toLocaleString('en-US', { 
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Initialize form from initialTask when it changes
  useEffect(() => {
    if (!isClient) return // Only run on client

    if (initialTask) {
      setTaskTitle(initialTask.title || "")
      setDescription(initialTask.description || "")
      setRequirePhoto(initialTask.requirePhoto || false)
      setSelectedTags(initialTask.tags || [])
      setSelectedLocation(initialTask.location || "")
      setChecklist(initialTask.checklist || [])
      setRecurrence(initialTask.recurrence || null)
      setIsBillable((initialTask as any).isBillable || false)
      setBillableDurationMinutes((initialTask as any).billableDurationMinutes || 15)
      setBillableRate((initialTask as any).billableRate || 5.00)
      setBountyAutoApprove((initialTask as any).bountyAutoApprove || false)
      if (initialTask.startTime) {
        setStartDateTime(new Date(initialTask.startTime).toISOString().slice(0, 16))
      }
      if (initialTask.dueTime) {
        setDueDateTime(new Date(initialTask.dueTime).toISOString().slice(0, 16))
        setIsDueTimeExplicitlySet(true)
      }
    } else {
      // Reset to defaults for create mode (new task)
      setTaskTitle("")
      setDescription("")
      setRequirePhoto(false)
      setAttachments([])
      setAttachmentUrls([])
      setSelectedTags([])
      setRecurrence(null)
      setSelectedLocation("")
      setChecklist([])
      setStartDateTime(getDefaultStartTime()) // Set to current time
      setDueDateTime("") // Leave empty - shows "Select"
      setIsDueTimeExplicitlySet(false)
      setIsBillable(false)
      setBillableDurationMinutes(15)
      setBillableRate(5.00)
      setBountyAutoApprove(false)
    }
  }, [initialTask, isVisible, isClient])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setAttachments(prev => [...prev, ...newFiles])
      
      // Create URLs for preview
      const newUrls = newFiles.map(file => URL.createObjectURL(file))
      setAttachmentUrls(prev => [...prev, ...newUrls])
      // Store originals separately
      setOriginalAttachmentUrls(prev => [...prev, ...newUrls])
    }
    setIsAttachMenuOpen(false)
  }

  const handleRemoveAttachment = (index: number) => {
    // Revoke URLs to free memory
    if (attachmentUrls[index]) {
      URL.revokeObjectURL(attachmentUrls[index])
    }
    // Also revoke original if different
    if (originalAttachmentUrls[index] && originalAttachmentUrls[index] !== attachmentUrls[index]) {
      URL.revokeObjectURL(originalAttachmentUrls[index])
    }
    setAttachments(prev => prev.filter((_, i) => i !== index))
    setAttachmentUrls(prev => prev.filter((_, i) => i !== index))
    setOriginalAttachmentUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleCropComplete = (croppedImageUrl: string) => {
    if (mediaInEditor) {
      // Revoke old cropped URL (if different from original)
      if (attachmentUrls[mediaInEditor.index] !== originalAttachmentUrls[mediaInEditor.index]) {
        URL.revokeObjectURL(attachmentUrls[mediaInEditor.index])
      }
      // Update display URL with new cropped version
      setAttachmentUrls(prev => {
        const newUrls = [...prev]
        newUrls[mediaInEditor.index] = croppedImageUrl
        return newUrls
      })
      // Original URL remains unchanged in originalAttachmentUrls
      setMediaInEditor(null)
    }
  }

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setChecklist(prev => [...prev, {
        id: `item-${Date.now()}`,
        text: newChecklistItem,
        isChecked: false
      }])
      setNewChecklistItem("")
      setIsAddingChecklistItem(false)
    }
  }

  const handleToggleChecklistItem = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, isChecked: !item.isChecked } : item
    ))
  }

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist(prev => prev.filter(item => item.id !== id))
  }

  const handlePublish = () => {
    const effectiveDue = getEffectiveDueTime()
    const newTask: Task = {
      id: initialTask?.id || `t${Date.now()}`,
      title: taskTitle,
      description,
      requirePhoto,
      startTime: startDateTime ? new Date(startDateTime).toISOString() : undefined,
      dueTime: effectiveDue ? new Date(effectiveDue).toISOString() : undefined,
      status: initialTask?.status || "new",
      priority: initialTask?.priority || "medium",
      assigneeId: initialTask?.assigneeId || "u1",
      creatorId: initialTask?.creatorId || "u1",
      tags: selectedTags,
      location: selectedLocation,
      checklist,
      attachments: attachments.map(f => f.name),
      completed: initialTask?.completed || false,
      recurrence: recurrence,
      ...(isBillable && {
        isBillable: true,
        billableDurationMinutes,
        billableRate,
        bountyAutoApprove,
      }),
    }
    onSave(newTask)
    onClose()
  }

  // Helper function to format recurrence text
  const formatRecurrence = (rec: Recurrence | null): string => {
    if (!rec) return "Does not repeat"
    
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const interval = rec.interval || 1
    
    if (rec.type === 'daily') {
      return interval === 1 ? "Daily" : `Every ${interval} days`
    }
    if (rec.type === 'weekly') {
      if (interval === 1) {
        if (rec.daysOfWeek && rec.daysOfWeek.length > 0) {
          const days = rec.daysOfWeek.map(d => dayNames[d]).join(", ")
          return `Weekly on ${days}`
        }
        return "Weekly"
      }
      return `Every ${interval} weeks`
    }
    if (rec.type === 'monthly') {
      return interval === 1 ? "Monthly" : `Every ${interval} months`
    }
    if (rec.type === 'yearly') {
      return interval === 1 ? "Yearly" : `Every ${interval} years`
    }
    if (rec.type === 'custom') {
      return "Custom recurrence"
    }
    return "Does not repeat"
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-white flex flex-col z-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b px-4 py-2 flex items-center gap-2 z-10 h-14">
        <button 
          type="button"
          onClick={onClose}
          className="h-12 w-12 -ml-2 rounded-full flex items-center justify-center hover:bg-blue-50 text-blue-600 transition-colors focus:outline-none"
        >
          <ArrowLeft className="h-[30px] w-[30px]" strokeWidth={2.5} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 flex-1">
          {initialTask ? "Edit task" : "Create new task"}
        </h1>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto px-4 pt-0">
        {/* Task Title with Paperclip */}
        <div className="h-[50px] flex items-center gap-2">
          <Input
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            className="text-xl font-bold border-0 px-0 h-full focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 placeholder:text-gray-400"
            placeholder="Task title"
          />
          <button 
            type="button"
            className="hover:opacity-80 shrink-0"
            onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)}
          >
            <Paperclip className="h-6 w-6 text-blue-500" />
          </button>
        </div>

        {/* Description with Border */}
        <div className="mt-1 mb-3">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Task description"
            className="min-h-[120px] resize-none border border-gray-200 rounded-lg px-3 py-2 text-lg placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-blue-500"
          />
          
          {/* Media Gallery */}
          {attachmentUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              {attachmentUrls.map((url, index) => {
                const file = attachments[index]
                const isVideo = file.type.startsWith('video/')
                const isImage = file.type.startsWith('image/')

                return (
                  <div key={index} className="relative group">
                    {isImage && (
                      <div
                        className="w-full aspect-[4/3] rounded-lg border border-gray-200 cursor-pointer bg-gray-50 overflow-hidden relative"
                        onClick={() => setMediaInEditor({ url: originalAttachmentUrls[index] || url, index })}
                      >
                        <img
                          src={url}
                          alt={`Attachment ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {/* Remove button overlay */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveAttachment(index)
                          }}
                          className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {isVideo && (
                      <div
                        className="w-full aspect-[4/3] rounded-lg border border-gray-200 cursor-pointer bg-gray-900 overflow-hidden relative"
                        onClick={() => setVideoInViewer(url)}
                      >
                        <video
                          src={url}
                          className="w-full h-full object-cover"
                        />
                        {/* Play icon overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="bg-white/90 rounded-full p-3">
                            <Play className="h-8 w-8 text-gray-900" fill="currentColor" />
                          </div>
                        </div>
                        {/* Remove button overlay */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveAttachment(index)
                          }}
                          className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {!isImage && !isVideo && (
                      <div className="w-full aspect-[4/3] rounded-lg border border-gray-200 bg-gray-50 flex flex-col items-center justify-center p-4 relative group">
                        <FileText className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-xs text-gray-600 text-center truncate w-full">
                          {file.name}
                        </span>
                        {/* Remove button overlay */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveAttachment(index)
                          }}
                          className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
            </button>
          </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          ref={filesInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          ref={imagesInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Attachment Menu Popover */}
        {isAttachMenuOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsAttachMenuOpen(false)}
            />
            <div className="fixed top-[120px] right-4 bg-white border rounded-lg shadow-lg py-2 w-48 z-20">
              <button
                type="button"
                onClick={() => {
                  cameraInputRef.current?.click()
                  setIsAttachMenuOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
              >
                <Camera className="h-5 w-5 text-gray-700" />
                <span className="text-base">Camera</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  filesInputRef.current?.click()
                  setIsAttachMenuOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
              >
                <FileText className="h-5 w-5 text-gray-700" />
                <span className="text-base">Files</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  imagesInputRef.current?.click()
                  setIsAttachMenuOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
              >
                <Image className="h-5 w-5 text-gray-700" />
                <span className="text-base">Saved Images</span>
              </button>
            </div>
          </>
        )}

        {/* Start Time */}
        <div className="flex items-center justify-between h-[50px] border-b">
          <span className="text-lg font-normal">Start time</span>
          <div className="flex items-center gap-2">
            <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
              <PopoverTrigger asChild>
                <button 
                  type="button"
                  className="text-blue-500 text-base hover:text-blue-600"
                >
                  {startDateTime ? new Date(startDateTime).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Select'}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={startDateTime ? new Date(startDateTime) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const currentTime = startDateTime ? startDateTime.split('T')[1] || '00:00' : '00:00'
                      // Use local date components to avoid timezone conversion issues
                      const year = date.getFullYear()
                      const month = String(date.getMonth() + 1).padStart(2, '0')
                      const day = String(date.getDate()).padStart(2, '0')
                      const dateStr = `${year}-${month}-${day}`
                      setStartDateTime(`${dateStr}T${currentTime}`)
                      setIsStartDateOpen(false)
                    }
                  }}
                  initialFocus
                  className="[--cell-size:3rem]"
                />
              </PopoverContent>
            </Popover>
            {startDateTime && (
              <>
                <button
                  type="button"
                  onClick={() => startTimeInputRef.current?.showPicker()}
                  className="text-blue-500 text-base hover:text-blue-600"
                >
                  {new Date(startDateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </button>
                <button 
                  type="button"
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setStartDateTime("")}
                >
                  <X className="h-5 w-5" />
                </button>
              </>
            )}
            <input
              ref={startTimeInputRef}
              type="time"
              value={startDateTime ? startDateTime.split('T')[1] || '' : ''}
              onChange={(e) => {
                const currentDate = startDateTime ? startDateTime.split('T')[0] : new Date().toISOString().split('T')[0]
                setStartDateTime(`${currentDate}T${e.target.value}`)
              }}
              className="hidden"
            />
          </div>
        </div>

        {/* Due Time */}
        <div className="flex items-center justify-between h-[50px] border-b">
          <span className="text-lg font-normal">Due time</span>
          <div className="flex items-center gap-2">
            <Popover open={isDueDateOpen} onOpenChange={setIsDueDateOpen}>
              <PopoverTrigger asChild>
                <button 
                  type="button"
                  className="text-blue-500 text-base hover:text-blue-600"
                >
                  {dueDateTime ? new Date(dueDateTime).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Select'}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={dueDateTime ? new Date(dueDateTime) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const currentTime = dueDateTime ? dueDateTime.split('T')[1] || '00:00' : '00:00'
                      // Use local date components to avoid timezone conversion issues
                      const year = date.getFullYear()
                      const month = String(date.getMonth() + 1).padStart(2, '0')
                      const day = String(date.getDate()).padStart(2, '0')
                      const dateStr = `${year}-${month}-${day}`
                      setDueDateTime(`${dateStr}T${currentTime}`)
                      setIsDueTimeExplicitlySet(true)
                      setIsDueDateOpen(false)
                    }
                  }}
                  initialFocus
                  className="[--cell-size:3rem]"
                />
              </PopoverContent>
            </Popover>
            {dueDateTime && (
              <>
                <button
                  type="button"
                  onClick={() => dueTimeInputRef.current?.showPicker()}
                  className="text-blue-500 text-base hover:text-blue-600"
                >
                  {new Date(dueDateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </button>
                <button 
                  type="button"
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => {
                    setDueDateTime("")
                    setIsDueTimeExplicitlySet(false)
                  }}
                >
                  <X className="h-5 w-5" />
                </button>
              </>
            )}
            <input
              ref={dueTimeInputRef}
              type="time"
              value={dueDateTime ? dueDateTime.split('T')[1] || '' : ''}
              onChange={(e) => {
                const currentDate = dueDateTime ? dueDateTime.split('T')[0] : new Date().toISOString().split('T')[0]
                setDueDateTime(`${currentDate}T${e.target.value}`)
                setIsDueTimeExplicitlySet(true)
              }}
              className="hidden"
            />
          </div>
        </div>

        {/* Repeat */}
        <div className="flex items-center justify-between h-[50px] border-b">
          <span className="text-lg font-normal">Repeat</span>
          <button 
            type="button"
            onClick={() => setIsRecurrenceSheetOpen(true)}
            className="text-blue-500 text-base hover:text-blue-600"
          >
            {formatRecurrence(recurrence)}
          </button>
        </div>

        {/* Assigned To */}
        <div className="flex items-center justify-between h-[50px] border-b">
          <span className="text-lg font-normal">Assigned to</span>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100">
            <div className="h-6 w-6 rounded-full bg-orange-400 flex items-center justify-center text-white text-xs font-semibold">
              PS
            </div>
            <span className="text-base">Pete Seager</span>
          </button>
        </div>

        {/* Tags */}
        <div className="flex items-start justify-between min-h-[50px] py-3 border-b gap-4">
          <span className="text-lg font-normal pt-0.5">Tags</span>
          {selectedTags.length > 0 ? (
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault()
                setIsTagSheetOpen(true)
              }}
              className="flex items-center gap-2 flex-wrap max-w-[400px] justify-end"
            >
              {selectedTags.map(tagId => {
                const tag = AVAILABLE_TAGS.find(t => t.id === tagId)
                return tag ? (
                  <div key={tagId} className={`px-3 py-1 rounded-full text-sm font-medium ${tag.color}`}>
                    {tag.label}
                  </div>
                ) : null
              })}
            </button>
          ) : (
            <Button 
              type="button"
              variant="ghost" 
              className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 h-auto py-1 text-base"
              onClick={() => setIsTagSheetOpen(true)}
            >
            Select
          </Button>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center justify-between h-[50px] border-b">
          <span className="text-lg font-normal">Location</span>
          {selectedLocation ? (
            <button 
              onClick={() => setShowLocationSelector(true)}
              className="text-base text-gray-900 hover:text-blue-500"
            >
              {AVAILABLE_LOCATIONS.find(l => l.id === selectedLocation)?.name}
            </button>
          ) : (
            <Button 
              variant="ghost" 
              className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 h-auto py-1 text-base"
              onClick={() => setShowLocationSelector(true)}
            >
            Select
          </Button>
          )}
        </div>

        {/* Checkboxes Section */}
        <div className="mt-4 mb-4 space-y-4">
          {/* Require Photo */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={requirePhoto}
              onChange={(e) => setRequirePhoto(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-base text-gray-900">Require Photo of Finished Task</span>
          </label>

          {/* Secret Task */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-base text-gray-900">Secret Task - Hide from shared tablet</span>
          </label>

          {/* Bounty */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isBillable}
                onChange={(e) => {
                  setIsBillable(e.target.checked)
                  if (e.target.checked) {
                    setIsBountySheetOpen(true)
                  }
                }}
                className="h-5 w-5 shrink-0 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-base text-gray-900">Bounty - Allow off-clock, paid completion</span>
            </label>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsBountySheetOpen(true)}
              className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 h-auto py-1 text-base"
            >
              Set
          </Button>
        </div>
      </div>

        {/* Checklist */}
        <div className="border-b py-3">
          <div className="flex items-center justify-between h-[50px]">
            <span className="text-lg font-normal">Checklist</span>
        <Button 
              variant="ghost" 
              className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 h-auto py-1 text-base"
              onClick={() => setIsAddingChecklistItem(true)}
            >
              Add
            </Button>
          </div>

          {/* Checklist Items */}
          {checklist.length > 0 && (
            <div className="space-y-2 mt-2">
              {checklist.map(item => (
                <div key={item.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.isChecked}
                    onChange={() => handleToggleChecklistItem(item.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-500"
                  />
                  <span className={`flex-1 text-base ${item.isChecked ? 'line-through text-gray-400' : ''}`}>
                    {item.text}
                  </span>
                  <button 
                    type="button"
                    onClick={() => handleRemoveChecklistItem(item.id)}
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Checklist Item Input */}
          {isAddingChecklistItem && (
            <div className="flex items-center gap-2 mt-2">
              <Input
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddChecklistItem()
                  } else if (e.key === 'Escape') {
                    setIsAddingChecklistItem(false)
                    setNewChecklistItem("")
                  }
                }}
                placeholder="Add checklist item"
                className="flex-1"
                autoFocus
              />
              <Button size="sm" onClick={handleAddChecklistItem}>
                <Check className="h-4 w-4" />
        </Button>
        <Button 
                size="sm" 
                variant="ghost"
                onClick={() => {
                  setIsAddingChecklistItem(false)
                  setNewChecklistItem("")
                }}
              >
                <X className="h-4 w-4" />
        </Button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Button */}
      <div className="sticky bottom-0 bg-white border-t px-4 py-4">
        <Button 
          className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white text-lg font-medium rounded-full"
          onClick={handlePublish}
        >
          {initialTask ? "Save changes" : "Publish task"}
        </Button>
      </div>

      {/* Tag Selection Sheet */}
      <TagSelectionSheet
        isOpen={isTagSheetOpen}
        onClose={() => setIsTagSheetOpen(false)}
        selectedTagIds={selectedTags}
        onTagsChange={(newIds) => setSelectedTags(newIds)}
      />

      {/* Location Selector Modal */}
      {showLocationSelector && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowLocationSelector(false)} />
          <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl p-6 z-50 max-h-[70vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4">Select Location</h2>
            <div className="space-y-3">
              {AVAILABLE_LOCATIONS.map(location => (
                <button
                  key={location.id}
                  onClick={() => {
                    setSelectedLocation(location.id)
                    setShowLocationSelector(false)
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
                >
                  <span className="text-base">{location.name}</span>
                  {selectedLocation === location.id && (
                    <Check className="h-5 w-5 text-blue-500" />
                  )}
                </button>
              ))}
            </div>
            <Button 
              className="w-full mt-4"
              onClick={() => setShowLocationSelector(false)}
            >
              Done
            </Button>
          </div>
        </>
      )}

      {/* Media Crop Editor */}
      {mediaInEditor && (
        <MediaCropEditor
          isOpen={!!mediaInEditor}
          onClose={() => setMediaInEditor(null)}
          imageSrc={mediaInEditor.url}
          onCropComplete={handleCropComplete}
        />
      )}

      {/* Recurrence Sheet */}
      <RecurrenceSheet
        isOpen={isRecurrenceSheetOpen}
        onClose={() => setIsRecurrenceSheetOpen(false)}
        value={recurrence}
        onChange={setRecurrence}
      />

      {/* Bounty Config Sheet */}
      <BountyConfigSheet
        isOpen={isBountySheetOpen}
        onClose={() => setIsBountySheetOpen(false)}
        onSave={(minutes, autoApprove) => {
          setBillableDurationMinutes(minutes)
          setBountyAutoApprove(autoApprove)
          setIsBillable(true)
        }}
      />

      {/* Video Viewer Modal */}
      {videoInViewer && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          {/* Header */}
          <div className="bg-black/90 px-4 py-4 flex items-center justify-between">
            <h2 className="text-white text-lg font-semibold">Video</h2>
            <button
              onClick={() => setVideoInViewer(null)}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          {/* Video */}
          <div className="flex-1 flex items-center justify-center">
            <video
              src={videoInViewer}
              controls
              autoPlay
              className="max-w-full max-h-full"
            />
          </div>
        </div>
      )}
    </div>
  )
}
