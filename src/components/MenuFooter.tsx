import React from "react"

interface MenuFooterProps {
  color?: string
}

const MenuFooter: React.FC<MenuFooterProps> = ({ color }) => (
  <footer
    className="text-white py-6 w-full border-t"
    style={{ backgroundColor: `#f3f6fd`, borderColor: (color || '#3a4fff') + '40', color: color || '#3a4fff' }}
  >
    <div className="max-w-2xl mx-auto px-4 text-center">
      <p className="text-xs mt-2">
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
  </footer>
)

export default MenuFooter
