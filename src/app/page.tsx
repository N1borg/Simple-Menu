'use client'

import Link from 'next/link';
import { useState } from 'react';
import { Mail, CircleCheck } from 'lucide-react';
import LegalFooter from '@/components/LegalFooter';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { SignupForm } from '@/components/SignupForm';

export default function HomePage() {
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handlePlanClick = (plan: string) => {
    setSelectedPlan(plan);
    setShowSignupForm(true);
  };

  const closeSignupForm = () => setShowSignupForm(false);

  return (
    <main className="bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen text-[#1e293b]">
      {/* HERO */}
      <section className="px-6 pt-12 pb-24 text-center max-w-3xl mx-auto">
        {/* Launch Offer Banner */}
        <div
          className="relative overflow-hidden bg-[linear-gradient(270deg,_#3b82f6,_#22d3ee,_#22c55e,_#3b82f6)] text-white p-4 mb-8 rounded-xl shadow-lg flex items-center justify-center gap-3 animate-gradient-slide"
          style={{ backgroundSize: '400% 400%' }}
        >
          <span className="text-2xl">🔥</span>
          <span className="font-semibold">OFFRE DE LANCEMENT : 2 semaines gratuites + -50% sur tous les abonnements !</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold text-blue-700 mb-6 drop-shadow-lg">Simple Menu</h1>
        <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
          Votre menu digital personnalisé, élégant et à jour en permanence.<br />
          Gagnez du temps, améliorez l'expérience client, restez flexible à tout moment.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-4">
          <Link
            href="#tarifs"
            className="inline-block bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-700 transition"
            onClick={e => {
              e.preventDefault();
              const section = document.getElementById('tarifs');
              if (section) section.scrollIntoView({ behavior: 'smooth' });
            }}
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
      <section id="tarifs" className="bg-[#e6eeff] py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-blue-700">Choisissez votre formule</h2>
          <div
            className="bg-[linear-gradient(270deg,_#3b82f6,_#22d3ee,_#22c55e,_#3b82f6)] text-white p-4 mb-8 rounded-xl shadow-lg flex items-center justify-center gap-3 animate-gradient-slide"
            style={{ backgroundSize: '400% 400%' }}
          >
            <span className="text-2xl">🔥</span>
            <span className="font-semibold">OFFRE DE LANCEMENT : 2 semaines gratuites + -50% sur tous les abonnements !</span>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-left">
            {/* Essentiel */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-blue-600 flex flex-col" onClick={() => handlePlanClick('essentiel')} tabIndex={0} role="button" aria-label="Sélectionner la formule Essentiel">
              <h3 className="text-xl font-bold text-blue-700 mb-2">Essentiel</h3>
              <div className="mb-4">
                <span className="text-lg text-gray-400 line-through">13,99€</span>
                <span className="text-4xl font-extrabold text-blue-700 ml-2">6,99€</span>
                <span className="text-gray-600"> / mois</span>
              </div>
              <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-4 inline-block text-center">
                + 2 semaines gratuites
              </div>
              <ul className="text-sm text-gray-700 mb-6 space-y-1 flex-1">
                <li className="flex items-center"><CircleCheck className="text-green-600 w-4 h-4 mr-2" /> 5 catégories • 50 produits</li>
                <li className="flex items-center"><CircleCheck className="text-green-600 w-4 h-4 mr-2" /> Menu digital responsive</li>
                <li className="flex items-center"><CircleCheck className="text-green-600 w-4 h-4 mr-2" /> Accès administrateur</li>
                <li className="flex items-center"><CircleCheck className="text-green-600 w-4 h-4 mr-2" /> QR codes personnalisés</li>
                <li className="flex items-center"><CircleCheck className="text-green-600 w-4 h-4 mr-2" /> Modifications en temps réel</li>
                <li className="flex items-center"><CircleCheck className="text-green-600 w-4 h-4 mr-2" /> Support email</li>
              </ul>
              <span className="block text-center bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition cursor-pointer mt-auto">
                Je suis intéressé
              </span>
            </div>

            {/* Pro */}
            <div className="bg-white rounded-xl p-6 shadow-md border-2 border-blue-700 hover:shadow-xl transition cursor-pointer relative flex flex-col" onClick={() => handlePlanClick('pro')} tabIndex={0} role="button" aria-label="Sélectionner la formule Pro">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-700 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Le plus populaire
              </div>
              <h3 className="text-xl font-bold text-blue-700 mb-2">Pro</h3>
              <div className="mb-4">
                <span className="text-lg text-gray-400 line-through">25,99€</span>
                <span className="text-4xl font-extrabold text-blue-700 ml-2">12,99€</span>
                <span className="text-gray-600"> / mois</span>
              </div>
              <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-4 inline-block text-center">
                + 2 semaines gratuites + QR codes imprimés
              </div>
              <ul className="text-sm text-gray-700 mb-6 space-y-1 flex-1">
                <li className="flex items-center"><CircleCheck className="text-green-600 w-4 h-4 mr-2" /> 15 catégories • 200 produits</li>
                <li className="flex items-center"><CircleCheck className="text-green-600 w-4 h-4 mr-2" /> Menu digital responsive</li>
                <li className="flex items-center"><CircleCheck className="text-green-600 w-4 h-4 mr-2" /> Accès administrateur</li>
                <li className="flex items-center"><CircleCheck className="text-green-600 w-4 h-4 mr-2" /> QR codes personnalisés</li>
                <li className="flex items-center"><CircleCheck className="text-green-600 w-4 h-4 mr-2" /> Modifications en temps réel</li>
                <li className="flex items-center"><CircleCheck className="text-green-600 w-4 h-4 mr-2" /> Support email & téléphonique</li>
                <li className="flex items-center"><CircleCheck className="text-green-600 w-4 h-4 mr-2" /> QR codes imprimés (10 unités)</li>
                <li className="flex items-center"><CircleCheck className="text-green-600 w-4 h-4 mr-2" /> Application mobile</li>
                <li className="flex items-center"><CircleCheck className="text-green-600 w-4 h-4 mr-2" /> Gestion des stocks</li>
                <li className="flex items-center"><CircleCheck className="text-green-600 w-4 h-4 mr-2" /> Photos personnalisées</li>
              </ul>
              <span className="block text-center bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition cursor-pointer mt-auto">
                Je passe au Pro
              </span>
            </div>

            {/* Premium */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-blue-600 flex flex-col" onClick={() => handlePlanClick('premium')} tabIndex={0} role="button" aria-label="Sélectionner la formule Premium">
              <h3 className="text-xl font-bold text-blue-700 mb-2">Premium</h3>
              <div className="mb-4">
                <span className="text-lg text-gray-400 line-through">39,99€</span>
                <span className="text-4xl font-extrabold text-blue-700 ml-2">19,99€</span>
                <span className="text-gray-600"> / mois</span>
              </div>
              <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-4 inline-block text-center">
                + 2 semaines gratuites + Setup complet offert
              </div>
              <ul className="text-sm text-gray-700 mb-6 space-y-1 flex-1">
                <li className="flex items-center"><CircleCheck className="text-green-600 w-4 h-4 mr-2" /> Catégories et produits illimités</li>
                <li className="flex items-center"><CircleCheck className="text-green-600 w-4 h-4 mr-2" /> Menu digital responsive</li>
                <li className="flex items-center"><CircleCheck className="text-green-600 w-4 h-4 mr-2" /> Accès administrateur</li>
                <li className="flex items-center"><CircleCheck className="text-green-600 w-4 h-4 mr-2" /> QR codes personnalisés</li>
                <li className="flex items-center"><CircleCheck className="text-green-600 w-4 h-4 mr-2" /> Modifications en temps réel</li>
                <li className="flex items-center"><CircleCheck className="text-green-600 w-4 h-4 mr-2" /> Support email & téléphonique</li>
                <li className="flex items-center"><CircleCheck className="text-green-600 w-4 h-4 mr-2" /> QR codes imprimés (100 unités)</li>
                <li className="flex items-center"><CircleCheck className="text-green-600 w-4 h-4 mr-2" /> Application mobile</li>
                <li className="flex items-center"><CircleCheck className="text-green-600 w-4 h-4 mr-2" /> Gestion des stocks</li>
                <li className="flex items-center"><CircleCheck className="text-green-600 w-4 h-4 mr-2" /> Photos personnalisées</li>
                <li className="flex items-center"><CircleCheck className="text-green-600 w-4 h-4 mr-2" /> Nom de domaine personnalisé</li>
                <li className="flex items-center"><CircleCheck className="text-green-600 w-4 h-4 mr-2" /> Formation personnalisée</li>
                <li className="flex items-center"><CircleCheck className="text-green-600 w-4 h-4 mr-2" /> Gestion des événements</li>
                <li className="flex items-center"><CircleCheck className="text-green-600 w-4 h-4 mr-2" /> Menu multilingue</li>
                <li className="flex items-center"><CircleCheck className="text-green-600 w-4 h-4 mr-2" /> Statistiques utilisateurs</li>
              </ul>
              <span className="block text-center bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition cursor-pointer mt-auto">
                Je veux le Premium
              </span>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">Tous les plans incluent : Hébergement sécurisé, mises à jour automatiques, sauvegarde quotidienne</p>
            <p className="text-xs text-gray-500 mt-2">Remise de 50% appliquée automatiquement sur les 3 premiers mois d'abonnement.</p>
          </div>
        </div>
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
          Nous vous accompagnons personnellement pour mettre en ligne un menu à votre image, en moins de 24h.
        </p>
        <div className="bg-gradient-to-r from-green-100 to-blue-100 p-6 rounded-xl mb-6">
          <p className="text-green-800 font-semibold mb-2">🎯 OFFRE DE LANCEMENT LIMITÉE</p>
          <p className="text-sm text-gray-700">2 semaines gratuites + 50% de réduction</p>
        </div>
        <div className="flex flex-col gap-4">
          <a 
            className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-2" 
            href="mailto:contact.simplemenu@gmail.com?subject=Simple%20Menu%20-%20Offre%20de%20lancement&body=Bonjour%20Robin,%20je%20veux%20profiter%20de%20l'offre%20de%20lancement%20Simple%20Menu%20!"
          >
            <Mail className="text-xl" />
            contact.simplemenu@gmail.com
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <LegalFooter transparentBg />

      {/* Signup Form Modal */}
      <Dialog open={showSignupForm} onOpenChange={setShowSignupForm}>
        <DialogContent className="max-w-6xl w-full flex flex-col max-h-[90vh] overflow-hidden">
          {/* Visually hidden title for accessibility */}
          <DialogTitle className="sr-only">Inscription</DialogTitle>
          <DialogDescription className="sr-only">Formulaire d'inscription à Simple Menu</DialogDescription>
          <div className="flex-1 overflow-y-auto px-6 pb-6 -mx-6 -mb-6"
               style={{ 
                 scrollbarWidth: 'thin',
                 scrollbarColor: 'rgba(0,0,0,0.2) transparent'
               }}>
            <div className="space-y-6 pr-2">
              <SignupForm 
                onClose={closeSignupForm} 
                selectedPlan={selectedPlan || 'pro'} 
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Analytics and Speed Insights */}
      <Analytics />
      <SpeedInsights />
    </main>
  );
}
