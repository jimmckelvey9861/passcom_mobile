"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, ChevronDown, AlertTriangle, Search, SlidersHorizontal, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import ViewTasksSheet from "@/components/ViewTasksSheet"
import SortDateSheet from "@/components/SortDateSheet"
import SortStatusSheet from "@/components/SortStatusSheet"
import SortLabelSheet from "@/components/SortLabelSheet"
import SortUserSheet from "@/components/SortUserSheet"
import CalendarAgendaView from "@/components/CalendarAgendaView"
import OverdueTasksModal from "@/components/OverdueTasksModal"
import { DUMMY_TASKS, DUMMY_USERS, DUMMY_LABELS, CURRENT_USER_ID } from "@/data/dummyTasks"

export default function TasksPage() {
  const router = useRouter()

  // Use imported dummy data
  const availableLabels = DUMMY_LABELS
  const currentUserId = CURRENT_USER_ID
  const allUsers = DUMMY_USERS

  // For "Created By" filter, exclude "Unassigned" since tasks always have a creator
  const creatorUsers = allUsers.filter((user) => user.id !== "unassigned")

  const [currentDate, setCurrentDate] = useState(new Date())
  const [isOpenTasksExpanded, setIsOpenTasksExpanded] = useState(true)
  const [isDoneTasksExpanded, setIsDoneTasksExpanded] = useState(true)
  const [isDateOpen, setIsDateOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"Day" | "Week" | "Month">("Day")
  const [taskView, setTaskView] = useState<"my-tasks" | "tasks-i-made">("my-tasks")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSortCategory, setSelectedSortCategory] = useState("Date")
  const [isViewTasksSheetVisible, setIsViewTasksSheetVisible] = useState(false)
  const [currentViewMode, setCurrentViewMode] = useState<"list" | "calendar">("list")
  const [isDateSortSheetVisible, setIsDateSortSheetVisible] = useState(false)
  const [selectedDateSortOption, setSelectedDateSortOption] = useState("due-earliest")
  const [selectedDateRange, setSelectedDateRange] = useState<{ start: Date; end: Date } | null>(null)
  const [isStatusSheetVisible, setIsStatusSheetVisible] = useState(false)
  const [statusFilters, setStatusFilters] = useState<string[]>([])
  const [isLabelSheetVisible, setIsLabelSheetVisible] = useState(false)
  const [labelFilters, setLabelFilters] = useState<string[]>([])
  const [isCreatorSheetVisible, setIsCreatorSheetVisible] = useState(false)
  const [creatorFilters, setCreatorFilters] = useState<string[]>([])
  const [isAssigneeSheetVisible, setIsAssigneeSheetVisible] = useState(false)
  const [assigneeFilters, setAssigneeFilters] = useState<string[]>([])
  const [isOverdueModalVisible, setIsOverdueModalVisible] = useState(false)

  // Use imported dummy tasks
  const [tasks, setTasks] = useState(DUMMY_TASKS)

  const toggleTask = (id: string | number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === String(id) ? { ...task, completed: !task.completed, status: task.completed ? "open" : "done" } : task
      )
    )
  }

  // Apply filters and sorting
  const filteredTasks = useMemo(() => {
    let result = [...tasks]

    // 1. Search by title
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(task => 
        task.title.toLowerCase().includes(query)
      )
    }

    // 2. Filter by Status
    if (statusFilters.length > 0) {
      result = result.filter(task => 
        statusFilters.includes(task.status)
      )
    }

    // 3. Filter by Label (at least one matching label)
    if (labelFilters.length > 0) {
      result = result.filter(task => 
        task.labels && task.labels.some(label => labelFilters.includes(label))
      )
    }

    // 4. Filter by Assignee
    if (assigneeFilters.length > 0) {
      result = result.filter(task => 
        assigneeFilters.includes(task.assigneeId)
      )
    }

    // 5. Filter by Creator
    if (creatorFilters.length > 0) {
      result = result.filter(task => 
        creatorFilters.includes(task.creatorId)
      )
    }

    // 6. Filter by Date Range
    if (selectedDateRange) {
      result = result.filter(task => {
        if (!task.dueTime) return false
        const taskDueDate = new Date(task.dueTime)
        const startDate = new Date(selectedDateRange.start)
        startDate.setHours(0, 0, 0, 0)
        const endDate = new Date(selectedDateRange.end)
        endDate.setHours(23, 59, 59, 999)
        return taskDueDate >= startDate && taskDueDate <= endDate
      })
    }

    // 7. Sort
    result.sort((a, b) => {
      switch (selectedDateSortOption) {
        case "due-earliest":
          // Sort by due date ascending (earliest first)
          if (!a.dueTime) return 1
          if (!b.dueTime) return -1
          return new Date(a.dueTime).getTime() - new Date(b.dueTime).getTime()
        
        case "due-latest":
          // Sort by due date descending (latest first)
          if (!a.dueTime) return 1
          if (!b.dueTime) return -1
          return new Date(b.dueTime).getTime() - new Date(a.dueTime).getTime()
        
        case "created-newest":
          // Sort by creation date descending (newest first)
          if (!a.createdAt) return 1
          if (!b.createdAt) return -1
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        
        case "created-oldest":
          // Sort by creation date ascending (oldest first)
          if (!a.createdAt) return 1
          if (!b.createdAt) return -1
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        
        default:
          return 0
      }
    })

    return result
  }, [tasks, searchQuery, statusFilters, labelFilters, assigneeFilters, creatorFilters, selectedDateRange, selectedDateSortOption])

  const openTasks = filteredTasks.filter((task) => !task.completed)
  const completedTasks = filteredTasks.filter((task) => task.completed)

  // Calculate actual overdue tasks
  const overdueTasks = tasks.filter(task => {
    if (!task.dueTime) return false
    const dueDate = new Date(task.dueTime)
    const now = new Date()
    return dueDate < now && task.status !== 'done'
  })
  const hasOverdueTasks = overdueTasks.length > 0

  // Date navigation functions
  const goToPreviousDay = () => {
    const newDate = new Date(currentDate)
    if (viewMode === "Week") {
      newDate.setDate(newDate.getDate() - 7)
    } else if (viewMode === "Month") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      // Day mode
      newDate.setDate(newDate.getDate() - 1)
    }
    setCurrentDate(newDate)
  }

  const goToNextDay = () => {
    const newDate = new Date(currentDate)
    if (viewMode === "Week") {
      newDate.setDate(newDate.getDate() + 7)
    } else if (viewMode === "Month") {
      newDate.setMonth(newDate.getMonth() + 1)
    } else {
      // Day mode
      newDate.setDate(newDate.getDate() + 1)
    }
    setCurrentDate(newDate)
  }

  // Date formatting functions
  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
    }
    return date.toLocaleDateString("en-US", options)
  }

  const getWeekRange = (date: Date) => {
    const start = new Date(date)
    const day = start.getDay()
    const diff = start.getDate() - day
    start.setDate(diff)
    
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    
    const formatShort = (d: Date) => {
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
    
    return `${formatShort(start)} - ${formatShort(end)}`
  }

  const getMonthRange = (date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1)
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    
    const formatShort = (d: Date) => {
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
    
    return `${formatShort(start)} - ${formatShort(end)}`
  }

  const getDateDisplayText = () => {
    if (viewMode === "Week") {
      return getWeekRange(currentDate)
    }
    if (viewMode === "Month") {
      return getMonthRange(currentDate)
    }
    // Day mode
    if (isToday(currentDate)) {
      return "Today"
    }
    return formatDate(currentDate)
  }

  // Handler to open Date Sort sheet from View Tasks sheet
  const handleOpenDateSort = () => {
    setIsViewTasksSheetVisible(false)
    setIsDateSortSheetVisible(true)
  }

  // Handler to open Status Filter sheet from View Tasks sheet
  const handleOpenStatusFilter = () => {
    setIsViewTasksSheetVisible(false)
    setIsStatusSheetVisible(true)
  }

  // Handler to open Label Filter sheet from View Tasks sheet
  const handleOpenLabelFilter = () => {
    setIsViewTasksSheetVisible(false)
    setIsLabelSheetVisible(true)
  }

  // Handler to open Creator Filter sheet from View Tasks sheet
  const handleOpenCreatorFilter = () => {
    setIsViewTasksSheetVisible(false)
    setIsCreatorSheetVisible(true)
  }

  // Handler to open Assignee Filter sheet from View Tasks sheet
  const handleOpenAssigneeFilter = () => {
    setIsViewTasksSheetVisible(false)
    setIsAssigneeSheetVisible(true)
  }

  // Handler to go back from sub-sheets to View Tasks sheet
  const handleBackToViewTasks = () => {
    setIsDateSortSheetVisible(false)
    setIsStatusSheetVisible(false)
    setIsLabelSheetVisible(false)
    setIsCreatorSheetVisible(false)
    setIsAssigneeSheetVisible(false)
    setIsViewTasksSheetVisible(true)
  }

  // Handler to close all sheets
  const handleCloseAllSheets = () => {
    setIsViewTasksSheetVisible(false)
    setIsDateSortSheetVisible(false)
    setIsStatusSheetVisible(false)
    setIsLabelSheetVisible(false)
    setIsCreatorSheetVisible(false)
    setIsAssigneeSheetVisible(false)
  }
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Upper Control Bar - Task View Toggle / Search */}
      <div className="bg-white px-4 py-4 flex items-center gap-2">
        {/* Back arrow */}
        <button onClick={() => router.back()} className="h-auto p-3 shrink-0 flex items-center justify-center">
          <ChevronLeft size={24} strokeWidth={3} />
        </button>

        {!isSearchOpen ? (
          <>
            {/* Task View Toggle - default state */}
            <div className="flex gap-2 bg-gray-200 rounded-full p-1 flex-1 min-w-0 h-12">
              <button
                onClick={() => setTaskView("my-tasks")}
                className={`flex-1 px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  taskView === "my-tasks"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                My tasks
              </button>
              <button
                onClick={() => setTaskView("tasks-i-made")}
                className={`flex-1 px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  taskView === "tasks-i-made"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Tasks I made
              </button>
            </div>

            {/* Right side icons - default state */}
            <div className="flex items-center gap-1 shrink-0">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="h-auto p-3 bg-gray-100 rounded-full hover:bg-gray-200 flex items-center justify-center"
              >
                <Search size={24} />
              </button>
              {/* Only show AlertTriangle if there are overdue tasks */}
              {hasOverdueTasks && (
                <button 
                  onClick={() => setIsOverdueModalVisible(true)}
                  className="h-auto p-3 bg-gray-100 rounded-full hover:bg-gray-200 flex items-center justify-center"
                >
                  <AlertTriangle size={24} className="text-red-600" />
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Search mode - expanded search box */}
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 gap-3 flex-1 min-w-0 h-12">
              <Search size={20} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-gray-900 placeholder:text-gray-400 outline-none text-sm"
                autoFocus
              />
            </div>

            {/* Close button */}
            <button
              onClick={() => {
                setIsSearchOpen(false)
                setSearchQuery("")
              }}
              className="text-blue-500 font-medium text-base px-2 shrink-0"
            >
              Close
            </button>
          </>
        )}
      </div>

      {/* Lower Control Bar - Date Range Selector */}
      <div className="bg-white px-4 py-4 flex items-center gap-2 border-b">
        {/* View Tasks icon */}
        <button 
          onClick={() => setIsViewTasksSheetVisible(true)}
          className="h-auto p-3 bg-gray-100 rounded-full hover:bg-gray-200 flex items-center justify-center shrink-0"
        >
          <SlidersHorizontal size={24} />
        </button>

        {/* Date Range Selector with Popover */}
        <div className="flex items-center bg-gray-100 rounded-full px-3 py-2 gap-2 flex-1 min-w-0 h-12">
          <button onClick={goToPreviousDay} className="h-auto p-3 shrink-0 flex items-center justify-center">
            <ChevronLeft size={24} />
          </button>
          
          <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
            <PopoverTrigger asChild>
              <button className="text-sm text-gray-600 whitespace-nowrap flex-1 text-center hover:text-gray-900 transition-colors">
                {getDateDisplayText()}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <div className="p-3 bg-gray-100">
                <div className="flex gap-2 bg-gray-200 rounded-lg p-1">
                  {(["Day", "Week", "Month"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                        viewMode === mode
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={(date) => {
                  if (date) {
                    setCurrentDate(date)
                    setIsDateOpen(false)
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <button onClick={goToNextDay} className="h-auto p-3 shrink-0 flex items-center justify-center">
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Bell icon - moved from upper bar */}
        <button 
          onClick={() => router.push('/notifications')}
          className="h-auto p-3 bg-gray-100 rounded-full hover:bg-gray-200 flex items-center justify-center"
        >
          <Bell size={24} />
        </button>
      </div>

      {/* Conditional Rendering: Calendar View or List View */}
      {currentViewMode === "calendar" ? (
        <CalendarAgendaView
          tasks={filteredTasks}
          onCreateTask={() => alert("Open New Task Modal")}
          currentDate={currentDate}
          viewMode={viewMode}
          onPreviousRange={goToPreviousDay}
          onNextRange={goToNextDay}
          onDateSelect={(date) => {
            setCurrentDate(date)
            setCurrentViewMode("list")
          }}
        />
      ) : (
        <>
          {/* Tasks Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {/* Open Tasks Section */}
        <div className="space-y-3">
          <button
            onClick={() => setIsOpenTasksExpanded(!isOpenTasksExpanded)}
            className="flex items-center gap-2 text-blue-500 font-semibold text-lg w-full"
          >
            <span>Open tasks ({openTasks.length})</span>
            <ChevronDown
              className={`h-5 w-5 transition-transform duration-200 ${
                isOpenTasksExpanded ? "" : "-rotate-90"
              }`}
            />
          </button>

          {isOpenTasksExpanded && openTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 min-h-[68px] flex items-center justify-between cursor-pointer"
              onClick={() => toggleTask(task.id)}
            >
              <div className="flex-1">
                <h3 className={`font-semibold text-base mb-1 ${task.completed ? "line-through text-gray-400" : ""}`}>
                  {task.title}
                </h3>
                <p className={`text-sm ${task.completed ? "text-gray-400" : "text-red-400"}`}>
                  {task.subtitle}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {task.priority && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-600 hover:bg-orange-100 px-3 py-1">
                    {task.priority}
                  </Badge>
                )}
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>

        {/* Done Tasks Section */}
        <div className="space-y-3">
          <button
            onClick={() => setIsDoneTasksExpanded(!isDoneTasksExpanded)}
            className="flex items-center gap-2 text-gray-400 font-semibold text-lg w-full"
          >
            <span>Done tasks ({completedTasks.length})</span>
            <ChevronDown
              className={`h-5 w-5 transition-transform duration-200 ${
                isDoneTasksExpanded ? "" : "-rotate-90"
              }`}
            />
          </button>

          {isDoneTasksExpanded && completedTasks.map((task) => (
            <div
              key={task.id}
              className="bg-green-50 rounded-lg p-4 shadow-sm border border-gray-200 min-h-[68px] flex items-center justify-between cursor-pointer"
              onClick={() => toggleTask(task.id)}
            >
              <div className="flex-1">
                <h3 className="font-semibold text-base mb-1 line-through text-gray-400">
                  {task.title}
                </h3>
                <p className="text-sm text-gray-400">{task.subtitle}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

          {/* Create Task Button */}
          <div className="p-4 bg-white border-t">
            <Button
              onClick={() => alert("Open New Task Modal")}
              className="w-full h-14 rounded-full bg-cyan-400 hover:bg-cyan-500 text-white text-base font-medium"
            >
              Create task
            </Button>
          </div>
        </>
      )}

      {/* View Tasks Bottom Sheet */}
      <ViewTasksSheet
        isVisible={isViewTasksSheetVisible}
        onClose={() => setIsViewTasksSheetVisible(false)}
        currentViewMode={currentViewMode}
        onChangeViewMode={setCurrentViewMode}
        activeSortCategory={selectedSortCategory}
        onSelectSortCategory={setSelectedSortCategory}
        onOpenDateSort={handleOpenDateSort}
        onOpenStatusFilter={handleOpenStatusFilter}
        onOpenLabelFilter={handleOpenLabelFilter}
        onOpenCreatorFilter={handleOpenCreatorFilter}
        onOpenAssigneeFilter={handleOpenAssigneeFilter}
      />

      {/* Sort by Date Bottom Sheet */}
      <SortDateSheet
        isVisible={isDateSortSheetVisible}
        onClose={handleCloseAllSheets}
        onBack={handleBackToViewTasks}
        activeSortOption={selectedDateSortOption}
        onSelectSortOption={setSelectedDateSortOption}
        selectedRange={selectedDateRange}
        onApplyRange={setSelectedDateRange}
      />

      {/* Sort by Status Bottom Sheet */}
      <SortStatusSheet
        isVisible={isStatusSheetVisible}
        onClose={handleCloseAllSheets}
        onBack={handleBackToViewTasks}
        activeFilters={statusFilters}
        onApplyFilters={setStatusFilters}
      />

      {/* Sort by Label Bottom Sheet */}
      <SortLabelSheet
        isVisible={isLabelSheetVisible}
        onClose={handleCloseAllSheets}
        onBack={handleBackToViewTasks}
        availableLabels={availableLabels}
        activeLabelIds={labelFilters}
        onApplyFilters={setLabelFilters}
      />

      {/* Sort by Creator Bottom Sheet */}
      <SortUserSheet
        isVisible={isCreatorSheetVisible}
        onClose={handleCloseAllSheets}
        onBack={handleBackToViewTasks}
        title="Filter by Creator"
        users={creatorUsers}
        activeUserIds={creatorFilters}
        onApplyFilters={setCreatorFilters}
        currentUserId={currentUserId}
      />

      {/* Sort by Assignee Bottom Sheet */}
      <SortUserSheet
        isVisible={isAssigneeSheetVisible}
        onClose={handleCloseAllSheets}
        onBack={handleBackToViewTasks}
        title="Filter by Assignee"
        users={allUsers}
        activeUserIds={assigneeFilters}
        onApplyFilters={setAssigneeFilters}
        currentUserId={currentUserId}
      />

      {/* Overdue Tasks Modal */}
      <OverdueTasksModal
        isVisible={isOverdueModalVisible}
        onClose={() => setIsOverdueModalVisible(false)}
        tasks={tasks}
        onMarkDone={toggleTask}
        currentUserId={currentUserId}
      />
    </div>
  )
}

