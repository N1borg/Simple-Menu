'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { notFound } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { WelcomeSetup } from '@/components/WelcomeSetup'

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
  const router = useRouter()

  useEffect(() => {
    async function initializePage() {
      try {
        const resolvedParams = await params
        const currentSlug = resolvedParams.slug
        
        // Block demo mode immediately
        if (currentSlug === 'demo') {
          notFound()
          return
        }
        
        setSlug(currentSlug)

        // Check authentication immediately
        const authResponse = await fetch('/api/admin/establishment-info', {
          credentials: 'include'
        })
          
        if (!authResponse.ok) {
          // Not authenticated, return 404
          notFound()
          return
        }

        // Get establishment data
        const response = await fetch(`/api/admin/establishment-info?slug=${currentSlug}`, {
          credentials: 'include'
        })

        if (!response.ok) {
          notFound()
          return
        }

        const establishmentData = await response.json()

        // Check if setup is already completed (has primary color)
        if (establishmentData.primary_color) {
          notFound()
          return
        }

        setEstablishment(establishmentData)
      } catch (err) {
        console.error('Error initializing setup page:', err)
        notFound()
        return
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

  if (!establishment) {
    notFound()
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
