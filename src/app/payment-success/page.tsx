'use client'

import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'
import { notFound, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, ArrowRight, AlertCircle, Loader2, Mail } from 'lucide-react'
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = searchParams.get('slug');
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [loadingButton, setLoadingButton] = useState<null | 'dashboard' | 'home'>(null);

  if (!slug) return notFound();

  // Verify payment and establishment on component mount
  useEffect(() => {
    if (slug) {
      verifyPayment();
    }
  }, [slug]);

  // Confetti effect when payment is validated and establishment is active
  useEffect(() => {
    if (
      verification?.verified &&
      verification?.paymentVerified &&
      verification?.establishment?.isActive
    ) {
      // Launch confetti from multiple points for 3 seconds
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }
        const particleCount = 50 * (timeLeft / duration);
        // Left side
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        // Right side
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);
      return () => clearInterval(interval);
    }
  }, [verification]);

  const verifyPayment = async () => {
    try {
      setIsVerifying(true);
      const response = await fetch(`/api/verify-payment?slug=${slug}`);
      const result = await response.json();
      setVerification(result);
    } catch (error) {
      setVerification({
        verified: false,
        error: 'Erreur lors de la vérification du paiement'
      });
    } finally {
      setIsVerifying(false);
    }
  };

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
    );
  }

  if (!verification?.verified || (!verification?.paymentVerified && !verification?.establishment?.isActive)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold text-destructive mb-2">
              Erreur de vérification
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-red-50 border border-destructive/20 rounded-lg p-4">
              <p className="text-destructive font-semibold text-base mb-1">
                Une erreur est survenue lors de la vérification du paiement.
              </p>
              <p className="text-destructive text-sm">
                Veuillez réessayer. Si le problème persiste, contactez-nous&nbsp;:
                <a className="underline ml-1" href="mailto:contact.simplemenu@gmail.com">contact.simplemenu@gmail.com</a>
              </p>
            </div>
            <div className="space-y-3 pt-2">
              <Button onClick={verifyPayment} className="w-full bg-blue-600 hover:bg-blue-700">
                Réessayer la vérification
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">
                  Retour à l'accueil
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
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
              {/* Highlighted next steps box */}
              <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-600 shadow-sm mb-3">
                <p className="text-base text-blue-800 font-semibold mb-4 flex items-center gap-2 justify-center">
                  <span className="flex items-center justify-center w-7 h-7 bg-blue-100 rounded-full"><Mail className="w-5 h-5 text-blue-600" /></span>
                  Prochaines étapes :
                </p>
                <ol className="list-decimal list-inside space-y-1 text-left max-w-xs mx-auto">
                  <li className="text-sm text-blue-700 font-medium">Consultez votre boîte email</li>
                  <li className="text-sm text-blue-700 font-medium">Utilisez le mot de passe temporaire reçu</li>
                  <li className="text-sm text-blue-700 font-medium">Accédez à votre tableau de bord via le lien</li>
                </ol>
              </div>
            </div>
          )}

          {slug && (
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={e => {
                e.preventDefault();
                setLoadingButton('dashboard');
                router.push(`/e/${slug}/admin`);
              }}
              disabled={loadingButton !== null}
            >
              {loadingButton === 'dashboard' ? (
                <span className="flex items-center justify-center"><Loader2 className="w-4 h-4 animate-spin mr-2" />Redirection...</span>
              ) : (
                'Accéder au tableau de bord'
              )}
            </Button>
          )}

          <div className="space-y-3">
            <Button
              variant={!slug ? "default" : "outline"}
              className={`w-full ${!slug ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
              onClick={e => {
                e.preventDefault();
                setLoadingButton('home');
                router.push("/");
              }}
              disabled={loadingButton !== null}
            >
              {loadingButton === 'home' ? (
                <span className="flex items-center justify-center"><Loader2 className="w-4 h-4 animate-spin mr-2" />Redirection...</span>
              ) : (
                <><ArrowRight className="w-4 h-4 mr-1" />Retour à l'accueil</>
              )}
            </Button>
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

export default function PaymentSuccessPage() {
  return (
    <PaymentSuccessContent />
  )
}
