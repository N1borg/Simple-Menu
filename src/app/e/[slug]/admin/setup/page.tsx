'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { WelcomeSetup } from '@/components/WelcomeSetup'
import NotFound from '@/app/not-found'

interface PageProps {
  params: Promise<{ slug: string }>
}

interface EstablishmentData {
  id: string
  name: string
  slug: string
  logo_url?: string
  primary_color?: string
}

export default function WelcomeSetupPage({ params }: PageProps) {
  const [slug, setSlug] = useState<string>('')
  const [establishment, setEstablishment] = useState<EstablishmentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function initializePage() {
      try {
        const resolvedParams = await params
        const currentSlug = resolvedParams.slug
        setSlug(currentSlug)

        // Check authentication by calling a protected API endpoint
        try {
          const authResponse = await fetch('/api/admin/establishment-info', {
            credentials: 'include'
          })
          
          if (!authResponse.ok) {
            // Not authenticated, redirect to login (unless demo mode)
            if (currentSlug !== 'demo') {
              router.push(`/e/${currentSlug}/admin`)
              return
            }
          }
        } catch {
          // Authentication check failed, redirect to login (unless demo mode)
          if (currentSlug !== 'demo') {
            router.push(`/e/${currentSlug}/admin`)
            return
          }
        }

        // Get establishment data
        const response = await fetch(`/api/admin/establishment-info?slug=${currentSlug}`, {
          credentials: 'include'
        })

        if (!response.ok) {
          setError('Establishment not found')
          return
        }

        const establishmentData = await response.json()

        // Check if setup is already completed (has primary color)
        if (establishmentData.primary_color) {
          setError('setup_completed')
          return
        }

        // Block demo mode from accessing setup
        if (currentSlug === 'demo') {
          setError('demo_blocked')
          return
        }

        setEstablishment(establishmentData)
      } catch (err) {
        console.error('Error initializing setup page:', err)
        setError('An error occurred while loading the page')
      } finally {
        setLoading(false)
      }
    }

    initializePage()
  }, [params, router])

  const handleComplete = () => {
    router.push(`/e/${slug}/admin?tutorial=start`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement de la configuration...</p>
        </div>
      </div>
    )
  }

  if (error || !establishment) {
    return <NotFound />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <WelcomeSetup
        isOpen={true}
        onComplete={handleComplete}
        establishmentName={establishment.name}
        establishmentSlug={establishment.slug}
        establishmentId={establishment.id}
        currentLogo={establishment.logo_url || undefined}
      />
    </div>
  )
}
