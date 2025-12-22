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
import SortTagSheet from "@/components/SortTagSheet"
import SortUserSheet from "@/components/SortUserSheet"
import CalendarAgendaView from "@/components/CalendarAgendaView"
import OverdueTasksModal from "@/components/OverdueTasksModal"
import { TaskCard } from "@/components/TaskCard"
import { DUMMY_TASKS, DUMMY_USERS, DUMMY_TAGS, CURRENT_USER_ID } from "@/data/dummyTasks"

// Helper function to format date
function formatTaskDate(dateString: string | Date): string {
  const date = new Date(dateString)
  const month = date.toLocaleString('en-US', { month: 'short' })
  const day = date.getDate()
  const time = date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  return `${month} ${day} ${time}`
}

export default function TasksPage() {
  const router = useRouter()

  // Use imported dummy data
  const availableTags = DUMMY_TAGS
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
  const [isTagSheetVisible, setIsTagSheetVisible] = useState(false)
  const [tagFilters, setTagFilters] = useState<string[]>([])
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

    // 3. Filter by Tag (at least one matching tag)
    if (tagFilters.length > 0) {
      result = result.filter(task => 
        task.tags && task.tags.some(tag => tagFilters.includes(tag))
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
  }, [tasks, searchQuery, statusFilters, tagFilters, assigneeFilters, creatorFilters, selectedDateRange, selectedDateSortOption])

  const openTasks = filteredTasks.filter((task) => !task.completed)
  const completedTasks = filteredTasks.filter((task) => task.completed)

  // Calculate actual overdue tasks with strict validation (only MY tasks)
  const overdueTasks = useMemo(() => {
    const now = new Date()
    const filtered = tasks.filter(task => {
      // Validate dueTime exists
      if (!task.dueTime) {
        return false
      }
      
      // Parse and validate due date
      const dueDate = new Date(task.dueTime)
      if (isNaN(dueDate.getTime())) {
        console.warn('Invalid dueTime for task:', task.id, task.dueTime)
        return false
      }
      
      // Strictly check if task is not done
      const isDone = task.status?.toLowerCase() === 'done' || task.completed === true
      if (isDone) {
        return false
      }
      
      // Check if due date is in the past
      const isOverdue = dueDate.getTime() < now.getTime()
      
      // Only count tasks assigned to ME
      const isMyTask = task.assigneeId === currentUserId
      
      return isOverdue && isMyTask
    })
    
    console.log('Overdue Tasks Calculation (My Tasks Only):', {
      totalTasks: tasks.length,
      myOverdueCount: filtered.length,
      currentUserId: currentUserId,
      now: now.toISOString(),
      myOverdueTasks: filtered.map(t => ({
        id: t.id,
        title: t.title,
        dueTime: t.dueTime,
        status: t.status,
        completed: t.completed,
        assigneeId: t.assigneeId
      }))
    })
    
    return filtered
  }, [tasks, currentUserId])
  
  const hasOverdueTasks = overdueTasks.length > 0

  // Calculate filter counts for sub-menus
  const filterCounts = useMemo(() => {
    const statusCounts: Record<string, number> = {}
    const tagCounts: Record<string, number> = {}
    const assigneeCounts: Record<string, number> = {}
    const creatorCounts: Record<string, number> = {}

    tasks.forEach(task => {
      // Count by status
      if (task.status) {
        statusCounts[task.status] = (statusCounts[task.status] || 0) + 1
      }

      // Count by tags
      if (task.tags && Array.isArray(task.tags)) {
        task.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      }

      // Count by assignee
      if (task.assigneeId) {
        assigneeCounts[task.assigneeId] = (assigneeCounts[task.assigneeId] || 0) + 1
      }

      // Count by creator
      if (task.creatorId) {
        creatorCounts[task.creatorId] = (creatorCounts[task.creatorId] || 0) + 1
      }
    })

    return {
      status: statusCounts,
      tags: tagCounts,
      assignees: assigneeCounts,
      creators: creatorCounts
    }
  }, [tasks])

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

  // Handler to open Tag Filter sheet from View Tasks sheet
  const handleOpenTagFilter = () => {
    setIsViewTasksSheetVisible(false)
    setIsTagSheetVisible(true)
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
    setIsTagSheetVisible(false)
    setIsCreatorSheetVisible(false)
    setIsAssigneeSheetVisible(false)
    setIsViewTasksSheetVisible(true)
  }

  // Handler to close all sheets
  const handleCloseAllSheets = () => {
    setIsViewTasksSheetVisible(false)
    setIsDateSortSheetVisible(false)
    setIsStatusSheetVisible(false)
    setIsTagSheetVisible(false)
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
            <TaskCard
              key={task.id}
              title={task.title}
              startDate={formatTaskDate(task.startTime)}
              dueDate={formatTaskDate(task.dueTime)}
              status={task.status}
              onClick={() => alert(`Open task details for: ${task.title}`)}
            />
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
            <TaskCard
              key={task.id}
              title={task.title}
              startDate={formatTaskDate(task.startTime)}
              dueDate={formatTaskDate(task.dueTime)}
              status={task.status}
              onClick={() => alert(`Open task details for: ${task.title}`)}
            />
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
        onOpenTagFilter={handleOpenTagFilter}
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
        counts={filterCounts.status}
      />

      {/* Sort by Tag Bottom Sheet */}
      <SortTagSheet
        isVisible={isTagSheetVisible}
        onClose={handleCloseAllSheets}
        onBack={handleBackToViewTasks}
        availableTags={availableTags}
        activeTagIds={tagFilters}
        onApplyFilters={setTagFilters}
        counts={filterCounts.tags}
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
        counts={filterCounts.creators}
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
        counts={filterCounts.assignees}
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

