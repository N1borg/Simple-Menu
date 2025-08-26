import React from "react"
import EstablishmentFooter, { EstablishmentInfo } from "@/components/EstablishmentFooter"

interface MenuFooterProps {
  color?: string
  establishmentInfo?: EstablishmentInfo
  plan?: string
}

const MenuFooter: React.FC<MenuFooterProps> = ({ color, establishmentInfo, plan = 'essentiel' }) => {
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
      className={`tutorial-footer-section text-white py-6 w-full ${hasInfo ? 'border-t' : ''}`}
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

        {/* Alcohol Warning */}
        <div className="mt-6 py-4 border-t text-center" style={{ borderColor: (color || '#3a4fff') + '20' }}>
          <p className="text-s" style={{ color: color || '#3a4fff' }}>
            L'abus d'alcool est dangereux pour la santé. À consommer avec modération.
          </p>
        </div>
          
        {/* Simple Menu attribution */}
        {plan !== 'premium' && (
          <div 
            className={`text-center pt-4 ${hasInfo ? 'border-t' : ''}`} 
            style={{ borderColor: hasInfo ? (color || '#3a4fff') + '20' : undefined }}
          >
            <p className="text-xs">
              Menu digital créé avec ❤️ par{" "}
              <a
                href="https://simple-menu.app"
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
