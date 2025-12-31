"use client"

import { Suspense, useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Info,
  Plus,
  Send,
  Camera,
  Image as ImageIcon,
  Sticker,
  FileText,
  MapPin,
  UserRound,
  Link as LinkIcon,
  X,
  Video,
  ExternalLink,
  File,
} from "lucide-react"

// Message Type Definitions
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

type Message =
  | TextMessage
  | MediaMessage
  | FileMessage
  | LocationMessage
  | ContactMessage
  | LinkMessage

function ChatConversationContent() {
  const router = useRouter()
  const [messageText, setMessageText] = useState("")
  const [isAttachmentSheetOpen, setIsAttachmentSheetOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Messages state with initial mock data
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "them",
      type: "text",
      senderName: "Sarah",
      senderAvatar: "SM",
      text: "Hey Jim, can you come in 30 mins early tomorrow?",
      time: "2:34 PM",
    },
    {
      id: 2,
      sender: "me",
      type: "text",
      text: "Sure, no problem. Is it busy?",
      time: "2:35 PM",
    },
    {
      id: 3,
      sender: "them",
      type: "text",
      senderName: "Sarah",
      senderAvatar: "SM",
      text: "Yeah, huge rush just hit.",
      time: "2:36 PM",
    },
  ])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Generate unique ID for new messages
  const getNextId = () => Math.max(...messages.map((m) => m.id), 0) + 1

  // Text message sending
  const handleSendText = () => {
    if (messageText.trim()) {
      const newMessage: TextMessage = {
        id: getNextId(),
        sender: "me",
        type: "text",
        text: messageText.trim(),
        time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      }
      setMessages([...messages, newMessage])
      setMessageText("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendText()
    }
  }

  // Attachment handlers
  const handleSendPhoto = () => {
    const newMessage: MediaMessage = {
      id: getNextId(),
      sender: "me",
      type: "image",
      url: "https://placehold.co/600x400/3b82f6/ffffff/png?text=Photo",
      aspectRatio: 1.5,
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    }
    setMessages([...messages, newMessage])
    setIsAttachmentSheetOpen(false)
  }

  const handleSendVideo = () => {
    const newMessage: MediaMessage = {
      id: getNextId(),
      sender: "me",
      type: "video",
      url: "https://placehold.co/600x400/8b5cf6/ffffff/png?text=Video",
      aspectRatio: 1.5,
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    }
    setMessages([...messages, newMessage])
    setIsAttachmentSheetOpen(false)
  }

  const handleSendGIF = () => {
    const newMessage: MediaMessage = {
      id: getNextId(),
      sender: "me",
      type: "gif",
      url: "https://placehold.co/400x400/ec4899/ffffff/png?text=GIF",
      aspectRatio: 1,
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    }
    setMessages([...messages, newMessage])
    setIsAttachmentSheetOpen(false)
  }

  const handleSendDocument = () => {
    const newMessage: FileMessage = {
      id: getNextId(),
      sender: "me",
      type: "document",
      fileName: "Schedule_December.pdf",
      fileSize: "2.4 MB",
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    }
    setMessages([...messages, newMessage])
    setIsAttachmentSheetOpen(false)
  }

  const handleSendLocation = () => {
    const newMessage: LocationMessage = {
      id: getNextId(),
      sender: "me",
      type: "location",
      address: "Chelsea Market, 75 9th Ave, New York, NY 10011",
      mapImageUrl: "https://placehold.co/400x200/10b981/ffffff/png?text=Map",
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    }
    setMessages([...messages, newMessage])
    setIsAttachmentSheetOpen(false)
  }

  const handleSendContact = () => {
    const newMessage: ContactMessage = {
      id: getNextId(),
      sender: "me",
      type: "contact",
      name: "Mike Johnson",
      phoneNumber: "(555) 123-4567",
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    }
    setMessages([...messages, newMessage])
    setIsAttachmentSheetOpen(false)
  }

  const handleSendLink = () => {
    const newMessage: LinkMessage = {
      id: getNextId(),
      sender: "me",
      type: "link",
      url: "https://passcom.app/schedule",
      title: "December Schedule - Passcom",
      previewImageUrl: "https://placehold.co/400x200/6366f1/ffffff/png?text=Preview",
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    }
    setMessages([...messages, newMessage])
    setIsAttachmentSheetOpen(false)
  }

  // Render message based on type
  const renderMessage = (message: Message) => {
    const isMe = message.sender === "me"

    // Text Message
    if (message.type === "text") {
      return (
        <div
          className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
            isMe
              ? "bg-blue-500 text-white rounded-br-sm"
              : "bg-gray-100 text-gray-900 rounded-bl-sm"
          }`}
        >
          <p className="text-base leading-relaxed">{message.text}</p>
        </div>
      )
    }

    // Media Messages (Image, Video, GIF)
    if (message.type === "image" || message.type === "video" || message.type === "gif") {
      return (
        <div className="max-w-[75%] relative">
          <img
            src={message.url}
            alt={message.type}
            className="rounded-2xl w-full object-cover"
            style={{ aspectRatio: message.aspectRatio || 1 }}
          />
          {message.type === "video" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
                <Video className="h-8 w-8 text-white" fill="white" />
              </div>
            </div>
          )}
        </div>
      )
    }

    // Document Message
    if (message.type === "document") {
      return (
        <div
          className={`max-w-[75%] rounded-2xl p-3 flex items-center gap-3 ${
            isMe ? "bg-blue-500/20 border border-blue-500/30" : "bg-gray-100"
          }`}
        >
          <div
            className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
              isMe ? "bg-blue-500" : "bg-gray-300"
            }`}
          >
            <File className={`h-5 w-5 ${isMe ? "text-white" : "text-gray-600"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${isMe ? "text-blue-900" : "text-gray-900"}`}>
              {message.fileName}
            </p>
            <p className={`text-xs ${isMe ? "text-blue-700" : "text-gray-500"}`}>
              {message.fileSize}
            </p>
          </div>
        </div>
      )
    }

    // Location Message
    if (message.type === "location") {
      return (
        <div className="max-w-[75%]">
          <img
            src={message.mapImageUrl}
            alt="Location"
            className="rounded-t-2xl w-full object-cover"
          />
          <div
            className={`rounded-b-2xl p-3 flex items-center gap-2 ${
              isMe ? "bg-blue-500/20 border-x border-b border-blue-500/30" : "bg-gray-100"
            }`}
          >
            <MapPin
              className={`h-4 w-4 shrink-0 ${isMe ? "text-blue-600" : "text-gray-600"}`}
            />
            <p className={`text-sm ${isMe ? "text-blue-900" : "text-gray-900"}`}>
              {message.address}
            </p>
          </div>
        </div>
      )
    }

    // Contact Message
    if (message.type === "contact") {
      return (
        <div
          className={`max-w-[75%] rounded-2xl p-3 flex items-center gap-3 ${
            isMe ? "bg-blue-500/20 border border-blue-500/30" : "bg-gray-100"
          }`}
        >
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
              isMe ? "bg-blue-500" : "bg-gray-300"
            }`}
          >
            <UserRound className={`h-5 w-5 ${isMe ? "text-white" : "text-gray-600"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${isMe ? "text-blue-900" : "text-gray-900"}`}>
              {message.name}
            </p>
            <p className={`text-xs ${isMe ? "text-blue-700" : "text-gray-500"}`}>
              {message.phoneNumber}
            </p>
          </div>
        </div>
      )
    }

    // Link Message
    if (message.type === "link") {
      return (
        <div className="max-w-[75%]">
          <img
            src={message.previewImageUrl}
            alt="Link preview"
            className="rounded-t-2xl w-full object-cover"
          />
          <div
            className={`rounded-b-2xl p-3 ${
              isMe ? "bg-blue-500/20 border-x border-b border-blue-500/30" : "bg-gray-100"
            }`}
          >
            <p className={`text-sm font-medium mb-1 ${isMe ? "text-blue-900" : "text-gray-900"}`}>
              {message.title}
            </p>
            <div className="flex items-center gap-1">
              <ExternalLink
                className={`h-3 w-3 ${isMe ? "text-blue-600" : "text-gray-500"}`}
              />
              <p className={`text-xs truncate ${isMe ? "text-blue-700" : "text-gray-500"}`}>
                {message.url}
              </p>
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b px-4 py-2 flex items-center justify-between z-10 h-14">
        <button
          onClick={() => router.push("/chat")}
          className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-700 transition-colors -ml-2"
        >
          <ArrowLeft className="h-6 w-6" strokeWidth={2} />
        </button>

        <div className="flex-1 flex flex-col items-center">
          <span className="text-base font-bold text-gray-900">Sarah (Manager)</span>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs text-gray-500">Active now</span>
          </div>
        </div>

        <button
          onClick={() => console.log("Info clicked")}
          className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-700 transition-colors"
        >
          <Info className="h-6 w-6" strokeWidth={2} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-end gap-2 ${
              message.sender === "me" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar (only for incoming messages) */}
            {message.sender === "them" && message.senderAvatar && (
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">{message.senderAvatar}</span>
              </div>
            )}

            {/* Message Content */}
            {renderMessage(message)}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area (Sticky Bottom) */}
      <div className="sticky bottom-0 bg-white border-t px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Plus Button */}
          <button
            onClick={() => setIsAttachmentSheetOpen(true)}
            className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors shrink-0"
          >
            <Plus className="h-6 w-6" strokeWidth={2} />
          </button>

          {/* Input Field */}
          <input
            type="text"
            placeholder="Message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Send Button */}
          <button
            onClick={handleSendText}
            disabled={!messageText.trim()}
            className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
              messageText.trim()
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-200 text-gray-400"
            }`}
          >
            <Send className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Attachment Menu Bottom Sheet */}
      {isAttachmentSheetOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
            onClick={() => setIsAttachmentSheetOpen(false)}
          />

          {/* Sheet */}
          <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl z-50 animate-in slide-in-from-bottom duration-300">
            {/* Sheet Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">Send Attachment</h2>
              <button
                onClick={() => setIsAttachmentSheetOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Sheet Content - Attachment Grid */}
            <div className="p-6 grid grid-cols-4 gap-4">
              {/* Row 1 */}
              <button
                onClick={handleSendPhoto}
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
                  <Camera className="h-7 w-7 text-blue-600" strokeWidth={2} />
                </div>
                <span className="text-xs font-medium text-gray-700">Camera</span>
              </button>

              <button
                onClick={handleSendPhoto}
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center">
                  <ImageIcon className="h-7 w-7 text-purple-600" strokeWidth={2} />
                </div>
                <span className="text-xs font-medium text-gray-700">Photo</span>
              </button>

              <button
                onClick={handleSendGIF}
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="h-14 w-14 rounded-full bg-pink-100 flex items-center justify-center">
                  <Sticker className="h-7 w-7 text-pink-600" strokeWidth={2} />
                </div>
                <span className="text-xs font-medium text-gray-700">GIF</span>
              </button>

              <button
                onClick={handleSendDocument}
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="h-14 w-14 rounded-full bg-orange-100 flex items-center justify-center">
                  <FileText className="h-7 w-7 text-orange-600" strokeWidth={2} />
                </div>
                <span className="text-xs font-medium text-gray-700">Document</span>
              </button>

              {/* Row 2 */}
              <button
                onClick={handleSendLocation}
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                  <MapPin className="h-7 w-7 text-green-600" strokeWidth={2} />
                </div>
                <span className="text-xs font-medium text-gray-700">Location</span>
              </button>

              <button
                onClick={handleSendContact}
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="h-14 w-14 rounded-full bg-cyan-100 flex items-center justify-center">
                  <UserRound className="h-7 w-7 text-cyan-600" strokeWidth={2} />
                </div>
                <span className="text-xs font-medium text-gray-700">Contact</span>
              </button>

              <button
                onClick={handleSendLink}
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center">
                  <LinkIcon className="h-7 w-7 text-indigo-600" strokeWidth={2} />
                </div>
                <span className="text-xs font-medium text-gray-700">Link</span>
              </button>

              <button
                onClick={handleSendVideo}
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="h-14 w-14 rounded-full bg-violet-100 flex items-center justify-center">
                  <Video className="h-7 w-7 text-violet-600" strokeWidth={2} />
                </div>
                <span className="text-xs font-medium text-gray-700">Video</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function ChatConversationPage() {
  return (
    <Suspense fallback={null}>
      <ChatConversationContent />
    </Suspense>
  )
}
