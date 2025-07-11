'use client'

import { EstablishmentInfoManager } from './EstablishmentInfoManager'
import { OpeningHoursManager } from './OpeningHoursManager'

interface EstablishmentControlsProps {
  establishmentId: string
  slug: string
}

export function EstablishmentControls({ establishmentId, slug }: EstablishmentControlsProps) {
  return (
    <div className="space-y-2">
      <EstablishmentInfoManager 
        establishmentId={establishmentId} 
        slug={slug} 
      />
      <OpeningHoursManager 
        establishmentId={establishmentId} 
        slug={slug} 
      />
    </div>
  )
}

export default EstablishmentControls
