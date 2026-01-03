'use client'

import Link from "next/link"
import { ChevronLeft, User, Home, Mail, Phone, Shirt, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function MyInfoPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 flex items-center gap-4 sticky top-0 z-10">
        <Link href="/profile">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <ChevronLeft className="h-6 w-6 text-blue-500" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold flex-1">My Info</h1>
      </div>

      {/* Content */}
      <div className="py-4 space-y-6">
        {/* Personal Section */}
        <div className="bg-white border-y border-gray-200">
          <div className="px-6 py-3 border-b border-gray-100">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Personal</h2>
          </div>
          <InfoRow icon={User} label="Name" value="Jim McKelvey" />
          <InfoRow icon={Home} label="Address" value="123 Main St, New York, NY 10001" />
          <InfoRow icon={Mail} label="Email" value="jim@example.com" badge="Verified" />
          <InfoRow icon={Phone} label="Mobile" value="(555) 123-4567" badge="Verified" />
        </div>

        {/* Uniform Sizes Section */}
        <div className="bg-white border-y border-gray-200">
          <div className="px-6 py-3 border-b border-gray-100">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Uniform Sizes</h2>
          </div>
          <InfoRow icon={Shirt} label="Shirt" value="L" />
          <InfoRow icon={Shirt} label="Pants" value="32" />
          <InfoRow icon={Shirt} label="Shoe" value="10.5" />
        </div>

        {/* Location Section */}
        <div className="bg-white border-y border-gray-200">
          <div className="px-6 py-3 border-b border-gray-100">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</h2>
          </div>
          <InfoRow icon={Building2} label="Primary" value="Chelsea Market" />
        </div>

        {/* Emergency Contact Section */}
        <div className="bg-white border-y border-gray-200">
          <div className="px-6 py-3 border-b border-gray-100">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Emergency Contact</h2>
          </div>
          <InfoRow icon={User} label="Name" value="Emergency Contact" />
          <InfoRow icon={Phone} label="Phone" value="(555) 987-6543" />
          <InfoRow icon={User} label="Relationship" value="Spouse" />
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value, badge }: any) {
  return (
    <div className="flex items-start gap-3 px-6 py-4 border-b border-gray-100 last:border-0">
      <Icon className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-base text-gray-900 font-medium">{value}</p>
          {badge && (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full">
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
