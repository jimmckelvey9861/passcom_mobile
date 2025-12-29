import { Calendar } from "lucide-react"
import { TimeOffRequest } from "@/types/timeOff"

interface TimeOffCardProps {
  request: TimeOffRequest
  onCancel?: (requestId: string) => void
}

const typeConfig = {
  vacation: { icon: '🏖️', label: 'Vacation', color: 'text-blue-600', bg: 'bg-blue-50' },
  sick: { icon: '🤒', label: 'Sick Leave', color: 'text-red-600', bg: 'bg-red-50' },
  personal: { icon: '👤', label: 'Personal', color: 'text-purple-600', bg: 'bg-purple-50' },
  other: { icon: '📄', label: 'Other', color: 'text-gray-600', bg: 'bg-gray-50' },
}

const statusConfig = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending', dot: 'bg-yellow-500' },
  approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved', dot: 'bg-green-500' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected', dot: 'bg-red-500' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelled', dot: 'bg-gray-500' },
}

export default function TimeOffCard({ request, onCancel }: TimeOffCardProps) {
  const typeInfo = typeConfig[request.type]
  const statusInfo = statusConfig[request.status]
  
  const formatDateRange = () => {
    const start = request.startDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: request.startDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })
    const end = request.endDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: request.endDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })
    
    if (request.totalDays === 1) {
      return start
    }
    
    return `${start} - ${end}`
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel(request.id)
    } else {
      console.log('Cancel request:', request.id)
      alert('Cancel functionality will be implemented with backend integration')
    }
  }

  return (
    <div className={`rounded-xl p-4 border-2 transition-all hover:shadow-md ${typeInfo.bg} border-gray-200`}>
      {/* Header: Type and Status */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{typeInfo.icon}</span>
          <span className={`text-base font-semibold ${typeInfo.color}`}>
            {typeInfo.label}
          </span>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${statusInfo.bg} ${statusInfo.text}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
          {statusInfo.label}
        </div>
      </div>
      
      {/* Date Range */}
      <div className="flex items-center gap-2 text-gray-800 mb-3">
        <Calendar className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium">{formatDateRange()}</span>
        <span className="text-sm text-gray-500">
          ({request.totalDays} {request.totalDays === 1 ? 'day' : 'days'})
        </span>
      </div>
      
      {/* Reason */}
      {request.reason && (
        <p className="text-sm text-gray-700 mb-3 leading-relaxed">
          {request.reason}
        </p>
      )}
      
      {/* Rejection Reason */}
      {request.status === 'rejected' && request.rejectionReason && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs font-semibold text-red-800 mb-1">
            Reason for rejection:
          </p>
          <p className="text-sm text-red-700">
            {request.rejectionReason}
          </p>
        </div>
      )}
      
      {/* Approved By */}
      {(request.status === 'approved' || request.status === 'rejected') && request.respondedBy && (
        <p className="text-xs text-gray-500 mt-2">
          {request.status === 'approved' ? 'Approved' : 'Rejected'} by {request.respondedBy}
          {request.respondedAt && ` on ${request.respondedAt.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })}`}
        </p>
      )}
      
      {/* Cancel Button (only for pending) */}
      {request.status === 'pending' && (
        <div className="mt-3 pt-3 border-t border-gray-300">
          <button
            onClick={handleCancel}
            className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline transition-colors"
          >
            Cancel Request
          </button>
        </div>
      )}
    </div>
  )
}

