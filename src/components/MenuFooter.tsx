import React from "react"
import EstablishmentFooter, { EstablishmentInfo } from "./EstablishmentFooter"

interface MenuFooterProps {
  color?: string
  establishmentInfo?: EstablishmentInfo
  showAttribution?: boolean
}

const MenuFooter: React.FC<MenuFooterProps> = ({ color, establishmentInfo, showAttribution=true }) => {
  const hasInfo = establishmentInfo && (
    establishmentInfo.address ||
    establishmentInfo.phone ||
    establishmentInfo.email ||
    (establishmentInfo.opening_hours && establishmentInfo.opening_hours.length > 0) ||
    establishmentInfo.facebook_url ||
    establishmentInfo.instagram_url ||
    establishmentInfo.google_maps_url
  )

  return (
    <footer
      className={`text-white py-6 w-full ${hasInfo ? 'border-t' : ''}`}
      style={{ 
        backgroundColor: `#f3f6fd`, 
        borderColor: hasInfo ? (color || '#3a4fff') + '40' : undefined, 
        color: color || '#3a4fff' 
      }}
    >
      <div className={`max-w-2xl mx-auto px-4 ${!hasInfo ? 'flex items-center justify-center' : ''}`}>
        <EstablishmentFooter 
          color={color}
          establishmentInfo={establishmentInfo}
        />
        
      {/* Simple Menu attribution */}
      {showAttribution && (
        <div 
          className={`text-center pt-4 ${hasInfo ? 'border-t' : ''}`} 
          style={{ borderColor: hasInfo ? (color || '#3a4fff') + '20' : undefined }}
        >
          <p className="text-xs">
            Menu digital créé avec ❤️ par{" "}
            <a
              href="https://simple-menu.niborgpro.fr"
              className="underline"
              target="_blank"
              rel="noopener"
            >
              Simple-Menu
            </a>
          </p>
        </div>
      )}
      </div>
    </footer>
  )
}

export default MenuFooter
