"use client"

import { Suspense, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  ChevronRight, 
  Camera, 
  Clock, 
  Repeat, 
  User, 
  DollarSign, 
  FileText, 
  Bell, 
  Settings, 
  Award 
} from "lucide-react"
import { MediaCropEditor } from "@/components/MediaCropEditor"
import { useGlobalApp } from "@/context/GlobalContext"

function ProfileContent() {
  const router = useRouter()
  const photoInputRef = useRef<HTMLInputElement>(null)
  const { profilePhoto, setProfilePhoto, userProfile } = useGlobalApp()
  
  // Editor state
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // Handle photo selection - open editor
  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Create local URL for the selected file
    const url = URL.createObjectURL(file)
    setSelectedImage(url)
    setIsEditorOpen(true)
    
    // Reset input
    event.target.value = ""
  }

  // Handle crop complete
  const handleCropComplete = (croppedImageUrl: string) => {
    setProfilePhoto(croppedImageUrl)
    setIsEditorOpen(false)
    setSelectedImage(null)
  }

  // Handle crop cancel
  const handleCropCancel = () => {
    setIsEditorOpen(false)
    setSelectedImage(null)
  }

  // Get initials from name
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={photoInputRef}
        onChange={handlePhotoSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Photo Editor Modal */}
      {selectedImage && (
        <MediaCropEditor
          isOpen={isEditorOpen}
          onClose={handleCropCancel}
          imageSrc={selectedImage}
          onCropComplete={handleCropComplete}
          cropShape="round"
          aspect={1}
        />
      )}

      {/* Header */}
      <div className="sticky top-0 bg-white border-b px-4 py-2 flex items-center gap-2 z-10 h-14">
        <button 
          className="h-12 w-12 rounded-full flex items-center justify-center hover:bg-blue-50 text-blue-600 transition-colors -ml-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-[30px] w-[30px]" strokeWidth={2.5} />
        </button>
        <h1 className="text-lg font-semibold flex-1">Profile</h1>
      </div>

      {/* Hero Section - Photo, Name, Title */}
      <div className="bg-white border-b px-4 py-8 text-center">
        {/* Avatar */}
        <button
          onClick={() => photoInputRef.current?.click()}
          className="relative w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 hover:opacity-90 transition-opacity group"
        >
          {profilePhoto ? (
            <img src={profilePhoto} alt="Profile" className="w-full h-full rounded-full object-cover" />
          ) : (
            getInitials(userProfile.name)
          )}
          {/* Camera Icon Overlay */}
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-8 w-8 text-white" strokeWidth={2} />
          </div>
        </button>
        
        {/* Name */}
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{userProfile.name}</h1>
        
        {/* Role */}
        <p className="text-sm text-gray-500">Shift Lead • Level 3</p>
      </div>

      {/* Section: Requests */}
      <div className="mt-6">
        <h2 className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Requests</h2>
        <div className="bg-white border-y border-gray-100 divide-y divide-gray-100">
          {/* Time Off */}
          <button 
            onClick={() => router.push('/profile/requests/time-off')}
            className="flex items-center justify-between px-4 py-4 w-full hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-base font-medium text-gray-900">Time Off</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>

          {/* Shift Swaps */}
          <button 
            onClick={() => router.push('/profile/requests/swaps')}
            className="flex items-center justify-between px-4 py-4 w-full hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                <Repeat className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-base font-medium text-gray-900">Shift Swaps</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Section: Account */}
      <div className="mt-6">
        <h2 className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Account</h2>
        <div className="bg-white border-y border-gray-100 divide-y divide-gray-100">
          {/* Personal Info */}
          <button 
            onClick={() => router.push('/profile/personal-info')}
            className="flex items-center justify-between px-4 py-4 w-full hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-base font-medium text-gray-900">Personal Info</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>

          {/* Pay */}
          <button 
            onClick={() => router.push('/profile/pay')}
            className="flex items-center justify-between px-4 py-4 w-full hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-base font-medium text-gray-900">Pay</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>

          {/* Documents */}
          <button 
            onClick={() => router.push('/profile/documents')}
            className="flex items-center justify-between px-4 py-4 w-full hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-base font-medium text-gray-900">Documents</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Section: App */}
      <div className="mt-6">
        <h2 className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wide">App</h2>
        <div className="bg-white border-y border-gray-100 divide-y divide-gray-100">
          {/* Notifications */}
          <button 
            onClick={() => router.push('/profile/notifications')}
            className="flex items-center justify-between px-4 py-4 w-full hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                <Bell className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-base font-medium text-gray-900">Notifications</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>

          {/* Settings */}
          <button 
            onClick={() => router.push('/profile/settings')}
            className="flex items-center justify-between px-4 py-4 w-full hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center">
                <Settings className="h-5 w-5 text-gray-600" />
              </div>
              <span className="text-base font-medium text-gray-900">Settings</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Version */}
      <div className="mt-6 px-4 text-center">
        <p className="text-sm text-gray-400">Version 1.0.0</p>
      </div>

      {/* Switch to Manager View */}
      <div className="mt-4 px-4 pb-6">
        <button 
          onClick={() => router.push('/admin')}
          className="flex items-center justify-between w-full bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl px-5 py-4 shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <Award className="h-6 w-6 text-white" strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <span className="text-base font-bold text-white block">Switch to Manager View</span>
              <span className="text-xs text-white/80 mt-0.5 block">Dashboard, team, schedule & more</span>
            </div>
          </div>
          <ChevronRight className="h-6 w-6 text-white" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileContent />
    </Suspense>
  )
}
