"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"
import { useEstablishmentTheme } from "@/contexts/EstablishmentThemeContext"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
  const { primaryColor } = useEstablishmentTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--establishment-color, #3b82f6)",
          "--normal-border": "var(--border)",
          "--success-bg": "var(--success-bg, var(--establishment-color, #3b82f6))",
          "--success-text": "var(--establishment-color, #3b82f6)",
          "--info-bg": "var(--info-bg, var(--establishment-color, #3b82f6))",
          "--info-text": "var(--establishment-color, #3b82f6)",
          "--error-bg": "var(--error-bg, #ef4444)",
          "--error-text": "var(--establishment-color, #3b82f6)",
          "--warning-bg": "var(--warning-bg, #f59e42)",
          "--warning-text": "var(--establishment-color, #3b82f6)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
