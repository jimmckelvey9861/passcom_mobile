import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DocumentsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-4 py-4 flex items-center gap-4">
        <Link href="/profile">
          <Button variant="ghost" size="icon"><ChevronLeft className="h-6 w-6 text-blue-500" /></Button>
        </Link>
        <h1 className="text-lg font-semibold">Documents</h1>
      </div>
      <div className="p-8 text-center text-gray-500">Coming Soon</div>
    </div>
  )
}
