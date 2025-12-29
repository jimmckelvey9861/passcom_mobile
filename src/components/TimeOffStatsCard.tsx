import { TimeOffStats } from "@/types/timeOff"

interface TimeOffStatsCardProps {
  stats: TimeOffStats
}

export default function TimeOffStatsCard({ stats }: TimeOffStatsCardProps) {
  const percentUsed = stats.totalDaysAllowed > 0 
    ? (stats.totalDaysUsed / stats.totalDaysAllowed) * 100 
    : 0

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      {/* Top Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-600">
            {stats.pending}
          </div>
          <div className="text-xs text-gray-600 mt-1">Pending</div>
        </div>
        <div className="text-center border-l border-r border-gray-200">
          <div className="text-3xl font-bold text-green-600">
            {stats.approved}
          </div>
          <div className="text-xs text-gray-600 mt-1">Approved</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {stats.totalDaysUsed}
          </div>
          <div className="text-xs text-gray-600 mt-1">Days Used</div>
        </div>
      </div>
      
      {/* Progress Bar Section */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-700 mb-2">
          <span className="font-medium">Annual Allowance</span>
          <span className="font-semibold">
            {stats.totalDaysUsed} / {stats.totalDaysAllowed} days
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2 flex items-center justify-between">
          <span>
            {stats.remainingDays} {stats.remainingDays === 1 ? 'day' : 'days'} remaining
          </span>
          <span>
            {Math.round(percentUsed)}% used
          </span>
        </p>
      </div>
    </div>
  )
}

