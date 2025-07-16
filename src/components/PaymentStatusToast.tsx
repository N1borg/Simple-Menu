"use client"

import { useEffect } from 'react'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'

interface PaymentStatusToastProps {
  onPaymentSuccess?: () => void
}

export function PaymentStatusToast({ onPaymentSuccess }: PaymentStatusToastProps) {
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const paymentStatus = searchParams.get('payment')
    const sessionId = searchParams.get('session_id')
    
    if (paymentStatus === 'success' && sessionId) {
      toast.success('Paiement confirmé avec succès !', {
        description: 'Votre établissement est maintenant actif.',
        duration: 5000,
      })
      onPaymentSuccess?.()
    } else if (paymentStatus === 'cancelled') {
      toast.error('Paiement annulé', {
        description: 'Vous pouvez réessayer à tout moment.',
        duration: 4000,
      })
    } else if (paymentStatus === 'error') {
      toast.error('Erreur de paiement', {
        description: 'Une erreur est survenue lors du traitement de votre paiement.',
        duration: 4000,
      })
    }
  }, [searchParams, onPaymentSuccess])

  return null
}
