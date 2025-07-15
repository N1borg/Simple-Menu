'use client'

import { useCallback, useEffect, useState } from 'react'
import { driver } from 'driver.js'
import confetti from 'canvas-confetti'
import 'driver.js/dist/driver.css'

export const useDashboardTutorial = () => {
  const [tutorialCompleted, setTutorialCompleted] = useState(false)
  const celebrateCompletion = () => {
    // Launch confetti from multiple points
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      
      // Left side
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      })
      
      // Right side
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      })
    }, 250)
  }

  const waitForElement = (selector: string, timeout = 10000): Promise<Element> => {
    return new Promise((resolve, reject) => {
      console.log(`Waiting for element: ${selector}`)
      const element = document.querySelector(selector)
      if (element) {
        console.log(`Element ${selector} found immediately`)
        resolve(element)
        return
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector)
        if (element) {
          console.log(`Element ${selector} found via observer`)
          observer.disconnect()
          resolve(element)
        }
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true
      })

      setTimeout(() => {
        observer.disconnect()
        console.log(`Timeout waiting for element: ${selector}`)
        reject(new Error(`Element ${selector} not found within ${timeout}ms`))
      }, timeout)
    })
  }

  const waitForCategoryCreation = async (driverObj: any) => {
    return new Promise<void>((resolve) => {
      console.log('Waiting for category creation...')
      
      const checkCategoryExists = () => {
        const categoryElement = document.querySelector('.category-section')
        if (categoryElement) {
          console.log('Category section found!')
          resolve()
          return true
        }
        return false
      }

      // Check immediately
      if (checkCategoryExists()) return

      // Set up observer
      const observer = new MutationObserver(() => {
        if (checkCategoryExists()) {
          observer.disconnect()
        }
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true
      })

      // Don't timeout - keep waiting until user creates category
    })
  }

  const waitForItemCreation = async (driverObj: any) => {
    return new Promise<void>((resolve) => {
      console.log('Waiting for item creation...')
      
      const checkItemExists = () => {
        const itemElement = document.querySelector('.menu-item-card')
        if (itemElement) {
          console.log('Menu item found!')
          resolve()
          return true
        }
        return false
      }

      // Check immediately
      if (checkItemExists()) return

      // Set up observer
      const observer = new MutationObserver(() => {
        if (checkItemExists()) {
          observer.disconnect()
        }
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true
      })

      // Don't timeout - keep waiting until user creates item
    })
  }

  const waitForParameterSheetOpen = async (driverObj: any) => {
    return new Promise<void>((resolve) => {
      console.log('Waiting for parameter sheet to open...')
      
      const checkSheetOpen = () => {
        const sheetElement = document.querySelector('[data-state="open"]')
        if (sheetElement) {
          console.log('Parameter sheet opened!')
          resolve()
          return true
        }
        return false
      }

      // Check immediately
      if (checkSheetOpen()) return

      // Set up observer
      const observer = new MutationObserver(() => {
        if (checkSheetOpen()) {
          observer.disconnect()
        }
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-state']
      })

      // Cleanup observer if component unmounts
      setTimeout(() => observer.disconnect(), 30000)
    })
  }

  const waitForParameterSheetClose = async () => {
    return new Promise<void>((resolve) => {
      console.log('Waiting for parameter sheet to close...')
      
      const checkSheetClosed = () => {
        // Check that no sheet with data-state="open" exists
        const openSheet = document.querySelector('[data-state="open"]')
        if (!openSheet) {
          console.log('Parameter sheet closed!')
          resolve()
          return true
        }
        return false
      }

      // Check immediately
      if (checkSheetClosed()) return

      // Set up observer
      const observer = new MutationObserver(() => {
        if (checkSheetClosed()) {
          observer.disconnect()
        }
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-state']
      })

      // Cleanup observer if component unmounts
      setTimeout(() => observer.disconnect(), 30000)
    })
  }

  const startTutorial = useCallback(() => {
    try {
      console.log('Starting tutorial...')
      
      // Check if tutorial elements exist
      const welcomeElement = document.querySelector('.tutorial-welcome')
      const addCategoryElement = document.querySelector('.tutorial-add-category')
      
      console.log('Tutorial elements:', { welcomeElement, addCategoryElement })
      
      if (!welcomeElement) {
        console.error('Welcome element not found!')
        return
      }
      
      const driverObj = driver({
        showProgress: true,
        allowClose: false,
        disableActiveInteraction: false,
        smoothScroll: true,
        stagePadding: 4,
        stageRadius: 8,
        popoverClass: 'dashboard-tutorial-popover',
        steps: [
          {
            element: '.tutorial-welcome',
            popover: {
              title: '🎉 Bienvenue dans votre tableau de bord !',
              description: 'Je vais vous guider pour créer votre premier menu. Suivez les étapes et interagissez avec les vrais éléments !',
              showButtons: ['next'],
              nextBtnText: 'Commencer le tutoriel →'
            }
          },
        {
          element: '.tutorial-add-category',
          popover: {
            title: '📁 Créer votre première catégorie',
            description: 'Cliquez sur ce bouton pour créer votre première catégorie (ex: Entrées, Plats, Desserts). Je ne vous laisserai pas continuer tant que vous ne créez pas une catégorie !',
            showButtons: [],
          },
          onHighlighted: async () => {
            await waitForCategoryCreation(driverObj)
            // Auto-advance once category is created
            setTimeout(() => driverObj.moveNext(), 500)
          }
        },
        {
          element: '.tutorial-add-item',
          popover: {
            title: '🍽️ Ajouter un plat',
            description: 'Parfait ! Maintenant cliquez sur le bouton "+" pour ajouter votre premier plat à cette catégorie. Je ne vous laisserai pas continuer tant que vous n\'ajoutez pas un plat !',
            showButtons: [],
          },
          onHighlighted: async () => {
            await waitForItemCreation(driverObj)
            // Auto-advance once item is created
            setTimeout(() => driverObj.moveNext(), 500)
          }
        },
        {
          element: '.tutorial-admin-banner',
          popover: {
            title: '👑 Bannière d\'administration',
            description: 'Cette bannière vous indique que vous êtes en mode administrateur. Vos visiteurs ne la verront pas - elle n\'apparaît que pour vous !',
            showButtons: ['next'],
            nextBtnText: 'Compris !'
          }
        },
        {
          element: '.tutorial-parameters-button',
          popover: {
            title: '⚙️ Panneau de paramètres',
            description: 'Cliquez sur ce bouton pour ouvrir le panneau de paramètres. Je ne vous laisserai pas continuer tant que vous ne l\'ouvrez pas !',
            showButtons: [],
          },
          onHighlighted: async () => {
            await waitForParameterSheetOpen(driverObj)
            // Auto-advance once sheet is opened
            setTimeout(() => driverObj.moveNext(), 500)
          }
        },
        {
          element: '.tutorial-qr-code',
          popover: {
            title: '📱 QR Code',
            description: 'Générez un QR Code pour que vos clients accèdent facilement à votre menu depuis leur téléphone.',
            showButtons: ['next'],
            nextBtnText: 'Suivant →'
          }
        },
        {
          element: '.tutorial-color-settings',
          popover: {
            title: '🎨 Couleur de l\'établissement',
            description: 'Personnalisez la couleur principale de votre menu pour qu\'elle corresponde à votre image de marque.',
            showButtons: ['next'],
            nextBtnText: 'Suivant →'
          }
        },
        {
          element: '.tutorial-password-change',
          popover: {
            title: '🔒 Changer le mot de passe',
            description: 'Modifiez votre mot de passe administrateur pour sécuriser l\'accès à votre tableau de bord.',
            showButtons: ['next'],
            nextBtnText: 'Suivant →'
          }
        },
        {
          element: '.tutorial-logout',
          popover: {
            title: '🚪 Déconnexion',
            description: 'Utilisez ce bouton pour vous déconnecter en toute sécurité de votre espace administrateur.',
            showButtons: ['next'],
            nextBtnText: 'Suivant →'
          }
        },
        {
          element: '[data-testid="sheet-close"]',
          popover: {
            title: '✨ Fermer le panneau',
            description: 'Maintenant, fermez ce panneau de paramètres en cliquant sur ce bouton. Je ne vous laisserai pas continuer tant que vous ne fermez pas le panneau !',
            showButtons: [],
          },
          onHighlighted: async () => {
            await waitForParameterSheetClose()
            // Auto-advance once sheet is closed
            setTimeout(() => driverObj.moveNext(), 500)
          }
        },
        {
          popover: {
            title: '🎊 Félicitations !',
            description: 'Vous maîtrisez maintenant votre tableau de bord ! Votre menu est prêt à être partagé avec vos clients. Vous pouvez relancer ce tutoriel à tout moment depuis les paramètres.',
            showButtons: ['next'],
            nextBtnText: 'Terminer ✨'
          },
          onDeselected: () => {
            // Launch confetti after a short delay
            setTimeout(() => {
              celebrateCompletion()
              
              // Mark tutorial as completed in memory only
              setTutorialCompleted(true)
            }, 500)
          }
        }
      ],
      onDestroyed: () => {
        // Cleanup
        const sheet = document.querySelector('[data-state="open"]')
        if (sheet) {
          const closeButton = document.querySelector('[data-testid="sheet-close"]') as HTMLElement
          if (closeButton) {
            closeButton.click()
          }
        }
      }
    })

      driverObj.drive()
      console.log('Tutorial started successfully')
      return driverObj
    } catch (error) {
      console.error('Error starting tutorial:', error)
      return null
    }
  }, [])

  const resetTutorial = useCallback(() => {
    setTutorialCompleted(false)
  }, [])

  // Listen for setup completion via URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const shouldStartTutorial = urlParams.get('tutorial') === 'start'
    
    if (shouldStartTutorial && !tutorialCompleted) {
      console.log('URL parameter detected - auto-starting tutorial after setup completion')
      
      // Remove the parameter from URL without page refresh
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
      
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        startTutorial()
      }, 1000)
    }
  }, [startTutorial, tutorialCompleted])

  return { 
    startTutorial, 
    resetTutorial,
    tutorialCompleted,
    shouldShowTutorial: () => !tutorialCompleted
  }
}
