"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

// Types
export interface Task {
  id: string
  title: string
  time: string
  status: 'new' | 'open' | 'late' | 'done'
  tags: string[]
  creatorId: string
  assigneeId: string
  dueTime: string
  isBounty?: boolean
  bountyMinutes?: number  // Changed from price (string) to bountyMinutes (number)
  description?: string
  startTime?: string
  requirePhoto?: boolean
  attachments?: string[]
  location?: string
  checklist?: Array<{
    id: string
    text: string
    isChecked: boolean
  }>
}

export interface ShiftState {
  status: 'clocked-out' | 'clocked-in' | 'break'
  startTime: Date | null
}

export interface UserProfile {
  name: string
  email: string
  phone: string
  address: string
}

// Chat Message Types
type BaseMessage = {
  id: number
  sender: "me" | "them"
  time: string
  senderName?: string
  senderAvatar?: string
}

type TextMessage = BaseMessage & {
  type: "text"
  text: string
}

type MediaMessage = BaseMessage & {
  type: "image" | "video" | "gif"
  url: string
  aspectRatio?: number
}

type FileMessage = BaseMessage & {
  type: "document"
  fileName: string
  fileSize: string
}

type LocationMessage = BaseMessage & {
  type: "location"
  address: string
  mapImageUrl: string
}

type ContactMessage = BaseMessage & {
  type: "contact"
  name: string
  phoneNumber: string
}

type LinkMessage = BaseMessage & {
  type: "link"
  url: string
  title: string
  previewImageUrl: string
}

export type Message =
  | TextMessage
  | MediaMessage
  | FileMessage
  | LocationMessage
  | ContactMessage
  | LinkMessage

export interface Request {
  id: string
  userId: string
  userName: string
  type: 'PTO' | 'Swap' | 'TimeOff'
  detail: string
  date: string
  status: 'pending' | 'approved' | 'denied'
}

interface GlobalContextType {
  shiftState: ShiftState
  tasks: Task[]
  chats: Record<string, Message[]>
  profilePhoto: string | null
  userProfile: UserProfile
  requests: Request[]
  isBottomSheetOpen: boolean
  clockIn: () => void
  clockOut: () => void
  toggleTask: (id: string) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  sendMessage: (userId: string, message: Message) => void
  setProfilePhoto: (photo: string | null) => void
  updateUserProfile: (profile: Partial<UserProfile>) => void
  addRequest: (request: Request) => void
  updateRequestStatus: (id: string, newStatus: 'approved' | 'denied') => void
  setBottomSheetOpen: (isOpen: boolean) => void
}

// Create Context
const GlobalContext = createContext<GlobalContextType | undefined>(undefined)

// Mock Tasks Data (from tasks page)
const generateInitialTasks = (): Task[] => {
  const today = new Date()
  const tasks: Task[] = []
  
  // Generate tasks for the next 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    
    // Task 1: Check Equipment Temperatures
    if (i % 4 === 0) {
      tasks.push({
        id: `task-${i}-1`,
        title: "Check Equipment Temperatures",
        time: "8:00 AM",
        status: "new",
        tags: ["kitchen", "maintenance"],
        creatorId: 'u1',
        assigneeId: 'u1',
        dueTime: date.toISOString()
      })
    }
    
    // Task 2: Prep vegetables
    if (i % 3 === 1) {
      tasks.push({
        id: `task-${i}-2`,
        title: "Prep vegetables for service",
        time: "10:00 AM",
        status: "open",
        tags: ["prep", "kitchen"],
        creatorId: 'u1',
        assigneeId: 'u2',
        dueTime: date.toISOString()
      })
    }
    
    // Task 3: Deep clean cooler
    if (i % 3 === 0 && i > 0) {
      tasks.push({
        id: `task-${i}-3`,
        title: "Deep clean walk-in cooler",
        time: "2:00 PM",
        status: "done",
        tags: ["cleaning"],
        creatorId: 'u2',
        assigneeId: 'u2',
        dueTime: date.toISOString()
      })
    }
    
    // Task 4: Inventory count (Bounty)
    if (i % 4 === 2) {
      tasks.push({
        id: `task-${i}-5`,
        title: "Inventory count - dry storage",
        time: "3:00 PM",
        status: "open",
        tags: ["inventory", "admin"],
        isBounty: true,
        bountyMinutes: 30,  // 30 minutes bounty
        creatorId: 'u2',
        assigneeId: 'u1',
        dueTime: date.toISOString()
      })
    }
  }
  
  return tasks
}

