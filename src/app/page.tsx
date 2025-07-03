'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FaWhatsapp } from 'react-icons/fa'
import { Mail } from "lucide-react"
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
        {/* Launch Offer Banner */}
        <div
          className="relative overflow-hidden bg-[linear-gradient(270deg,_#3b82f6,_#22d3ee,_#22c55e,_#3b82f6)] text-white p-4 mb-8 rounded-xl shadow-lg flex items-center justify-center gap-3 animate-gradient-slide"
          style={{ backgroundSize: '400% 400%' }}
        >
          <span className="text-2xl">🔥</span>
          <span className="font-semibold">OFFRE DE LANCEMENT : -50% sur tous les abonnements + 1 mois gratuit !</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold text-blue-700 mb-6 drop-shadow-lg">Simple Menu</h1>
        <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
          Votre menu digital personnalisé, élégant et à jour en permanence.<br />
          Gagnez du temps, améliorez l'expérience client, restez flexible à tout moment.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-4">
          <Link
            href="#contact"
            className="inline-block bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-700 transition"
          >
            🚀 Profiter de l'offre de lancement
          </Link>
          <Link
            href="/e/demo"
            className="inline-block bg-white border-2 border-blue-600 text-blue-600 font-semibold py-3 px-6 rounded-xl shadow hover:bg-blue-50 transition"
          >
            Voir un exemple de menu
          </Link>
        </div>
        <p className="text-sm text-gray-500 mt-4">✨ Offre limitée aux 30 premiers clients</p>
      </section>

      {/* FONCTIONNALITÉS */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-blue-700">Ce que Simple Menu peut faire pour vous</h2>
          <div className="grid md:grid-cols-3 gap-10 text-center">
            <div className="p-6 rounded-lg border bg-gradient-to-br from-blue-50 to-white shadow-sm hover:shadow-md transition">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold text-blue-700 mb-2">QR code unique</h3>
              <p>Un simple scan pour accéder à votre menu depuis n'importe quel smartphone.</p>
            </div>
            <div className="p-6 rounded-lg border bg-gradient-to-br from-blue-50 to-white shadow-sm hover:shadow-md transition">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-blue-700 mb-2">Éditeur ultra-simple</h3>
              <p>Modifiez prix, produits, dispo et annonces en temps réel sans aucune compétence technique.</p>
            </div>
            <div className="p-6 rounded-lg border bg-gradient-to-br from-blue-50 to-white shadow-sm hover:shadow-md transition">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold text-blue-700 mb-2">Personnalisation complète</h3>
              <p>Logo, couleurs, textes, happy hour, évènements : tout est fait à votre image.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TARIFS */}
      <section className="bg-[#e6eeff] py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-blue-700">Choisissez votre formule</h2>
          <div
            className="bg-[linear-gradient(270deg,_#3b82f6,_#22d3ee,_#22c55e,_#3b82f6)] text-white p-4 mb-8 rounded-xl shadow-lg flex items-center justify-center gap-3 animate-gradient-slide"
            style={{ backgroundSize: '400% 400%' }}
          >
            <span className="text-2xl">🔥</span>
            <span className="font-semibold">OFFRE DE LANCEMENT : -50% sur tous les abonnements + 1 mois gratuit !</span>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-blue-600"
              onClick={() => handlePlanClick('Essentiel')}
              tabIndex={0}
              role="button"
              aria-label="Sélectionner la formule Essentiel"
            >
              <h3 className="text-xl font-bold text-blue-700 mb-2">Essentiel</h3>
              <div className="mb-4">
                <span className="text-lg text-gray-400 line-through">13,99€</span>
                <span className="text-4xl font-extrabold text-blue-700 ml-2">6,99€</span>
                <span className="text-gray-600"> / mois</span>
              </div>
              <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-4 inline-block">
                + 1 mois gratuit
              </div>
              <ul className="text-sm text-gray-700 mb-6 space-y-1">
                <li>✅ Menu digital responsive</li>
                <li>✅ QR codes personnalisés</li>
                <li>✅ Accès administrateur</li>
                <li>✅ Modifications illimitées</li>
                <li>✅ Support email</li>
              </ul>
              <span className="block text-center bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition cursor-pointer">
                Je suis intéressé
              </span>
            </div>

            <div
              className="bg-white rounded-xl p-6 shadow-md border-2 border-blue-700 hover:shadow-xl transition cursor-pointer relative"
              onClick={() => handlePlanClick('Pro')}
              tabIndex={0}
              role="button"
              aria-label="Sélectionner la formule Pro"
            >
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-700 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Le plus populaire
              </div>
              <h3 className="text-xl font-bold text-blue-700 mb-2">Pro</h3>
              <div className="mb-4">
                <span className="text-lg text-gray-400 line-through">25,99€</span>
                <span className="text-4xl font-extrabold text-blue-700 ml-2">12,99€</span>
                <span className="text-gray-600"> / mois</span>
              </div>
              <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-4 inline-block">
                + 1 mois gratuit + QR codes imprimés
              </div>
              <ul className="text-sm text-gray-700 mb-6 space-y-1">
                <li>✅ Plan Essentiel inclus</li>
                <li>✅ Logo et couleurs personnalisés</li>
                <li>✅ Nom de domaine personnalisé</li>
                <li>✅ Statistiques de visites</li>
                <li>✅ Gestion des stocks en temps réel</li>
                <li>✅ QR codes imprimés (10 unités)</li>
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
              <div className="mb-4">
                <span className="text-lg text-gray-400 line-through">39,99€</span>
                <span className="text-4xl font-extrabold text-blue-700 ml-2">19,99€</span>
                <span className="text-gray-600"> / mois</span>
              </div>
              <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-4 inline-block">
                + 1 mois gratuit + Setup complet offert
              </div>
              <ul className="text-sm text-gray-700 mb-6 space-y-1">
                <li>✅ Plan Pro inclus</li>
                <li>✅ Pages événementielles personnalisées</li>
                <li>✅ Menu multilingue</li>
                <li>✅ Statistiques avancées (heure, plats populaires)</li>
                <li>✅ QR codes imprimés illimités</li>
                <li>✅ Intégration outils de réservation</li>
                <li>✅ Gestion des avis clients</li>
                <li>✅ Formation personnalisée</li>
                <li>✅ Support téléphonique dédié</li>
                <li>✅ Gestion multi-établissements</li>
              </ul>
              <span className="block text-center bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition cursor-pointer">
                Je veux le Premium
              </span>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">💡 Tous les plans incluent : Hébergement sécurisé, mises à jour automatiques, sauvegarde quotidienne</p>
          </div>
        </div>

        {/* Contact popup */}
        {showContactPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={closePopup}>
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-auto text-center relative animate-fade-in" onClick={e => e.stopPropagation()}>
              <button className="absolute top-3 right-3 text-gray-400 hover:text-blue-700 text-2xl" onClick={closePopup} aria-label="Fermer">&times;</button>
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-blue-700 mb-2">Profitez de l'offre de lancement !</h3>
              <div className="bg-green-100 text-green-800 p-3 rounded-lg mb-4">
                <p className="font-semibold">Formule {selectedPlan}</p>
                <p className="text-sm">1 mois gratuit + réduction de 50%</p>
              </div>
              <p className="mb-6 text-gray-700">Je vous accompagne personnellement pour mettre en ligne votre menu en moins de 24h.</p>
              <div className="space-y-3">
                <a 
                  className="w-full bg-green-600 text-white font-semibold py-3 px-6 rounded-xl shadow hover:bg-green-700 transition flex items-center justify-center gap-2" 
                  href={`https://wa.me/33637702875?text=Bonjour%20Robin,%20je%20veux%20profiter%20de%20l'offre%20de%20lancement%20Simple%20Menu%20(${selectedPlan})%20!`}
                  target="_blank"
                >
                  <FaWhatsapp className="text-xl" />
                  WhatsApp (Réponse immédiate)
                </a>
                <a 
                  className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow hover:bg-blue-700 transition flex items-center justify-center gap-2" 
                  href={`mailto:robin.caboche@epitech.eu?subject=Simple%20Menu%20-%20Offre%20de%20lancement%20${selectedPlan}&body=Bonjour%20Robin,%20je%20veux%20profiter%20de%20l'offre%20de%20lancement%20Simple%20Menu%20(${selectedPlan})%20!`}
                >
                  <Mail className="text-xl" />
                  Email
                </a>
              </div>
              <p className="text-xs text-gray-500 mt-4">⚡ Offre limitée • Setup en 24h • Support français</p>
            </div>
          </div>
        )}
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-blue-700">Pourquoi choisir Simple Menu ?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-blue-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3">💰</div>
                <h3 className="text-xl font-semibold text-blue-700">Économisez jusqu'à 300€/mois</h3>
              </div>
              <p className="text-gray-700">Fini les coûts d'impression, de livraison et de stockage de menus papier.</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3">⚡</div>
                <h3 className="text-xl font-semibold text-blue-700">Mise à jour instantanée</h3>
              </div>
              <p className="text-gray-700">Changez vos prix et disponibilités en 30 secondes, même en plein service.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24 px-6 max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6">Prêt à digitaliser votre menu ?</h2>
        <p className="mb-6 text-gray-700">
          Je vous accompagne personnellement pour mettre en ligne un menu à votre image, en moins de 24h.
        </p>
        <div className="bg-gradient-to-r from-green-100 to-blue-100 p-6 rounded-xl mb-6">
          <p className="text-green-800 font-semibold mb-2">🎯 OFFRE DE LANCEMENT LIMITÉE</p>
          <p className="text-sm text-gray-700">1 mois gratuit + 50% de réduction + QR codes imprimés offerts</p>
        </div>
        <div className="flex flex-col gap-4">
          <a 
            className="bg-green-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-green-700 transition flex items-center justify-center gap-2" 
            href="https://wa.me/33637702875?text=Bonjour%20Robin,%20je%20veux%20profiter%20de%20l'offre%20de%20lancement%20Simple%20Menu%20!"
            target="_blank"
          >
            <FaWhatsapp className="text-xl" />
            WhatsApp - Réponse immédiate
          </a>
          <a 
            className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-2" 
            href="mailto:robin.caboche@epitech.eu?subject=Simple%20Menu%20-%20Offre%20de%20lancement&body=Bonjour%20Robin,%20je%20veux%20profiter%20de%20l'offre%20de%20lancement%20Simple%20Menu%20!"
          >
            <Mail className="text-xl" />
            Mail - robin.caboche@epitech.eu
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center text-sm text-gray-500 py-6 border-t">
        © {new Date().getFullYear()} Simple Menu — Conçu avec passion 🧑‍🍳
      </footer>
      <Analytics />
    </main>
  )
}
