"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  progressColor?: string
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, progressColor, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-gray-200",
        className
      )}
      {...props}
    >
      <div
        className="h-full transition-all duration-300 ease-in-out"
        style={{ 
          width: `${Math.min(Math.max(value || 0, 0), 100)}%`,
          backgroundColor: progressColor || '#3b82f6' // Default to blue-600
        }}
      />
    </div>
  )
)
Progress.displayName = "Progress"

export { Progress }
