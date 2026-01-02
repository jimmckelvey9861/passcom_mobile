"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, UserPlus, Search, Phone, MessageCircle, Clock, Coffee } from "lucide-react"
import { useGlobalApp } from "@/context/GlobalContext"

// Mock employee data
const EMPLOYEES = [
  { 
    id: 2, 
    name: "Sarah Mitchell", 
    role: "Barista", 
    status: "clocked-in" as const, 
    time: "8:00 AM",
    avatar: "SM",
    phone: "(555) 234-5678"
  },
  { 
    id: 3, 
    name: "Mike Chen", 
    role: "Kitchen", 
    status: "break" as const, 
    time: "10:30 AM",
    breakMinutes: 15,
    avatar: "MC",
    phone: "(555) 345-6789"
  },
  { 
    id: 4, 
    name: "Liz Anderson", 
    role: "Front of House", 
    status: "clocked-out" as const,
    avatar: "LA",
    phone: "(555) 456-7890"
  },
  { 
    id: 5, 
    name: "David Park", 
    role: "Manager", 
    status: "clocked-in" as const,
    time: "7:30 AM",
    avatar: "DP",
    phone: "(555) 567-8901"
  },
]

type EmployeeStatus = "clocked-in" | "break" | "clocked-out"

interface Employee {
  id: number
  name: string
  role: string
  status: EmployeeStatus
  time?: string
  breakMinutes?: number
  avatar: string
  phone: string
  isCurrentUser?: boolean
}

