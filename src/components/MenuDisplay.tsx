import Image from 'next/image'
import type { MenuDisplayProps, Category, MenuItem } from '@/types/supabase_types'

function renderMenuItem(item: MenuItem, category: Category) {
  const style = item.display_style || category.display_style || 'card'
  switch (style) {
    case 'list':
      return (
        <li key={item.id} className="flex justify-between border-b pb-1">
          <span>{item.name}</span>
          <span>{item.price.toFixed(2)}€</span>
        </li>
      )
    case 'compact':
      return (
        <span
          key={item.id}
          className="bg-gray-100 rounded px-2 py-1 text-sm font-medium"
          title={item.description || ''}
        >
          {item.name} <span className="text-green-700">{item.price.toFixed(2)}€</span>
        </span>
      )
    case 'table':
      return (
        <tr key={item.id}>
          <td className="border-b p-2">{item.name}</td>
          <td className="border-b p-2">{item.description}</td>
          <td className="border-b p-2 text-right">{item.price.toFixed(2)}€</td>
        </tr>
      )
    case 'card':
    default:
      return (
        <div key={item.id} className="bg-white rounded-xl shadow-md p-4 flex flex-col justify-between">
          <h3 className="text-lg font-semibold">{item.name}</h3>
          {item.description && (
            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
          )}
          <div className="text-right font-bold text-green-600 mt-2">
            {item.price.toFixed(2)}€
          </div>
        </div>
      )
  }
}

function renderCardStyle(category: Category) {
  return (
    <section key={category.id} className="max-w-4xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-4">{category.name}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {category.menu_items
          ?.filter((item: MenuItem) => item.is_available)
          .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
          .map(item => renderMenuItem(item, category))}
      </div>
    </section>
  )
}

function renderListStyle(category: Category) {
  return (
    <section key={category.id} className="max-w-4xl mx-auto px-4 py-6">
      <h2 className="text-xl font-bold mb-2">{category.name}</h2>
      <ul className="space-y-1">
        {category.menu_items
          ?.filter((item: MenuItem) => item.is_available)
          .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
          .map(item => renderMenuItem(item, category))}
      </ul>
    </section>
  )
}

function renderCompactStyle(category: Category) {
  return (
    <section key={category.id} className="max-w-2xl mx-auto px-2 py-4">
      <h2 className="text-lg font-semibold mb-2">{category.name}</h2>
      <div className="flex flex-wrap gap-2">
        {category.menu_items
          ?.filter((item: MenuItem) => item.is_available)
          .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
          .map(item => renderMenuItem(item, category))}
      </div>
    </section>
  )
}

function renderTableStyle(category: Category) {
  return (
    <section key={category.id} className="max-w-4xl mx-auto px-4 py-6">
      <h2 className="text-xl font-bold mb-2">{category.name}</h2>
      <table className="w-full text-left border">
        <thead>
          <tr>
            <th className="border-b p-2">Nom</th>
            <th className="border-b p-2">Description</th>
            <th className="border-b p-2 text-right">Prix</th>
          </tr>
        </thead>
        <tbody>
          {category.menu_items
            ?.filter((item: MenuItem) => item.is_available)
            .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
            .map(item => renderMenuItem(item, category))}
        </tbody>
      </table>
    </section>
  )
}

function renderCategoryByStyle(category: Category) {
  switch (category.display_style) {
    case 'list':
      return renderListStyle(category)
    case 'compact':
      return renderCompactStyle(category)
    case 'table':
      return renderTableStyle(category)
    case 'card':
    default:
      return renderCardStyle(category)
  }
}

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
        ✅ Offre &quot;Apéro Duo&quot; activée jusqu&apos;à 20h.
      </div>

      <div className="text-center mb-6">
        {establishment.logo_url && (
          <Image
            src={establishment.logo_url}
            alt="Logo"
            width={100}
            height={100}
            className="mx-auto w-25 h-25 rounded-full mb-2"
          />
        )}
        <h1 className="text-3xl font-bold">{establishment.name}</h1>
        <p className="text-red-600 mt-2 font-semibold">🍹 Happy Hour : -50% sur les cocktails de 17h à 19h</p>
      </div>

      <div className="space-y-8">
        {establishment.categories
          ?.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map(renderCategoryByStyle)}
      </div>
    </div>
  )
}
