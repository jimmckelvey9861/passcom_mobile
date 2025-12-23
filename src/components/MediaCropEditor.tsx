"use client"

import { useState, useCallback } from "react"
import Cropper from "react-easy-crop"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCroppedImg } from "@/lib/cropImage"

interface MediaCropEditorProps {
  isOpen: boolean
  onClose: () => void
  imageSrc: string
  onCropComplete: (croppedImageUrl: string) => void
}

export function MediaCropEditor({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
}: MediaCropEditorProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const onCropCompleteCallback = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const handleSaveCrop = async () => {
    if (!croppedAreaPixels) return

    try {
      setIsSaving(true)
      const croppedImageUrl = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation
      )
      onCropComplete(croppedImageUrl)
      onClose()
    } catch (error) {
      console.error("Error cropping image:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Header */}
      <div className="bg-black border-b border-gray-800 px-4 py-4 flex items-center justify-between">
        <h2 className="text-white text-lg font-semibold">Crop Image</h2>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-300 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Main Cropper Area */}
      <div className="flex-1 relative">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={undefined} // Free-form cropping
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropComplete={onCropCompleteCallback}
          objectFit="contain"
          style={{
            containerStyle: {
              backgroundColor: '#000',
            },
          }}
        />
      </div>

      {/* Footer Controls */}
      <div className="bg-black border-t border-gray-800 px-4 py-6 space-y-4">
        {/* Zoom Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-white text-sm">
            <span>Zoom</span>
            <span className="text-gray-400">{zoom.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="1"
            max="3"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Rotation Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-white text-sm">
            <span>Rotation</span>
            <span className="text-gray-400">{rotation}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 h-12 text-base border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveCrop}
            disabled={isSaving}
            className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 text-white text-base"
          >
            {isSaving ? "Saving..." : "Save Crop"}
          </Button>
        </div>
      </div>
    </div>
  )
}

