"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, Paperclip, X, Check, Camera, FileText, Image } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { AVAILABLE_TAGS } from "@/data/tags"
import TagSelectionSheet from "@/components/TagSelectionSheet"

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
}

interface TaskEditorProps {
  isVisible: boolean
  onClose: () => void
  onSave: (task: Task) => void
  initialTask?: Task | null
}

export function TaskEditor({ isVisible, onClose, onSave, initialTask }: TaskEditorProps) {
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

  // Get the effective due time to display (computed or explicit)
  const getEffectiveDueTime = () => {
    if (!isClient) return "" // Wait for client-side hydration
    if (isDueTimeExplicitlySet && dueDateTime) {
      return dueDateTime
    }
    if (startDateTime) {
      return getDefaultDueTime(startDateTime)
    }
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
      if (initialTask.startTime) {
        setStartDateTime(new Date(initialTask.startTime).toISOString().slice(0, 16))
      }
      if (initialTask.dueTime) {
        setDueDateTime(new Date(initialTask.dueTime).toISOString().slice(0, 16))
        setIsDueTimeExplicitlySet(true)
      }
    } else {
      // Reset to defaults for create mode
      setTaskTitle("")
      setDescription("")
      setRequirePhoto(false)
      setAttachments([])
      setSelectedTags([])
      setSelectedLocation("")
      setChecklist([])
      setStartDateTime(getDefaultStartTime())
      setDueDateTime("") // Don't set - will be computed
      setIsDueTimeExplicitlySet(false)
    }
  }, [initialTask, isVisible, isClient])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files!)])
    }
    setIsAttachMenuOpen(false)
  }

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleToggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
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
    }
    onSave(newTask)
    onClose()
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-white flex flex-col z-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b px-4 py-4 flex items-center gap-4 z-10">
        <button onClick={onClose} className="h-auto p-3 shrink-0 flex items-center justify-center -ml-3">
          <ChevronLeft className="h-6 w-6 text-gray-900" strokeWidth={2.5} />
        </button>
        <h1 className="text-lg font-semibold flex-1 text-center mr-10">
          {initialTask ? "Edit task" : "Create new task"}
        </h1>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto px-4 pt-0">
        {/* Task Title */}
        <div className="h-[50px] flex items-center border-b">
          <Input
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            className="text-xl font-bold border-0 px-0 h-full focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Task title"
          />
        </div>

        {/* Description Area */}
        <div className="mt-5 mb-3">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Task description"
            className="min-h-[120px] resize-none border border-gray-200 rounded-lg px-3 py-2 text-lg placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-blue-500"
          />
          
          {/* Attachments Display */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <button onClick={() => handleRemoveAttachment(index)}>
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <label className="flex items-center gap-2 text-base text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={requirePhoto}
                onChange={(e) => setRequirePhoto(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <span>Require photo for completion</span>
            </label>
            <div className="relative">
              <button 
                className="hover:opacity-80"
                onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)}
              >
                <Paperclip className="h-6 w-6 text-blue-500" />
              </button>
              
              {/* Attachment Menu */}
              {isAttachMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsAttachMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 bg-white border rounded-lg shadow-lg py-2 w-48 z-20">
                    <button
                      onClick={() => {
                        cameraInputRef.current?.click()
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                    >
                      <Camera className="h-5 w-5 text-gray-700" />
                      <span className="text-base">Camera</span>
                    </button>
                    <button
                      onClick={() => {
                        filesInputRef.current?.click()
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                    >
                      <FileText className="h-5 w-5 text-gray-700" />
                      <span className="text-base">Files</span>
                    </button>
                    <button
                      onClick={() => {
                        imagesInputRef.current?.click()
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                    >
                      <Image className="h-5 w-5 text-gray-700" />
                      <span className="text-base">Saved Images</span>
                    </button>
                  </div>
                </>
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
          </div>
        </div>

        {/* Start Time */}
        <div className="flex items-center justify-between h-[50px] border-b">
          <span className="text-lg font-normal">Start time</span>
          <div className="flex items-center gap-3">
            {startDateTime ? (
              <>
                <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                  <PopoverTrigger asChild>
                    <button className="text-blue-500 text-base cursor-pointer hover:text-blue-600">
                      {new Date(startDateTime).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={startDateTime ? new Date(startDateTime) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const currentTime = startDateTime ? startDateTime.split('T')[1] || '00:00' : '00:00'
                          const dateStr = date.toISOString().split('T')[0]
                          setStartDateTime(`${dateStr}T${currentTime}`)
                          setIsStartDateOpen(false)
                        }
                      }}
                      initialFocus
                      className="[--cell-size:3rem]"
                    />
                  </PopoverContent>
                </Popover>
                <div className="w-px h-4 bg-gray-300" />
                <button
                  onClick={() => startTimeInputRef.current?.showPicker()}
                  className="text-blue-500 text-base cursor-pointer hover:text-blue-600"
                >
                  {new Date(startDateTime).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </button>
                <button 
                  className="text-gray-400 hover:text-gray-600 ml-1"
                  onClick={() => setStartDateTime("")}
                >
                  <X className="h-5 w-5" />
                </button>
              </>
            ) : (
              <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                <PopoverTrigger asChild>
                  <button className="text-blue-500 text-base cursor-pointer hover:text-blue-600">
                    Select
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={undefined}
                    onSelect={(date) => {
                      if (date) {
                        const dateStr = date.toISOString().split('T')[0]
                        const now = new Date()
                        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
                        setStartDateTime(`${dateStr}T${timeStr}`)
                        setIsStartDateOpen(false)
                      }
                    }}
                    initialFocus
                    className="[--cell-size:3rem]"
                  />
                </PopoverContent>
              </Popover>
            )}
            <input
              ref={startTimeInputRef}
              id="start-time-input"
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
          <div className="flex items-center gap-3">
            {getEffectiveDueTime() ? (
              <>
                <Popover open={isDueDateOpen} onOpenChange={setIsDueDateOpen}>
                  <PopoverTrigger asChild>
                    <button className="text-blue-500 text-base cursor-pointer hover:text-blue-600">
                      {new Date(getEffectiveDueTime()).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={getEffectiveDueTime() ? new Date(getEffectiveDueTime()) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const effectiveTime = getEffectiveDueTime()
                          const currentTime = effectiveTime ? effectiveTime.split('T')[1] || '00:00' : '00:00'
                          const dateStr = date.toISOString().split('T')[0]
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
                <div className="w-px h-4 bg-gray-300" />
                <button
                  onClick={() => dueTimeInputRef.current?.showPicker()}
                  className="text-blue-500 text-base cursor-pointer hover:text-blue-600"
                >
                  {new Date(getEffectiveDueTime()).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </button>
                <button 
                  className="text-gray-400 hover:text-gray-600 ml-1"
                  onClick={() => {
                    setDueDateTime("")
                    setIsDueTimeExplicitlySet(false)
                  }}
                >
                  <X className="h-5 w-5" />
                </button>
              </>
            ) : (
              <Popover open={isDueDateOpen} onOpenChange={setIsDueDateOpen}>
                <PopoverTrigger asChild>
                  <button className="text-blue-500 text-base cursor-pointer hover:text-blue-600">
                    Select
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={undefined}
                    onSelect={(date) => {
                      if (date) {
                        const dateStr = date.toISOString().split('T')[0]
                        const now = new Date()
                        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
                        setDueDateTime(`${dateStr}T${timeStr}`)
                        setIsDueTimeExplicitlySet(true)
                        setIsDueDateOpen(false)
                      }
                    }}
                    initialFocus
                    className="[--cell-size:3rem]"
                  />
                </PopoverContent>
              </Popover>
            )}
            <input
              ref={dueTimeInputRef}
              id="due-time-input"
              type="time"
              value={dueDateTime ? dueDateTime.split('T')[1] || '' : ''}
              onChange={(e) => {
                const effectiveDateTime = getEffectiveDueTime()
                const currentDate = dueDateTime ? dueDateTime.split('T')[0] : (effectiveDateTime ? effectiveDateTime.split('T')[0] : new Date().toISOString().split('T')[0])
                setDueDateTime(`${currentDate}T${e.target.value}`)
                setIsDueTimeExplicitlySet(true)
              }}
              className="hidden"
            />
          </div>
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
        <div className="flex items-center justify-between h-[50px] border-b">
          <span className="text-lg font-normal">Tags</span>
          {selectedTags.length > 0 ? (
            <button 
              onClick={() => setIsTagSheetOpen(true)}
              className="flex items-center gap-2 flex-wrap max-w-[200px] justify-end"
            >
              {selectedTags.map(tagId => {
                const tag = AVAILABLE_TAGS.find(t => t.id === tagId)
                return tag ? (
                  <div key={tagId} className="flex items-center gap-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${tag.color}`} />
                    <span className="text-sm text-gray-900">{tag.label}</span>
                  </div>
                ) : null
              })}
            </button>
          ) : (
            <Button 
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
                  <button onClick={() => handleRemoveChecklistItem(item.id)}>
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

      {/* Footer Buttons */}
      <div className="sticky bottom-0 bg-white border-t px-4 py-4 flex items-center gap-3">
        <Button 
          variant="outline" 
          className="flex-1 h-11 text-lg font-medium bg-transparent rounded-full"
          onClick={onClose}
        >
          Discard
        </Button>
        <Button 
          className="flex-1 h-11 bg-teal-400 hover:bg-teal-500 text-white text-lg font-medium rounded-full"
          onClick={() => alert("Save draft functionality not yet implemented")}
        >
          Save draft
        </Button>
        <Button 
          className="flex-1 h-11 bg-blue-500 hover:bg-blue-600 text-white text-lg font-medium rounded-full"
          onClick={handlePublish}
        >
          Publish task
        </Button>
      </div>

      {/* Tag Selection Sheet */}
      <TagSelectionSheet
        isVisible={isTagSheetOpen}
        onClose={() => setIsTagSheetOpen(false)}
        selectedTagIds={selectedTags}
        onToggleTag={handleToggleTag}
        title="Select Tags"
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
    </div>
  )
}
