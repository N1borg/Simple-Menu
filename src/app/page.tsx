'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FaWhatsapp } from 'react-icons/fa'
import { Analytics } from "@vercel/analytics/next"

export default function HomePage() {
  const [showContactPopup, setShowContactPopup] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handlePlanClick = (plan: string) => {
    setSelectedPlan(plan)
    setShowContactPopup(true)
  }

  const closePopup = () => {
    setShowContactPopup(false)
    setSelectedPlan(null)
  }

  return (
    <main className="bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen text-[#1e293b]">
      {/* HERO */}
      <section className="px-6 py-24 text-center max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-extrabold text-blue-700 mb-6 drop-shadow-lg">Simple Menu</h1>
        <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
          Votre menu digital personnalisé, élégant et à jour en permanence.<br />
          Gagnez du temps, améliorez l’expérience client, restez flexible à tout moment.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-4">
          <Link
            href="#contact"
            className="inline-block bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-700 transition"
          >
            Demander une période d'essai
          </Link>
          <Link
            href="/e/demo"
            className="inline-block bg-white border-2 border-blue-600 text-blue-600 font-semibold py-3 px-6 rounded-xl shadow hover:bg-blue-50 transition"
          >
            Voir un exemple de menu
          </Link>
        </div>
      </section>

      {/* FONCTIONNALITÉS */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-blue-700">Ce que Simple Menu peut faire pour vous</h2>
          <div className="grid md:grid-cols-3 gap-10 text-center">
            <div className="p-6 rounded-lg border bg-gradient-to-br from-blue-50 to-white shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold text-blue-700 mb-2">QR code unique</h3>
              <p>Un simple scan pour accéder à votre menu depuis n'importe quel smartphone.</p>
            </div>
            <div className="p-6 rounded-lg border bg-gradient-to-br from-blue-50 to-white shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold text-blue-700 mb-2">Éditeur ultra-simple</h3>
              <p>Modifiez prix, produits, dispo et annonces en temps réel sans aucune compétence technique.</p>
            </div>
            <div className="p-6 rounded-lg border bg-gradient-to-br from-blue-50 to-white shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold text-blue-700 mb-2">Personnalisation complète</h3>
              <p>Logo, couleurs, textes, happy hour, évènements : tout est fait à votre image.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TARIFS */}
      <section className="bg-[#e6eeff] py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12 text-blue-700">Choisissez votre formule</h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-blue-600"
              onClick={() => handlePlanClick('Essentiel')}
              tabIndex={0}
              role="button"
              aria-label="Sélectionner la formule Essentiel"
            >
              <h3 className="text-xl font-bold text-blue-700 mb-2">Essentiel</h3>
              <p className="text-4xl font-extrabold text-blue-700 mb-2">6,99€ / mois</p>
              <ul className="text-sm text-gray-700 mb-6 space-y-1">
                <li>✅ Menu digital</li>
                <li>✅ QR code personnalisé</li>
                <li>✅ Accès administrateur</li>
                <li>✅ Design responsive</li>
              </ul>
              <span className="block text-center bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition cursor-pointer">
                Je suis intéressé
              </span>
            </div>

            <div
              className="bg-white rounded-xl p-6 shadow-md border-2 border-blue-700 hover:shadow-xl transition cursor-pointer"
              onClick={() => handlePlanClick('Pro')}
              tabIndex={0}
              role="button"
              aria-label="Sélectionner la formule Pro"
            >
              <h3 className="text-xl font-bold text-blue-700 mb-2">Pro <div className="text-sm text-gray-500">Le plus populaire</div></h3>
              <p className="text-4xl font-extrabold text-blue-700 mb-2">12,99€ / mois</p>
              <ul className="text-sm text-gray-700 mb-6 space-y-1">
                <li>✅ Plan Essentiel inclus</li>
                <li>✅ Personnalisation avancée (logo, couleurs)</li>
                <li>✅ Nom de domaine personnalisé</li>
                <li>✅ Affichage des offres & stocks</li>
                <li>✅ Statistiques en temps réel</li>
                <li>✅ Support prioritaire</li>
              </ul>
              <span className="block text-center bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition cursor-pointer">
                Je passe au Pro
              </span>
            </div>

            <div
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-blue-600"
              onClick={() => handlePlanClick('Premium')}
              tabIndex={0}
              role="button"
              aria-label="Sélectionner la formule Premium"
            >
              <h3 className="text-xl font-bold text-blue-700 mb-2">Premium</h3>
              <p className="text-4xl font-extrabold text-blue-700 mb-2">19,99€ / mois</p>
              <ul className="text-sm text-gray-700 mb-6 space-y-1">
                <li>✅ Plan Pro inclus</li>
                <li>✅ Pages événementielles personnalisées</li>
                <li>✅ Menu multilingue</li>
                <li>✅ Assistance créative (design, contenu)</li>
                <li>✅ Intégration avec outils de réservation</li>
                <li>✅ Gestion des avis clients</li>
                <li>✅ Formation à l'utilisation de la plateforme</li>
                <li>✅ Support téléphonique dédié</li>
                <li>✅ Gestion multi-établissements</li>
              </ul>
              <span className="block text-center bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition cursor-pointer">
                Je veux le Premium
              </span>
            </div>
          </div>
        </div>
        {/* Contact popup */}
        {showContactPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={closePopup}>
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-auto text-center relative animate-fade-in" onClick={e => e.stopPropagation()}>
              <button className="absolute top-3 right-3 text-gray-400 hover:text-blue-700 text-2xl" onClick={closePopup} aria-label="Fermer">&times;</button>
              <h3 className="text-2xl font-bold text-blue-700 mb-2">Contactez-moi pour <span className="capitalize">{selectedPlan}</span></h3>
              <p className="mb-4 text-gray-700">Je vous accompagne personnellement pour mettre en ligne un menu à votre image, en moins de 24h.</p>
              <a className="text-blue-700 font-semibold text-lg hover:underline block mb-2" href={`mailto:robin.caboche@epitech.eu?subject=Simple%20Menu%20-%20${selectedPlan}&body=Bonjour%20Robin,%20j'aimerais%20discuter%20de%20Simple%20Menu%20(${selectedPlan}).`}>📩 robin.caboche@epitech.eu</a>
              <p className="mt-2">ou</p>
              <a
                href={`https://wa.me/33637702875?text=Bonjour%20Robin,%20j'aimerais%20discuter%20de%20Simple%20Menu%20(${selectedPlan}).`}
                target="_blank"
                className="inline-block mt-4 bg-blue-600 text-white py-3 px-6 rounded-xl shadow hover:bg-blue-700 transition"
              >
                Discuter sur WhatsApp
              </a>
            </div>
          </div>
        )}
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24 px-6 max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6">Prêt à digitaliser votre menu ?</h2>
        <p className="mb-4 text-gray-700">
          Je vous accompagne personnellement pour mettre en ligne un menu à votre image, en moins de 24h.
        </p>
        <a className="text-blue-600 font-semibold text-lg hover:underline" href="mailto:robin.caboche@epitech.eu?subject=Simple%20Menu&body=Bonjour%20Robin,%20j'aimerais%20discuter%20de%20Simple%20Menu.">📩 robin.caboche@epitech.eu</a>
        <p className="mt-2">ou</p>
        <a
          href="https://wa.me/33637702875?text=Bonjour%20Robin,%20j'aimerais%20discuter%20de%20Simple%20Menu."
          target="_blank"
          className="inline-block mt-4 bg-blue-600 text-white py-3 px-6 rounded-xl shadow hover:bg-blue-700 transition"
        >
          Discuter sur WhatsApp
        </a>
      </section>

      {/* FOOTER */}
      <footer className="text-center text-sm text-gray-500 py-6 border-t">
        © {new Date().getFullYear()} Simple Menu — Conçu avec passion 🧑‍🍳
      </footer>
      <Analytics />
    </main>
  )
}
