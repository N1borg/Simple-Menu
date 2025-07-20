'use client'

import { EstablishmentInfoManager } from './EstablishmentInfoManager'
import { OpeningHoursManager } from './OpeningHoursManager'

interface EstablishmentControlsProps {
  establishmentId: string
  slug: string
  primaryColor?: string
  isDemo?: boolean
}

export function EstablishmentControls({ establishmentId, slug, primaryColor, isDemo = false }: EstablishmentControlsProps) {
  return (
    <div className="space-y-2">
      <EstablishmentInfoManager 
        establishmentId={establishmentId} 
        slug={slug}
        primaryColor={primaryColor}
        isDemo={isDemo}
      />
      <OpeningHoursManager 
        establishmentId={establishmentId} 
        slug={slug}
        primaryColor={primaryColor}
        isDemo={isDemo}
      />
    </div>
  )
}

export default EstablishmentControls
