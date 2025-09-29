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
  const [showContactPopup, setShowContactPopup] = useState(false)
  const [showSignupForm, setShowSignupForm] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handlePlanClick = (plan: string) => {
    setSelectedPlan(plan)
    setShowSignupForm(true)
  }

  const closePopup = () => {
    setShowContactPopup(false)
    setSelectedPlan(null)
  }

  const closeSignupForm = () => {
    setShowSignupForm(false)
    setSelectedPlan(null)
  }

  return (
    <main className="relative min-h-screen text-[#1e293b] overflow-x-hidden">
      {/* Background */}
        <AnimatedBlob className="w-96 h-96 bg-blue-400/30 top-10 -left-20" delay={0} />
        <AnimatedBlob className="w-80 h-80 bg-cyan-400/25 top-1/3 -right-20" delay={5} />
        <AnimatedBlob className="w-64 h-64 bg-purple-400/20 bottom-20 left-1/4" delay={10} />
        <DotsPattern className="text-blue-600" />

      {/* HERO SECTION */}
      <motion.section 
        className="relative z-10 px-6 pt-12 pb-24 text-center max-w-3xl mx-auto"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        <LaunchOfferBanner />
        <TypingTitle />
        
        <div 
          className={`text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto transition-all duration-1000 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Votre menu digital personnalisé, élégant et à jour en permanence.<br />
          Gagnez du temps, améliorez l'expérience client, restez flexible à tout moment.
        </div>
        
        <div 
          className={`flex flex-col md:flex-row gap-4 justify-center items-center transition-all duration-1000 delay-300 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Link
            href="#contact"
            className="inline-block bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-700 transition"
          >
            🚀 Profiter de l'offre de lancement
          </Link>
          <Link
            href="/e/demo"
            className="inline-block bg-white border-2 border-blue-600 text-blue-600 font-semibold py-3 px-6 rounded-xl shadow hover:bg-blue-50 transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            Voir un exemple de menu
          </Link>
        </div>
      </motion.section>

      {/* FEATURES SECTION */}
      <motion.section 
        className="relative py-20 px-6 bg-gradient-radial from-white via-blue-50/20 to-cyan-50/20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <AnimatedBlob className="w-72 h-72 bg-blue-300/20 top-20 right-0" delay={3} />
        <AnimatedBlob className="w-60 h-60 bg-cyan-300/15 bottom-10 left-0" delay={8} />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.h2 
            className="text-4xl md:text-5xl font-extrabold text-center mb-16 text-blue-700 leading-tight"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Ce que Simple Menu peut faire pour vous
          </motion.h2>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-12 text-center"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <FeatureCard
              icon="📱"
              title="QR code unique"
              description="Un simple scan pour accéder à votre menu depuis n'importe quel smartphone."
            />
            <FeatureCard
              icon="⚡"
              title="Éditeur ultra-simple"
              description="Modifiez prix, produits, dispo et annonces en temps réel sans aucune compétence technique."
            />
            <FeatureCard
              icon="🎨"
              title="Personnalisation complète"
              description="Logo, couleurs, textes, happy hour, évènements : tout est fait à votre image."
            />
          </motion.div>
        </div>
      </motion.section>

      {/* TARIFS */}
      <section className="bg-[#e6eeff] py-20 px-6">
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
          </motion.div>
        </div>

        {/* Contact popup using shadcn/ui Dialog */}
        <Dialog open={showContactPopup} onOpenChange={(open) => { if (!open) closePopup() }}>
          <DialogContent className="max-w-md w-full p-0">
            <DialogHeader>
              <DialogTitle className="flex flex-col items-center gap-2 pt-6">
                <span className="text-4xl">🎉</span>
                <span className="text-2xl font-bold text-blue-700">Profitez de l'offre de lancement !</span>
              </DialogTitle>
              <DialogDescription className="px-8">
                <div className="bg-green-100 text-green-800 p-3 rounded-lg mb-4 mt-4 text-center">
                  <p className="font-semibold">Formule {selectedPlan}</p>
                  <p className="text-sm">2 semaines gratuites + réduction de 50%</p>
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="px-8 pb-8 text-center">
              <p className="mb-6 text-gray-700">Nous vous accompagnons personnellement pour mettre en ligne votre menu en moins de 24h.</p>
              <div className="space-y-3">
                <a 
                  className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow hover:bg-blue-700 transition flex items-center justify-center gap-2" 
                  href={`mailto:contact.simplemenu@gmail.com?subject=Simple%20Menu%20-%20Offre%20de%20lancement%20${selectedPlan}&body=Bonjour%20Robin,%20je%20veux%20profiter%20de%20l'offre%20de%20lancement%20Simple%20Menu%20(${selectedPlan})%20!`}
                >
                  <Mail className="text-xl" />
                  contact.simplemenu@gmail.com
                </a>
              </div>
              <p className="text-xs text-gray-500 mt-4">⚡ Offre limitée • Setup en 24h • Support français</p>
            </div>
          </DialogContent>
        </Dialog>
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
      </motion.section>

      {/* CONTACT SECTION */}
      <motion.section 
        id="contact" 
        className="py-24 px-6 max-w-2xl mx-auto text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <motion.h2 
          className="text-4xl md:text-5xl font-extrabold mb-8 leading-tight"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Prêt à digitaliser votre menu ?
        </motion.h2>
        
        <motion.p 
          className="mb-8 text-gray-700 text-xl leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Nous vous accompagnons personnellement pour mettre en ligne un menu à votre image, en moins de 24h.
        </motion.p>
        <motion.div 
          className="bg-gradient-to-r from-green-300 via-emerald-300 to-blue-300 p-8 rounded-2xl mb-8 shadow-lg border border-green-400 relative"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          style={{ backgroundColor: 'rgba(134, 239, 172, 0.95)' }}
        >
          <p className="text-green-800 font-bold mb-2 text-xl">🎯 OFFRE DE LANCEMENT LIMITÉE</p>
          <p className="text-gray-700 font-medium text-lg">2 semaines gratuites + 50% de réduction sur vos trois premiers mois</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <motion.a 
            className="bg-blue-600 text-white font-semibold py-3 px-6 z-50 rounded-xl shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 cursor-pointer" 
            href="mailto:contact.simplemenu@gmail.com?subject=Simple%20Menu%20-%20Offre%20de%20lancement&body=Bonjour%20Robin,%20je%20veux%20profiter%20de%20l'offre%20de%20lancement%20Simple%20Menu%20!"
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
            whileTap={{ scale: 0.95 }}
          >
            <Mail className="text-xl" />
            contact.simplemenu@gmail.com
          </motion.a>
        </motion.div>
      </motion.section>

      {/* FOOTER */}
      <footer className="text-center text-sm text-gray-500 py-6 border-t">
        © {new Date().getFullYear()} Simple-Menu — Conçu avec passion 🧑‍🍳
      </footer>

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
                onClose={() => setShowSignupForm(false)} 
                selectedPlan={selectedPlan || 'pro'} 
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact popup using shadcn/ui Dialog */}
      <Dialog open={showContactPopup} onOpenChange={setShowContactPopup}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-blue-700">
              🎉 Excellent choix !
            </DialogTitle>
            <DialogDescription className="text-center">
              Vous avez sélectionné le plan <strong>{selectedPlan}</strong>
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center space-y-4">
            <p className="text-gray-700">
              Contactez-nous pour profiter de l'offre de lancement avec <strong>2 semaines gratuites + 50% de réduction</strong> !
            </p>
            
            <a 
              href={`mailto:contact.simplemenu@gmail.com?subject=Simple%20Menu%20-%20Plan%20${selectedPlan}&body=Bonjour%20Robin,%20je%20suis%20intéressé%20par%20le%20plan%20${selectedPlan}%20avec%20l'offre%20de%20lancement%20!`}
              className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-700 transition"
              onClick={closePopup}
            >
              <Mail className="w-5 h-5" />
              Nous contacter
            </a>
            
            <button
              onClick={closePopup}
              className="block w-full text-gray-500 hover:text-gray-700 transition mt-3"
            >
              Fermer
            </button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Analytics />
    </main>
  );
}
