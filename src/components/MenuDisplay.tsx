'use client'
import Image from 'next/image'
import type { MenuDisplayProps } from '@/types/supabase_types'

export default function MenuDisplay({ establishment }: MenuDisplayProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">

      <div className="bg-yellow-100 text-yellow-900 text-sm px-4 py-2 text-center font-semibold shadow-sm">
        🍹 Happy Hour : -50% sur les cocktails de 17h à 19h, tous les jours !
      </div>

      <div className="bg-red-100 text-red-800 text-sm px-4 py-2 text-center font-bold shadow-md animate-pulse">
        🚨 Fermeture exceptionnelle ce samedi 15 pour privatisation. Merci de votre compréhension !
      </div>

      <div className="fixed bottom-4 right-4 bg-green-100 border border-green-300 text-green-900 px-4 py-2 rounded-lg shadow-md text-sm">
        ✅ Offre “Apéro Duo” activée jusqu'à 20h.
      </div>

      <div className="text-center mb-6">
        <Image src={establishment.logo_url} alt="Logo" className="mx-auto w-20 h-20 rounded-full mb-2"/>
        <h1 className="text-3xl font-bold">{establishment.name}</h1>
        <p className="text-red-600 mt-2 font-semibold">🍹 Happy Hour : -50% sur les cocktails de 17h à 19h</p>
      </div>

      <div className="space-y-8"></div>
      {/* Menu */}
      <div className="max-w-4xl mx-auto p-6">
        {establishment.categories?.map((category) => (
          <section key={category.id}>
            <h2 className="text-2xl font-bold mb-4">{category.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"></div>
              {category.menu_items?.filter(item => item.is_available).map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-md p-4 flex flex-col justify-between">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  {item.description && <p className="text-sm text-gray-500 mt-1">{item.description}</p>}
                  <div className="text-right font-bold text-green-600 mt-2">{item.price}€</div>
                </div>
              ))}
          </section>
        ))}
      </div>
    </div>
  )
}
