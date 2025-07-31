'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface PaymentStatusBannerProps {
  paymentStatus: string
  sessionId?: string
}

export function PaymentStatusBanner({ paymentStatus, sessionId }: PaymentStatusBannerProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<any>(null)

  useEffect(() => {
    if (paymentStatus === 'success' && sessionId) {
      verifyPayment()
    }
  }, [paymentStatus, sessionId])

  const verifyPayment = async () => {
    setIsVerifying(true)
    try {
      const response = await fetch(`/api/stripe/verify-payment?session_id=${sessionId}`)
      const result = await response.json()
      
      if (response.ok && result.success) {
        setVerificationResult(result)
        toast.success('Paiement confirmé !', {
          description: 'Votre abonnement est maintenant actif.',
          duration: 4000
        })
      } else {
        toast.error('Erreur de vérification', {
          description: 'Impossible de vérifier le statut du paiement.',
          duration: 3000
        })
      }
    } catch (error) {
      toast.error('Erreur de connexion', {
        description: 'Vérifiez votre connexion internet.',
        duration: 3000
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const removeFromUrl = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete('payment')
    url.searchParams.delete('session_id')
    window.history.replaceState({}, '', url.toString())
  }

  if (paymentStatus === 'success') {
    return (
      <Card className="mb-6 border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            {isVerifying ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
            {isVerifying ? 'Vérification du paiement...' : '🎉 Paiement réussi !'}
          </CardTitle>
          <CardDescription>
            {isVerifying 
              ? 'Nous vérifions votre paiement, veuillez patienter...'
              : 'Votre abonnement Simple Menu est maintenant actif.'
            }
          </CardDescription>
        </CardHeader>
        {!isVerifying && verificationResult && (
          <CardContent>
            <div className="space-y-2 text-sm text-green-700">
              <p><strong>Plan :</strong> {verificationResult.establishment?.plan}</p>
              <p><strong>Statut :</strong> {verificationResult.establishment?.planStatus}</p>
              {verificationResult.session?.customerEmail && (
                <p><strong>Email de facturation :</strong> {verificationResult.session.customerEmail}</p>
              )}
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-green-600">
                ✅ Votre période d'essai gratuite d'un mois a commencé
              </p>
              <p className="text-sm text-green-600">
                ✅ Vous bénéficiez de -50% sur les 3 prochains mois
              </p>
              <p className="text-sm text-green-600">
                ✅ Vous pouvez maintenant configurer votre menu
              </p>
            </div>
            <Button 
              onClick={removeFromUrl} 
              variant="outline" 
              size="sm" 
              className="mt-4"
            >
              Continuer
            </Button>
          </CardContent>
        )}
      </Card>
    )
  }

  if (paymentStatus === 'cancel') {
    return (
      <Card className="mb-6 border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700">
            <XCircle className="w-5 h-5" />
            Paiement annulé
          </CardTitle>
          <CardDescription>
            Votre paiement a été annulé. Votre compte reste en mode d'essai.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-orange-700">
            <p>• Vous pouvez toujours configurer votre menu en mode d'essai</p>
            <p>• Vous avez jusqu'à la fin de votre période d'essai pour vous abonner</p>
            <p>• Contactez-nous si vous avez des questions</p>
          </div>
          <div className="mt-4 flex gap-2">
            <Button 
              onClick={() => window.location.href = '/'} 
              variant="outline" 
              size="sm"
            >
              Choisir un plan
            </Button>
            <Button 
              onClick={removeFromUrl} 
              variant="outline" 
              size="sm"
            >
              Continuer en mode d'essai
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}
