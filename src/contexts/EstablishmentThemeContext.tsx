'use client'

import { createContext, useContext, ReactNode, useEffect } from 'react'
import { getEstablishmentColor } from '@/lib/utils'

interface EstablishmentThemeContextType {
  primaryColor: string
}

const EstablishmentThemeContext = createContext<EstablishmentThemeContextType | undefined>(undefined)

interface EstablishmentThemeProviderProps {
  children: ReactNode
  primaryColor?: string | null
}

export function EstablishmentThemeProvider({ children, primaryColor }: EstablishmentThemeProviderProps) {
  const normalizedColor = getEstablishmentColor(primaryColor)

  // Set the CSS variable globally on the document body
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.body.style.setProperty('--establishment-color', normalizedColor)
      document.body.style.setProperty('--establishment-color-20', normalizedColor + '33')
      document.body.style.setProperty('--establishment-color-10', normalizedColor + '1a')
      document.body.style.setProperty('--establishment-color-90', normalizedColor + 'e6')
    }
  }, [normalizedColor])

  return (
    <EstablishmentThemeContext.Provider value={{ primaryColor: normalizedColor }}>
      <div
        style={{
          '--establishment-color': normalizedColor,
          '--establishment-color-20': normalizedColor + '33',
          '--establishment-color-10': normalizedColor + '1a',
          '--establishment-color-90': normalizedColor + 'e6',
        } as React.CSSProperties}
      >
        {children}
      </div>
    </EstablishmentThemeContext.Provider>
  )
}

export function useEstablishmentTheme() {
  const context = useContext(EstablishmentThemeContext)
  if (context === undefined) {
    // Return default theme if not within provider
    return { primaryColor: getEstablishmentColor(null) }
  }
  return context
}
