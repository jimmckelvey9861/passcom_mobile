"use client"

import { usePathname } from "next/navigation"
import { useGlobalApp } from "@/context/GlobalContext"
import BottomNav from "./BottomNav"

export default function ConditionalBottomNav() {
  const pathname = usePathname()
  const { isBottomSheetOpen } = useGlobalApp()
  
  // Hide on admin routes (they have their own AdminBottomNav)
  const isAdminRoute = pathname.startsWith('/admin')
  
  // Hide when bottom sheet is open or on admin routes
  if (isAdminRoute || isBottomSheetOpen) {
    return null
  }
  
  return <BottomNav />
}