export default function TeamRosterPage() {
  const router = useRouter()
  const { shiftState, userProfile } = useGlobalApp()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false)

  // Create current user employee object
  const currentUserEmployee: Employee = {
    id: 1,
    name: userProfile.name,
    role: "Shift Lead", // Could come from profile
    status: shiftState.status === "clocked-in" ? "clocked-in" : 
            shiftState.status === "break" ? "break" : "clocked-out",
    time: shiftState.startTime ? new Date(shiftState.startTime).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    }) : undefined,
    avatar: userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    phone: userProfile.phone,
    isCurrentUser: true
  }

  // Combine current user with mock employees
  const allEmployees = useMemo(() => {
    return [currentUserEmployee, ...EMPLOYEES]
  }, [currentUserEmployee])

  // Filter employees by search query
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return allEmployees
    
    const query = searchQuery.toLowerCase()
    return allEmployees.filter(emp => 
      emp.name.toLowerCase().includes(query) ||
      emp.role.toLowerCase().includes(query)
    )
  }, [allEmployees, searchQuery])

  // Split into active and offline
  const activeEmployees = filteredEmployees.filter(e => 
    e.status === "clocked-in" || e.status === "break"
  )
  const offlineEmployees = filteredEmployees.filter(e => 
    e.status === "clocked-out"
  )

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsActionSheetOpen(true)
  }

  const handleCall = (employee: Employee) => {
    console.log(`Calling ${employee.name} at ${employee.phone}`)
    // TODO: Implement phone call
  }

  const handleMessage = (employee: Employee) => {
    console.log(`Messaging ${employee.name}`)
    router.push(`/chat/${employee.id}`)
  }

  const renderEmployee = (employee: Employee, showActions = false) => {
    const isActive = employee.status === "clocked-in" || employee.status === "break"
    
    return (
      <div
        key={employee.id}
        onClick={() => handleEmployeeClick(employee)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
      >
        {/* Avatar with status indicator */}
        <div className="relative shrink-0">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">{employee.avatar}</span>
          </div>
          {/* Status dot */}
          <div className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white ${
            employee.status === "clocked-in" ? "bg-green-500" :
            employee.status === "break" ? "bg-yellow-500" :
            "bg-gray-400"
          }`} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {employee.name}
            </p>
            {employee.isCurrentUser && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full">
                YOU
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">{employee.role}</p>
          
          {/* Status info */}
          {isActive && (
            <div className="flex items-center gap-1 mt-1">
              {employee.status === "clocked-in" && (
                <>
                  <Clock className="h-3 w-3 text-green-600" />
                  <span className="text-xs font-medium text-green-600">
                    Since {employee.time}
                  </span>
                </>
              )}
              {employee.status === "break" && (
                <>
                  <Coffee className="h-3 w-3 text-yellow-600" />
                  <span className="text-xs font-medium text-yellow-600">
                    On Break ({employee.breakMinutes}m)
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Actions for offline employees */}
        {showActions && !isActive && (
          <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => handleCall(employee)}
              className="h-9 w-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <Phone className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={() => handleMessage(employee)}
              className="h-9 w-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <MessageCircle className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b px-4 py-2 flex items-center gap-2 z-10 h-14">
        <button 
          className="h-12 w-12 rounded-full flex items-center justify-center hover:bg-purple-50 text-purple-600 transition-colors -ml-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-[30px] w-[30px]" strokeWidth={2.5} />
        </button>
        <h1 className="text-lg font-semibold flex-1">Team</h1>
        <button
          onClick={() => console.log('Add Employee')}
          className="h-10 w-10 rounded-full bg-purple-500 hover:bg-purple-600 flex items-center justify-center text-white transition-colors"
        >
          <UserPlus className="h-5 w-5" strokeWidth={2.5} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3 bg-white border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Find employee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Content */}
      <div className="py-4">
        
        {/* Section 1: Active Now */}
        {activeEmployees.length > 0 && (
          <div className="mb-6">
            <div className="px-4 mb-2 flex items-center justify-between">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Active Now
              </h2>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium text-green-600">{activeEmployees.length} Live</span>
              </div>
            </div>
            <div className="bg-white border-y border-gray-200 divide-y divide-gray-100">
              {activeEmployees.map(employee => renderEmployee(employee))}
            </div>
          </div>
        )}

        {/* Section 2: Offline */}
        {offlineEmployees.length > 0 && (
          <div className="mb-6">
            <h2 className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wide">
              Offline
            </h2>
            <div className="bg-white border-y border-gray-200 divide-y divide-gray-100">
              {offlineEmployees.map(employee => renderEmployee(employee, true))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredEmployees.length === 0 && (
          <div className="px-4 py-12 text-center">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-900">No employees found</p>
            <p className="text-xs text-gray-500 mt-1">Try a different search term</p>
          </div>
        )}

      </div>

      {/* Action Sheet */}
      {isActionSheetOpen && selectedEmployee && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
            onClick={() => setIsActionSheetOpen(false)}
          />

          {/* Sheet */}
          <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl z-50 animate-in slide-in-from-bottom duration-300 pb-safe">
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Employee Info */}
            <div className="px-6 py-4 border-b">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                  <span className="text-white text-base font-bold">{selectedEmployee.avatar}</span>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{selectedEmployee.name}</p>
                  <p className="text-sm text-gray-500">{selectedEmployee.role}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 py-2">
              <button
                onClick={() => {
                  console.log('View Profile')
                  setIsActionSheetOpen(false)
                }}
                className="w-full px-4 py-4 text-left hover:bg-slate-50 rounded-lg transition-colors"
              >
                <p className="text-base font-medium text-gray-900">View Profile</p>
              </button>
              <button
                onClick={() => {
                  console.log('Edit Schedule')
                  setIsActionSheetOpen(false)
                }}
                className="w-full px-4 py-4 text-left hover:bg-slate-50 rounded-lg transition-colors"
              >
                <p className="text-base font-medium text-gray-900">Edit Schedule</p>
              </button>
              <button
                onClick={() => {
                  handleMessage(selectedEmployee)
                  setIsActionSheetOpen(false)
                }}
                className="w-full px-4 py-4 text-left hover:bg-slate-50 rounded-lg transition-colors"
              >
                <p className="text-base font-medium text-gray-900">Message</p>
              </button>
            </div>

            {/* Cancel */}
            <div className="px-4 py-4">
              <button
                onClick={() => setIsActionSheetOpen(false)}
                className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

