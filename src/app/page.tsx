'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Mail, CircleCheck, X } from "lucide-react"
import { motion, useScroll, useTransform, useInView, useAnimation } from 'framer-motion'
import { useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { SignupForm } from '@/components/SignupForm'

// Dots pattern background component
function DotsPattern({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="16" cy="16" r="1.5" fill="currentColor" opacity="0.15" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
    </div>
  )
}

// Animated blob component
function AnimatedBlob({ className = "", delay = 0 }: { className?: string, delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full filter blur-3xl ${className}`}
      transition={{
        duration: 20,
        repeat: Infinity,
        delay: delay,
        ease: "linear"
      }}
    />
  )
}

// Glassmorphism card wrapper
function GlassCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl ${className}`}>
      {children}
    </div>
  )
}

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

const staggerContainer = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const scaleOnHover = {
  whileHover: { 
    scale: 1.05, 
    transition: { duration: 0.2 } 
  },
  whileTap: { scale: 0.95 }
}

// Typing animation component
function TypingTitle() {
  const [text, setText] = useState('')
  const fullText = 'Simple Menu'
  
  useEffect(() => {
    let index = 0
    const timer = setInterval(() => {
      setText(fullText.slice(0, index))
      index++
      if (index > fullText.length) {
        clearInterval(timer)
      }
    }, 150)
    
    return () => clearInterval(timer)
  }, [])
  
  return (
    <motion.h1 
      className="text-5xl md:text-6xl font-extrabold text-blue-700 mb-6 drop-shadow-lg"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      style={{ opacity: 1, transform: "scale(1)" }}
    >
      {text}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="text-blue-500"
      >
        |
      </motion.span>
    </motion.h1>
  )
}

// Animated counter component
function AnimatedCounter({ target, duration = 2, decimals = 2 }: { target: number, duration?: number, decimals?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref)
  
  useEffect(() => {
    if (isInView) {
      const timer = setInterval(() => {
        setCount(prev => {
          const increment = target / (duration * 60)
          const next = prev + increment
          return next >= target ? target : next
        })
      }, 1000 / 60)
      
      return () => clearInterval(timer)
    }
  }, [isInView, target, duration])
  
  return <span ref={ref}>{decimals === 0 ? Math.round(count) : count.toFixed(decimals)}</span>
}

// Subtle parallax background component
function ParallaxBackground() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 1000], [0, -200])
  
  return (
    <motion.div
      style={{ y }}
      className="absolute inset-0 bg-gradient-to-br from-blue-500 via-white to-blue-500"
    />
  )
}

