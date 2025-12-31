"use client"

import { Suspense, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Plus, Search, Megaphone, Users, MessageCircle, X } from "lucide-react"

type TabType = "channels" | "direct"

function ChatInboxContent() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<TabType>("direct")
  const [isNewMessageSheetOpen, setIsNewMessageSheetOpen] = useState(false)

  // Mock data
  const channels = [
    {
      id: "1",
      name: "📢 Announcements",
      icon: Megaphone,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      lastMessage: "Holiday hours update...",
      timestamp: "2h ago",
      unread: false,
    },
    {
      id: "2",
      name: "☕️ Barista Team",
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      lastMessage: "Mike: Who closed last night?",
      timestamp: "4h ago",
      unread: false,
    },
  ]

  const directMessages = [
    {
      id: "3",
      name: "Sarah (Manager)",
      avatar: "SM",
      lastMessage: "Approved your time off request.",
      timestamp: "1h ago",
      unread: true,
    },
    {
      id: "4",
      name: "Mike Johnson",
      avatar: "MJ",
      lastMessage: "Thanks for covering!",
      timestamp: "3h ago",
      unread: false,
    },
    {
      id: "5",
      name: "Liz Carter",
      avatar: "LC",
      lastMessage: "See you tomorrow.",
      timestamp: "Yesterday",
      unread: false,
    },
  ]

  // Suggested people for new message sheet
  const suggestedPeople = [
    { id: "3", name: "Sarah (Manager)", avatar: "SM", role: "Manager" },
    { id: "4", name: "Mike Johnson", avatar: "MJ", role: "Barista" },
    { id: "5", name: "Liz Carter", avatar: "LC", role: "Shift Lead" },
  ]

  // Check for unread messages
  const hasUnreadChannels = channels.some((c) => c.unread)
  const hasUnreadDMs = directMessages.some((dm) => dm.unread)

  const handleNavigateToChat = (chatId: string) => {
    router.push(`/chat/${chatId}`)
    setIsNewMessageSheetOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b px-4 py-2 flex items-center gap-2 z-10 h-14">
        <button
          onClick={() => router.push("/")}
          className="h-10 w-10 -ml-2 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-700 transition-colors"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 flex-1">Messages</h1>
        <button
          onClick={() => setIsNewMessageSheetOpen(true)}
          className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-blue-600 transition-colors"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search people or channels"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Segmented Control (Tabs) */}
      <div className="bg-white border-b px-4 py-3">
        <div className="bg-gray-100 rounded-lg p-1 flex gap-1">
          <button
            onClick={() => setActiveTab("channels")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all relative ${
              activeTab === "channels"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Users className="h-4 w-4" strokeWidth={2.5} />
            <span>Channels</span>
            {hasUnreadChannels && (
              <div className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("direct")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all relative ${
              activeTab === "direct"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <MessageCircle className="h-4 w-4" strokeWidth={2.5} />
            <span>Direct Messages</span>
            {hasUnreadDMs && (
              <div className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto pb-6">
        {/* Channels Tab */}
        {activeTab === "channels" && (
          <div className="mt-6">
            <div className="bg-white border-y border-gray-100 divide-y divide-gray-100">
              {channels.map((channel) => {
                const Icon = channel.icon
                return (
                  <button
                    key={channel.id}
                    onClick={() => handleNavigateToChat(channel.id)}
                    className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div
                      className={`h-12 w-12 rounded-full ${channel.iconBg} flex items-center justify-center shrink-0`}
                    >
                      <Icon className={`h-6 w-6 ${channel.iconColor}`} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base font-semibold text-gray-900 truncate">
                          {channel.name}
                        </span>
                        <span className="text-xs text-gray-500 shrink-0 ml-2">
                          {channel.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{channel.lastMessage}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Direct Messages Tab */}
        {activeTab === "direct" && (
          <div className="mt-6">
            <div className="bg-white border-y border-gray-100 divide-y divide-gray-100">
              {directMessages.map((dm) => (
                <button
                  key={dm.id}
                  onClick={() => handleNavigateToChat(dm.id)}
                  className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors text-left relative"
                >
                  {/* Unread indicator */}
                  {dm.unread && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-600" />
                  )}

                  {/* Avatar */}
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                    <span className="text-white text-sm font-bold">{dm.avatar}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-base truncate ${
                          dm.unread ? "font-semibold text-gray-900" : "font-medium text-gray-900"
                        }`}
                      >
                        {dm.name}
                      </span>
                      <span className="text-xs text-gray-500 shrink-0 ml-2">{dm.timestamp}</span>
                    </div>
                    <p
                      className={`text-sm truncate ${
                        dm.unread ? "font-medium text-gray-900" : "text-gray-600"
                      }`}
                    >
                      {dm.lastMessage}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* New Message Bottom Sheet */}
      {isNewMessageSheetOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
            onClick={() => setIsNewMessageSheetOpen(false)}
          />

          {/* Sheet */}
          <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl z-50 animate-in slide-in-from-bottom duration-300 max-h-[80vh] flex flex-col">
            {/* Sheet Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">New Message</h2>
              <button
                onClick={() => setIsNewMessageSheetOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Sheet Content */}
            <div className="flex-1 overflow-auto">
              <div className="px-4 py-3">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                  Suggested People
                </h3>
                <div className="space-y-1">
                  {suggestedPeople.map((person) => (
                    <button
                      key={person.id}
                      onClick={() => handleNavigateToChat(person.id)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                        <span className="text-white text-sm font-bold">{person.avatar}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-medium text-gray-900 truncate">
                          {person.name}
                        </p>
                        <p className="text-sm text-gray-500">{person.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function ChatInboxPage() {
  return (
    <Suspense fallback={null}>
      <ChatInboxContent />
    </Suspense>
  )
}
