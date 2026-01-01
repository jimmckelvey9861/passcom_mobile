"use client"

import { createContext, useContext, useState, ReactNode } from "react"

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
  price?: string
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

interface GlobalContextType {
  shiftState: ShiftState
  tasks: Task[]
  clockIn: () => void
  clockOut: () => void
  toggleTask: (id: string) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
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
        creatorId: 'u-1',
        assigneeId: 'u-1',
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
        creatorId: 'u-1',
        assigneeId: 'u-2',
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
        creatorId: 'u-2',
        assigneeId: 'u-2',
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
        price: "$10.00",
        creatorId: 'u-2',
        assigneeId: 'u-1',
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
  
  const value: GlobalContextType = {
    shiftState,
    tasks,
    clockIn,
    clockOut,
    toggleTask,
    addTask,
    updateTask,
    deleteTask
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

