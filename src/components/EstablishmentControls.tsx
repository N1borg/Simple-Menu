'use client'

import { EstablishmentInfoManager } from '@/components/EstablishmentInfoManager'
import { OpeningHoursManager } from '@/components/OpeningHoursManager'

interface EstablishmentControlsProps {
  slug: string
  primaryColor?: string
  isDemo?: boolean
  openingHoursData: any // Accept opening_hours directly
}

export function EstablishmentControls({ slug, primaryColor, isDemo = false, openingHoursData }: EstablishmentControlsProps) {
  return (
    <div className="space-y-2">
      <EstablishmentInfoManager
        slug={slug}
        primaryColor={primaryColor}
        isDemo={isDemo}
      />
      <OpeningHoursManager
        slug={slug}
        primaryColor={primaryColor}
        isDemo={isDemo}
        openingHoursData={openingHoursData}
      />
    </div>
  )
}

export default EstablishmentControls
