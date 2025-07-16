'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface VerificationResult {
  verified: boolean
  paymentVerified?: boolean
  establishment?: {
    id: string
    name: string
    slug: string
    plan: string
    planStatus: string
    isActive: boolean
    createdAt: string
  }
  error?: string
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const slug = searchParams.get('slug')
  const [verification, setVerification] = useState<VerificationResult | null>(null)
  const [isVerifying, setIsVerifying] = useState(true)

  // Verify payment and establishment on component mount
  useEffect(() => {
    if (slug) {
      verifyPayment()
    }
  }, [slug])

  const verifyPayment = async () => {
    try {
      setIsVerifying(true)
      const response = await fetch(`/api/verify-payment?slug=${slug}`)
      const result = await response.json()
      setVerification(result)
    } catch (error) {
      setVerification({
        verified: false,
        error: 'Erreur lors de la vérification du paiement'
      })
    } finally {
      setIsVerifying(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-2xl text-gray-900">
              Vérification du paiement...
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600">
              Nous vérifions votre paiement et créons votre établissement.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!verification?.verified || (!verification?.paymentVerified && !verification?.establishment?.isActive)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">
              Problème de vérification
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              {verification?.error || 'Nous n\'avons pas pu vérifier votre paiement.'}
            </p>
            <div className="space-y-3">
              <Button onClick={verifyPayment} className="w-full bg-blue-600 hover:bg-blue-700">
                Réessayer la vérification
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">
                  Retour à l'accueil
                </Link>
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-6">
              <p>
                Si le problème persiste, contactez-nous à{' '}
                <a href="mailto:contact.simplemenu@gmail.com" className="text-blue-600 hover:underline">
                  contact.simplemenu@gmail.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-gray-900">
            Paiement confirmé !
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Votre abonnement a été confirmé avec succès !
          </p>
          
          {verification.establishment && (
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800 mb-2">
                Votre établissement <strong>{verification.establishment.name}</strong> est maintenant créé et activé !
              </p>
              <p className="text-xs text-green-700 mb-3">
                Plan: {verification.establishment.plan} • Statut: {verification.establishment.planStatus}
              </p>
              
              <div className="bg-blue-50 p-3 rounded border border-blue-200 mb-3">
                <p className="text-sm text-blue-800 font-semibold mb-2">
                  📧 Prochaines étapes :
                </p>
                <p className="text-xs text-blue-700 mb-1">
                  1. Consultez votre boîte email
                </p>
                <p className="text-xs text-blue-700 mb-1">
                  2. Utilisez le mot de passe temporaire reçu
                </p>
                <p className="text-xs text-blue-700">
                  3. Accédez à votre tableau de bord via le lien
                </p>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/">
                <ArrowRight className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </Link>
            </Button>
            
            {slug && (
              <Button asChild variant="outline" className="w-full">
                <Link href={`/e/${slug}/admin`}>
                  Accéder directement au tableau de bord
                </Link>
              </Button>
            )}
          </div>
          
          <div className="text-xs text-gray-500 mt-6">
            <p>🎉 Profitez de vos 2 semaines d'essai gratuit !</p>
            <p className="mt-2">
              Vous avez des questions ?{' '}
              <a href="mailto:contact.simplemenu@gmail.com" className="text-blue-600 hover:underline">
                Contactez-nous
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function LoadingSuccess() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <CardTitle className="text-2xl text-gray-900">
            Traitement...
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<LoadingSuccess />}>
      <PaymentSuccessContent />
    </Suspense>
  )
}
