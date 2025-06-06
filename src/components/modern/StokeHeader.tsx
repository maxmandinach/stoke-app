import * as React from "react"
import { cn } from "@/lib/utils"

interface StokeHeaderProps {
  title?: string;
  className?: string;
}

export default function StokeHeader({ title, className }: StokeHeaderProps) {
  return (
    <header 
      className={cn(
        // Base styles
        "sticky top-0 z-50 w-full bg-white border-b border-gray-200/80 backdrop-blur-md",
        // Height - responsive: 56px mobile, 64px desktop
        "h-14 md:h-16",
        // Shadow for depth
        "shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between h-full max-w-full px-4 md:px-6">
        {/* Left - Stoke Logo */}
        <div className="flex items-center">
          <h1 className="text-xl md:text-2xl font-bold font-sans text-gray-900 tracking-tight">
            Stoke
          </h1>
        </div>

        {/* Center - Page Title (optional) */}
        {title && (
          <div className="flex-1 flex justify-center">
            <h2 className="text-sm md:text-base font-medium font-sans text-gray-700 truncate max-w-xs md:max-w-md">
              {title}
            </h2>
          </div>
        )}

        {/* Right - User Avatar */}
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm ring-2 ring-white">
            <span className="text-xs font-semibold text-white font-sans">
              U
            </span>
          </div>
        </div>
      </div>
    </header>
  )
} 