'use client'

import { EstablishmentInfoManager } from './EstablishmentInfoManager'
import { OpeningHoursManager } from './OpeningHoursManager'

interface EstablishmentControlsProps {
  establishmentId: string
  slug: string
  primaryColor?: string
}

export function EstablishmentControls({ establishmentId, slug, primaryColor }: EstablishmentControlsProps) {
  return (
    <div className="space-y-2">
      <EstablishmentInfoManager 
        establishmentId={establishmentId} 
        slug={slug}
        primaryColor={primaryColor}
      />
      <OpeningHoursManager 
        establishmentId={establishmentId} 
        slug={slug}
        primaryColor={primaryColor}
      />
    </div>
  )
}

export default EstablishmentControls