// Provider Component
export function GlobalProvider({ children }: { children: ReactNode }) {
  const [shiftState, setShiftState] = useState<ShiftState>({
    status: 'clocked-out',
    startTime: null
  })
  
  const [tasks, setTasks] = useState<Task[]>(generateInitialTasks())
  
  // Chat messages keyed by user ID
  const [chats, setChats] = useState<Record<string, Message[]>>({})
  
  // Profile photo with localStorage persistence
  const [profilePhoto, setProfilePhotoState] = useState<string | null>(null)
  
  // User profile with localStorage persistence
  const [userProfile, setUserProfileState] = useState<UserProfile>({
    name: 'Jim McKelvey',
    email: 'jim@example.com',
    phone: '(555) 123-4567',
    address: '123 Main St, New York, NY 10001'
  })
  
  // Requests with initial mock data
  const [requests, setRequests] = useState<Request[]>([
    {
      id: 'req-1',
      userId: 'u3',
      userName: 'Mike Chen',
      type: 'Swap',
      detail: 'Fri 5pm → Sat 2pm',
      date: '2026-01-10',
      status: 'pending'
    },
    {
      id: 'req-2',
      userId: 'u2',
      userName: 'Sarah Mitchell',
      type: 'PTO',
      detail: 'Jan 15-17',
      date: '2026-01-15',
      status: 'pending'
    }
  ])
  
  // Bottom sheet state
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)
  
  // Load profile data from localStorage on mount
  useEffect(() => {
    const savedPhoto = localStorage.getItem('profilePhoto')
    if (savedPhoto) {
      setProfilePhotoState(savedPhoto)
    }
    
    const savedProfile = localStorage.getItem('userProfile')
    if (savedProfile) {
      setUserProfileState(JSON.parse(savedProfile))
    }
  }, [])
  
  // Save profile photo to localStorage and update state
  const setProfilePhoto = (photo: string | null) => {
    setProfilePhotoState(photo)
    if (photo) {
      localStorage.setItem('profilePhoto', photo)
    } else {
      localStorage.removeItem('profilePhoto')
    }
  }
  
  // Update user profile and save to localStorage
  const updateUserProfile = (updates: Partial<UserProfile>) => {
    const newProfile = { ...userProfile, ...updates }
    setUserProfileState(newProfile)
    localStorage.setItem('userProfile', JSON.stringify(newProfile))
  }
  
  // Clock In
  const clockIn = () => {
    setShiftState({
      status: 'clocked-in',
      startTime: new Date()
    })
  }
  
  // Clock Out
  const clockOut = () => {
    setShiftState({
      status: 'clocked-out',
      startTime: null
    })
  }
  
  // Toggle Task Completion
  const toggleTask = (id: string) => {
    console.log('🔄 toggleTask called with id:', id)
    setTasks(prev => {
      const updated = prev.map(task =>
        String(task.id) === String(id)
          ? { ...task, status: task.status === 'done' ? 'open' : 'done' }
          : task
      )
      console.log('✅ Tasks updated in context. New task list:', updated)
      return updated
    })
  }
  
  // Add Task
  const addTask = (task: Task) => {
    setTasks(prev => [...prev, task])
  }
  
  // Update Task
  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, ...updates } : task
      )
    )
  }
  
  // Delete Task
  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id))
  }
  
  // Send Message
  const sendMessage = (userId: string, message: Message) => {
    setChats(prev => ({
      ...prev,
      [userId]: [...(prev[userId] || []), message]
    }))
  }
  
  // Add Request
  const addRequest = (request: Request) => {
    setRequests(prev => [...prev, request])
    console.log('📝 Request added:', request)
  }
  
  // Update Request Status
  const updateRequestStatus = (id: string, newStatus: 'approved' | 'denied') => {
    setRequests(prev =>
      prev.map(req =>
        req.id === id ? { ...req, status: newStatus } : req
      )
    )
    console.log(`✅ Request ${id} ${newStatus}`)
  }
  
  const value: GlobalContextType = {
    shiftState,
    tasks,
    chats,
    profilePhoto,
    userProfile,
    requests,
    isBottomSheetOpen,
    clockIn,
    clockOut,
    toggleTask,
    addTask,
    updateTask,
    deleteTask,
    sendMessage,
    setProfilePhoto,
    updateUserProfile,
    addRequest,
    updateRequestStatus,
    setBottomSheetOpen: setIsBottomSheetOpen
  }
  
  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  )
}

// Custom Hook
export function useGlobalApp() {
  const context = useContext(GlobalContext)
  
  if (context === undefined) {
    throw new Error('useGlobalApp must be used within a GlobalProvider')
  }
  
  return context
}

