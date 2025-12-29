"use client"

import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ReplacementRequestSentModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ReplacementRequestSentModal({
  isOpen,
  onClose,
}: ReplacementRequestSentModalProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[60] animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center">
              <Send className="h-10 w-10 text-teal-500" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-center mb-4">
            Replacement request sent
          </h2>

          {/* Main Message */}
          <p className="text-base text-gray-900 text-center mb-3 leading-relaxed">
            We will notify you when a teammate claims your shift and when your admin approves it.
          </p>

          {/* Secondary Message */}
          <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
            You will remain assigned to this shift until the request is fully approved
          </p>

          {/* Done Button */}
          <Button
            onClick={onClose}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-full"
          >
            Done
          </Button>
        </div>
      </div>
    </>
  )
}

