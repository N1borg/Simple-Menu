import React from "react"

interface MenuFooterProps {
  color?: string
}

const MenuFooter: React.FC<MenuFooterProps> = ({ color }) => (
  <footer
    className="text-white py-6 w-full"
    style={{ backgroundColor: color || '#1e293b' }}
  >
    <div className="max-w-2xl mx-auto px-4 text-center">
      <p className="text-xs mt-2">
        Menu digital créé avec ❤️ par{" "}
        <a
          href="https://simple-menu.niborgpro.fr"
          className="underline transition-colors duration-200 hover:text-blue-300 focus:text-blue-400"
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