export default function HomePage() {
  const [showContactPopup, setShowContactPopup] = useState(false)
  const [showSignupForm, setShowSignupForm] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [showContent, setShowContent] = useState(false)
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.8])

  // Animation avec délai pour afficher le contenu
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true)
    }, 1000) // Délai de 1 seconde

    return () => clearTimeout(timer)
  }, [])

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
      {/* Background with radial gradients and blobs */}
      <div className="fixed inset-0 bg-gradient-radial from-blue-400/20 via-white to-cyan-400/20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-transparent to-blue-500/30" />
        <AnimatedBlob className="w-96 h-96 bg-blue-400/30 top-10 -left-20" delay={0} />
        <AnimatedBlob className="w-80 h-80 bg-cyan-400/25 top-1/3 -right-20" delay={5} />
        <AnimatedBlob className="w-64 h-64 bg-purple-400/20 bottom-20 left-1/4" delay={10} />
        <DotsPattern className="text-blue-600" />
      </div>

      {/* HERO */}
      <motion.section 
        className="relative z-10 px-6 pt-12 pb-24 text-center max-w-3xl mx-auto"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        
        {/* Launch Offer Banner */}
        <GlassCard className="relative overflow-hidden backdrop-blur-2xl bg-gradient-to-r from-blue-600/80 via-cyan-500/80 to-green-500/80 text-white p-4 mb-8 rounded-2xl shadow-2xl border border-white/30">
          <motion.div
            className="flex items-center justify-center gap-3"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <motion.span 
              className="text-2xl"
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              🔥
            </motion.span>
            <span className="font-semibold">OFFRE DE LANCEMENT : 2 semaines gratuites + -50% pendant trois mois !</span>
          </motion.div>
        </GlassCard>
        
        <TypingTitle />
        
        {/* Texte descriptif avec animation CSS */}
        <div 
          className={`text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto transition-all duration-1000 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Votre menu digital personnalisé, élégant et à jour en permanence.<br />
          Gagnez du temps, améliorez l'expérience client, restez flexible à tout moment.
        </div>
        
        {/* Boutons avec animation CSS */}
        <div 
          className={`flex flex-col md:flex-row gap-4 justify-center items-center mb-4 transition-all duration-1000 delay-300 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Link
            href="#contact"
            className="inline-block bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-700 transition-all duration-300 hover:shadow-xl hover:scale-105"
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

      {/* FONCTIONNALITÉS */}
      <motion.section 
        className="relative py-20 px-6 bg-gradient-radial from-white via-blue-50/20 to-cyan-50/20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* Background patterns and blobs */}
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
            <GlassCard className="group p-8 rounded-2xl backdrop-blur-2xl bg-white/60 shadow-2xl border border-white/40 hover:border-white/60 transition-all duration-500 cursor-pointer">
              <motion.div
                variants={fadeInUp}
                whileTap={{ scale: 0.98 }}
                className="relative z-10"
              >
              <motion.div 
                className="text-5xl mb-6 transition-transform duration-300"
                transition={{ duration: 0.5 }}
              >
                📱
              </motion.div>
              <h3 className="text-2xl font-bold text-blue-700 mb-4 transition-colors leading-tight">
                QR code unique
              </h3>
              <p className="text-gray-600 transition-colors leading-relaxed text-lg">
                Un simple scan pour accéder à votre menu depuis n'importe quel smartphone.
              </p>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-transparent to-cyan-400/5 rounded-2xl opacity-0 transition-opacity duration-500" />
              </motion.div>
            </GlassCard>
            
            <GlassCard className="group p-8 rounded-2xl backdrop-blur-2xl bg-white/60 shadow-2xl border border-white/40 transition-all duration-500 cursor-pointer">
              <motion.div
                variants={fadeInUp}
                whileTap={{ scale: 0.98 }}
                className="relative z-10"
              >
                <motion.div 
                  className="text-5xl mb-6 transition-transform duration-300"
                  transition={{ duration: 0.5 }}
                >
                  ⚡
                </motion.div>
                <h3 className="text-2xl font-bold text-blue-700 mb-4 transition-colors leading-tight">
                  Éditeur ultra-simple
                </h3>
                <p className="text-gray-600 transition-colors leading-relaxed text-lg">
                  Modifiez prix, produits, dispo et annonces en temps réel sans aucune compétence technique.
                </p>
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 via-transparent to-blue-400/5 rounded-2xl opacity-0 transition-opacity duration-500" />
              </motion.div>
            </GlassCard>
            
            <GlassCard className="group p-8 rounded-2xl backdrop-blur-2xl bg-white/60 shadow-2xl border border-white/40 transition-all duration-500 cursor-pointer">
              <motion.div
                variants={fadeInUp}
                whileTap={{ scale: 0.98 }}
                className="relative z-10"
              >
                <motion.div 
                  className="text-5xl mb-6 transition-transform duration-300"
                  transition={{ duration: 0.5 }}
                >
                  🎨
                </motion.div>
                <h3 className="text-2xl font-bold text-blue-700 mb-4 transition-colors leading-tight">
                  Personnalisation complète
                </h3>
                <p className="text-gray-600 transition-colors leading-relaxed text-lg">
                  Logo, couleurs, textes, happy hour, évènements : tout est fait à votre image.
                </p>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 via-transparent to-cyan-400/5 rounded-2xl opacity-0 transition-opacity duration-500" />
              </motion.div>
            </GlassCard>
          </motion.div>
        </div>
      </motion.section>

      {/* TARIFS */}
      <motion.section 
        className="relative py-20 px-6 bg-gradient-radial from-blue-100/80 via-purple-50/30 to-cyan-100/80"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* Background patterns and blobs */}
        <AnimatedBlob className="w-96 h-96 bg-purple-400/20 top-0 left-10" delay={2} />
        <AnimatedBlob className="w-80 h-80 bg-blue-400/15 bottom-0 right-10" delay={7} />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.h2 
            className="text-4xl md:text-5xl font-extrabold mb-8 text-blue-700 leading-tight"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Choisissez votre formule
          </motion.h2>
          
          <GlassCard className="backdrop-blur-2xl bg-gradient-to-r from-blue-600/90 via-cyan-500/90 to-green-500/90 text-white p-6 mb-12 rounded-3xl shadow-2xl border border-white/30">
            <motion.div
              className="flex items-center justify-center gap-4"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
            <motion.span 
              className="text-3xl"
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              🔥
            </motion.span>
              <span className="font-bold text-lg">OFFRE DE LANCEMENT : 2 semaines gratuites + -50% pour les trois premiers mois sur tous les abonnements !</span>
            </motion.div>
          </GlassCard>
          
          <motion.div
            className="grid md:grid-cols-3 gap-10 text-left pt-12 items-stretch"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
          </motion.div>
            {/* Essentiel */}
            <motion.div 
              className="group relative bg-gradient-to-br from-white via-blue-50/30 to-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-700 cursor-pointer border border-blue-200/50 hover:border-blue-300/70 backdrop-blur-sm overflow-hidden h-full"
              variants={fadeInUp}
              onClick={() => handlePlanClick('essentiel')} 
              tabIndex={0} 
              role="button" 
              aria-label="Sélectionner la formule Essentiel"
              whileHover={{ 
                scale: 1.02,
                y: -12,
                boxShadow: "0 32px 64px rgba(59, 130, 246, 0.15)",
              }}
              whileTap={{ scale: 0.98 }}
            >
            </motion.div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-transparent to-cyan-400/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="relative z-10 flex flex-col h-full">
                <h3 className="text-2xl font-bold text-blue-700 mb-6 group-hover:text-blue-800 transition-colors">
                  Essentiel
                </h3>
                <div className="mb-6">
                  <motion.span 
                    className="text-lg text-gray-400 line-through font-medium"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    13,99€
                  </motion.span>
                  <motion.span 
                    className="text-5xl font-bold text-blue-700 ml-3 group-hover:text-blue-800 transition-colors"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    6.99€
                  </motion.span>
                  <span className="text-gray-600 text-lg ml-2 font-medium">/ mois</span>
                </div>
                
                <motion.div 
                  className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-sm px-4 py-2 rounded-full mb-6 inline-block font-semibold shadow-sm"
                >
                  + 2 semaines gratuites
                </motion.div>
                
                <ul className="text-gray-700 mb-8 space-y-3 flex-1">
                  <motion.li className="flex items-center text-base">
                    <CircleCheck className="text-green-600 w-5 h-5 mr-3 flex-shrink-0" /> 
                    Menu digital responsive
                  </motion.li>
                  <motion.li className="flex items-center text-base">
                    <CircleCheck className="text-green-600 w-5 h-5 mr-3 flex-shrink-0" /> 
                    Accès administrateur
                  </motion.li>
                  <motion.li className="flex items-center text-base">
                    <CircleCheck className="text-green-600 w-5 h-5 mr-3 flex-shrink-0" /> 
                    QR codes personnalisés
                  </motion.li>
                  <motion.li className="flex items-center text-base">
                    <CircleCheck className="text-green-600 w-5 h-5 mr-3 flex-shrink-0" /> 
                    Modifications illimitées
                  </motion.li>
                  <motion.li className="flex items-center text-base">
                    <CircleCheck className="text-green-600 w-5 h-5 mr-3 flex-shrink-0" /> 
                    Support email
                  </motion.li>
                </ul>
                
                <motion.button 
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-[1.02] mt-auto"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Je suis intéressé
                </motion.button>
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

            {/* Pro */}
            <motion.div 
              className="group relative bg-gradient-to-br from-white via-blue-50/40 to-cyan-50/30 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-700 cursor-pointer border-2 border-blue-300/60 hover:border-blue-400/80 backdrop-blur-sm overflow-hidden transform-gpu h-full"
              variants={fadeInUp}
              onClick={() => handlePlanClick('Pro')} 
              tabIndex={0} 
              role="button" 
              aria-label="Sélectionner la formule Pro"
              whileHover={{ 
                scale: 1.03,
                y: -16,
                boxShadow: "0 40px 80px rgba(59, 130, 246, 0.25)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-cyan-400/5 to-blue-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              {/* Popular badge */}
              <motion.div 
                className="absolute left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-900 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg z-20"
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                ⭐ La plus populaire
              </motion.div>
              
              <div className="relative z-10 pt-4 flex flex-col h-full">
                <h3 className="text-2xl font-bold text-blue-700 mb-6 group-hover:text-blue-800 transition-colors">
                  Pro
                </h3>
                <div className="mb-6">
                  <motion.span 
                    className="text-lg text-gray-400 line-through font-medium"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    25,99€
                  </motion.span>
                  <motion.span 
                    className="text-5xl font-bold text-blue-700 ml-3 group-hover:text-blue-800 transition-colors"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    12.99€
                  </motion.span>
                  <span className="text-gray-600 text-lg ml-2 font-medium">/ mois</span>
                </div>
                
                <motion.div 
                  className="bg-gradient-to-r from-green-100 via-emerald-100 to-cyan-100 text-green-800 text-sm px-4 py-2 rounded-full mb-6 inline-block font-semibold shadow-md"
                >
                  + 1 mois gratuit + QR codes imprimés
                </motion.div>
                
                <ul className="text-gray-700 mb-8 space-y-3 flex-1">
                  <motion.li className="flex items-center text-base">
                    <CircleCheck className="text-green-600 w-5 h-5 mr-3 flex-shrink-0" /> 
                    Menu digital responsive
                  </motion.li>
                  <motion.li className="flex items-center text-base">
                    <CircleCheck className="text-green-600 w-5 h-5 mr-3 flex-shrink-0" /> 
                    Accès administrateur
                  </motion.li>
                  <motion.li className="flex items-center text-base">
                    <CircleCheck className="text-green-600 w-5 h-5 mr-3 flex-shrink-0" /> 
                    QR codes personnalisés
                  </motion.li>
                  <motion.li className="flex items-center text-base">
                    <CircleCheck className="text-green-600 w-5 h-5 mr-3 flex-shrink-0" /> 
                    Modifications illimitées
                  </motion.li>
                  <motion.li className="flex items-center text-base">
                    <CircleCheck className="text-green-600 w-5 h-5 mr-3 flex-shrink-0" /> 
                    Support email & téléphonique
                  </motion.li>
                  <motion.li className="flex items-center text-base">
                    <CircleCheck className="text-green-600 w-5 h-5 mr-3 flex-shrink-0" /> 
                    QR codes imprimés (10 unités)
                  </motion.li>
                  <motion.li className="flex items-center text-base">
                    <CircleCheck className="text-green-600 w-5 h-5 mr-3 flex-shrink-0" /> 
                    Application mobile
                  </motion.li>
                  <motion.li className="flex items-center text-base">
                    <CircleCheck className="text-green-600 w-5 h-5 mr-3 flex-shrink-0" /> 
                    Gestion des stocks
                  </motion.li>
                  <motion.li className="flex items-center text-base">
                    <CircleCheck className="text-green-600 w-5 h-5 mr-3 flex-shrink-0" /> 
                    Photos personnalisées
                  </motion.li>
                </ul>
                
                <motion.button 
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all duration-300 shadow-xl hover:shadow-2xl group-hover:scale-[1.02] mt-auto"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  🚀 Je passe au Pro
                </motion.button>
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

            {/* Premium */}
            <motion.div 
              className="group relative bg-gradient-to-br from-white via-emerald-50/30 to-purple-50/20 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-700 cursor-pointer border border-emerald-200/50 hover:border-emerald-300/70 backdrop-blur-sm overflow-hidden h-full"
              variants={fadeInUp}
              onClick={() => handlePlanClick('premium')} 
              tabIndex={0} 
              role="button" 
              aria-label="Sélectionner la formule Premium"
              whileHover={{ 
                scale: 1.02,
                y: -12,
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 via-transparent to-purple-400/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="relative z-10 flex flex-col h-full">
                <h3 className="text-2xl font-bold text-blue-700 mb-6 transition-colors group-hover:text-blue-800">
                  Premium
                </h3>
                <div className="mb-6">
                  <motion.span 
                    className="text-lg text-gray-400 line-through font-medium"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    39,99€
                  </motion.span>
                  <motion.span 
                    className="text-5xl font-bold text-blue-700 ml-3 group-hover:text-blue-800 transition-colors"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    19.99€
                  </motion.span>
                  <span className="text-gray-600 text-lg ml-2 font-medium">/ mois</span>
                </div>
                
                <motion.div 
                  className="bg-gradient-to-r from-emerald-100 via-green-100 to-cyan-100 text-emerald-800 text-sm px-4 py-2 rounded-full mb-6 inline-block font-semibold shadow-sm"
                >
                  + 2 semaines gratuites + Setup complet offert
                </motion.div>
                
                <ul className="text-gray-700 mb-8 space-y-3 flex-1">
                  <motion.li className="flex items-center text-base">
                    <CircleCheck className="text-green-600 w-5 h-5 mr-3 flex-shrink-0" /> 
                    Menu digital responsive
                  </motion.li>
                  <motion.li className="flex items-center text-base">
                    <CircleCheck className="text-green-600 w-5 h-5 mr-3 flex-shrink-0" /> 
                    Accès administrateur
                  </motion.li>
                  <motion.li className="flex items-center text-base">
                    <CircleCheck className="text-green-600 w-5 h-5 mr-3 flex-shrink-0" /> 
                    QR codes personnalisés
                  </motion.li>
                  <motion.li className="flex items-center text-base">
                    <CircleCheck className="text-green-600 w-5 h-5 mr-3 flex-shrink-0" /> 
                    Modifications illimitées
                  </motion.li>
                  <motion.li className="flex items-center text-base">
                    <CircleCheck className="text-green-600 w-5 h-5 mr-3 flex-shrink-0" /> 
                    Support email & téléphonique
                  </motion.li>
                  <motion.li className="flex items-center text-base">
                    <CircleCheck className="text-green-600 w-5 h-5 mr-3 flex-shrink-0" /> 
                    QR codes imprimés (100 unités)
                  </motion.li>
                  <motion.li className="flex items-center text-base">
                    <CircleCheck className="text-green-600 w-5 h-5 mr-3 flex-shrink-0" /> 
                    Application mobile
                  </motion.li>
                  <motion.li className="flex items-center text-base">
                    <CircleCheck className="text-green-600 w-5 h-5 mr-3 flex-shrink-0" /> 
                    Gestion des stocks
                  </motion.li>
                  <motion.li className="flex items-center text-base">
                    <CircleCheck className="text-green-600 w-5 h-5 mr-3 flex-shrink-0" /> 
                    Photos personnalisées
                  </motion.li>
                  <motion.li className="flex items-center text-base">
                    <CircleCheck className="text-green-600 w-5 h-5 mr-3 flex-shrink-0" /> 
                    Nom de domaine personnalisé
                  </motion.li>
                  <motion.li className="flex items-center text-base">
                    <CircleCheck className="text-green-600 w-5 h-5 mr-3 flex-shrink-0" /> 
                    Formation personnalisée
                  </motion.li>
                  <motion.li className="flex items-center text-base">
                    <CircleCheck className="text-green-600 w-5 h-5 mr-3 flex-shrink-0" /> 
                    Gestion des événements
                  </motion.li>
                  <motion.li className="flex items-center text-base">
                    <CircleCheck className="text-green-600 w-5 h-5 mr-3 flex-shrink-0" /> 
                    Menu multilingue
                  </motion.li>
                  <motion.li className="flex items-center text-base">
                    <CircleCheck className="text-green-600 w-5 h-5 mr-3 flex-shrink-0" /> 
                    Statistiques utilisateurs
                  </motion.li>
                </ul>
                
                <motion.button 
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-[1.02] mt-auto"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ✨ Je veux le Premium
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
          >
            <p className="text-sm text-gray-600">Tous les plans incluent : Hébergement sécurisé, mises à jour automatiques, sauvegarde quotidienne</p>
            <p className="text-xs text-gray-500 mt-2">Remise de 50% appliquée automatiquement sur les 3 premiers mois d'abonnement.</p>
          </motion.div>
        </div>

        {/* Contact popup using shadcn/ui Dialog */}
        <Dialog open={showContactPopup} onOpenChange={(open) => { if (!open) closePopup() }}>
          <DialogContent className="max-w-md w-full p-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle className="flex flex-col items-center gap-2 pt-6">
                  <motion.span 
                    className="text-4xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                  >
                    🎉
                  </motion.span>
                  <span className="text-2xl font-bold text-blue-700">Profitez de l'offre de lancement !</span>
                </DialogTitle>
                <DialogDescription className="px-8">
                  <motion.div 
                    className="bg-green-100 text-green-800 p-3 rounded-lg mb-4 mt-4 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="font-semibold">Formule {selectedPlan}</p>
                    <p className="text-sm">2 semaines gratuites + réduction de 50%</p>
                  </motion.div>
                </DialogDescription>
              </DialogHeader>
              <div className="px-8 pb-8 text-center">
                <motion.p 
                  className="mb-6 text-gray-700"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Nous vous accompagnons personnellement pour mettre en ligne votre menu en moins de 24h.
                </motion.p>
                <motion.p 
                  className="text-xs text-gray-500 mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  ⚡ Offre limitée • Setup en 24h • Support français
                </motion.p>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      </motion.section>

      {/* TESTIMONIALS SECTION */}
      <motion.section 
        className="relative py-20 px-6 bg-gradient-radial from-emerald-50/50 via-white to-blue-50/30"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* Background patterns and blobs */}
        <AnimatedBlob className="w-64 h-64 bg-emerald-300/20 top-10 left-1/4" delay={4} />
        <AnimatedBlob className="w-56 h-56 bg-blue-300/15 bottom-20 right-1/4" delay={9} />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.h2 
            className="text-4xl md:text-5xl font-extrabold text-center mb-16 text-blue-700 leading-tight"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Pourquoi choisir Simple Menu ?
          </motion.h2>
          <motion.div 
            className="grid md:grid-cols-2 gap-10"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <GlassCard className="group p-8 rounded-3xl backdrop-blur-2xl bg-white/70 shadow-2xl border border-white/50 transition-all duration-500">
              <motion.div
                variants={fadeInUp}
                className="relative z-10"
              >
              <div className="flex items-center mb-6">
                <motion.div 
                  className="text-4xl mr-4 transition-transform duration-300"
                  transition={{ duration: 0.6 }}
                >
                  💰
                </motion.div>
                                  <h3 className="text-2xl font-bold text-blue-700 transition-colors">
                    Économisez jusqu'à <AnimatedCounter target={300} decimals={0} />€/mois
                  </h3>
              </div>
              <p className="text-gray-700 transition-colors text-lg leading-relaxed">
                Fini les coûts d'impression, de livraison et de stockage de menus papier.
              </p>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-transparent to-cyan-400/5 rounded-3xl opacity-0 transition-opacity duration-500" />
              </motion.div>
            </GlassCard>
            
            <GlassCard className="group p-8 rounded-3xl backdrop-blur-2xl bg-white/70 shadow-2xl border border-white/50 transition-all duration-500">
              <motion.div
                variants={fadeInUp}
                className="relative z-10"
              >
              <div className="flex items-center mb-6">
                <motion.div 
                  className="text-4xl mr-4 transition-transform duration-300"
                  transition={{ duration: 0.6 }}
                >
                  ⚡
                </motion.div>
                <h3 className="text-2xl font-bold text-blue-700 transition-colors">
                  Mise à jour instantanée
                </h3>
              </div>
              <p className="text-gray-700 transition-colors text-lg leading-relaxed">
                Changez vos prix et disponibilités en <AnimatedCounter target={30} decimals={0} /> secondes, même en plein service.
              </p>
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 via-transparent to-blue-400/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            </GlassCard>
          </motion.div>
        </div>
      </motion.section>

      {/* CONTACT */}
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
          className="flex flex-col gap-4"
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
             <motion.footer 
         className="text-center text-sm text-gray-500 py-6 border-t"
         initial={{ opacity: 0 }}
         whileInView={{ opacity: 1 }}
         transition={{ duration: 0.6 }}
         viewport={{ once: true }}
       >
         © {new Date().getFullYear()} Simple-Menu — Conçu avec passion 🧑‍🍳
       </motion.footer>

      {/* Signup Form Modal */}
      <Dialog open={showSignupForm} onOpenChange={setShowSignupForm}>
        <DialogContent className="max-w-6xl w-full flex flex-col max-h-[90vh] overflow-hidden">
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
      
     </main>
  )
}
