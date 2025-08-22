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
      const element = document.querySelector(selector)
      if (element) {
        resolve(element)
        return
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector)
        if (element) {
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
        reject(new Error(`Element ${selector} not found within ${timeout}ms`))
      }, timeout)
    })
  }

  const waitForCategoryCreation = async (driverObj: any) => {
    return new Promise<void>((resolve) => {
      
      const checkCategoryExists = () => {
        const categoryElement = document.querySelector('.category-section')
        if (categoryElement) {
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
      
      const checkItemExists = () => {
        const itemElement = document.querySelector('.menu-item-card')
        if (itemElement) {
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
      
      const checkSheetOpen = () => {
        const sheetElement = document.querySelector('[data-state="open"]')
        if (sheetElement) {
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
    })
  }

  const waitForParameterSheetClose = async () => {
    return new Promise<void>((resolve) => {
      
      const checkSheetClosed = () => {
        // Check that no sheet with data-state="open" exists
        const openSheet = document.querySelector('[data-state="open"]')
        if (!openSheet) {
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
    })
  }

    const waitForItemDialogOpen = async () => {
    return new Promise<void>((resolve) => {
      
      const checkItemDialogOpen = () => {
        // Check that no dialog with role="dialog" exists
        const openDialog = document.querySelector('[data-state="open"]')
        if (openDialog) {
          resolve()
          return true
        }
        return false
      }

      // Check immediately
      if (checkItemDialogOpen()) return

      // Set up observer
      const observer = new MutationObserver(() => {
        if (checkItemDialogOpen()) {
          observer.disconnect()
        }
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-state']
      })
    })
  }

  const waitForItemDialogClose = async () => {
    return new Promise<void>((resolve) => {

      const checkDialogClosed = () => {
        // Check that no dialog with data-state="open" exists
        const openDialog = document.querySelector('[data-state="open"]')
        if (!openDialog) {
          resolve()
          return true
        }
        return false
      }

      // Check immediately
      if (checkDialogClosed()) return

      // Set up observer
      const observer = new MutationObserver(() => {
        if (checkDialogClosed()) {
          observer.disconnect()
        }
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-state']
      })
    })
  }

  const startTutorial = useCallback(() => {
    try {
      const driverObj = driver({
        showProgress: true,
        allowClose: false,
        disableActiveInteraction: true,
        smoothScroll: true,
        stagePadding: 4,
        stageRadius: 8,
        popoverClass: 'dashboard-tutorial-popover',
        steps: [
          // {
          //   popover: {
          //     title: 'Bienvenue dans votre tableau de bord !',
          //     description: 'Je vais vous présenter l\'interface et vous guider pour créer votre premier menu.',
          //     showButtons: ['close', 'next'],
          //     nextBtnText: 'Commencer'
          //   }
          // },
          // {
          //   element: '.tutorial-admin-banner',
          //   popover: {
          //     title: 'Bannière d\'administration',
          //     description: 'En haut se trouve la bannière d\'administration. Elle vous permet de passer en mode éditeur ou mode public. Vos visiteurs ne la verront pas.',
          //     showButtons: ['close', 'next'],
          //     nextBtnText: 'Suivant'
          //   }
          // },
          // {
          //   element: '.tutorial-logo-section',
          //   popover: {
          //     title: 'Section du logo',
          //     description: 'Ici vous pouvez ajouter le logo de votre établissement, cela rajoute une identité au menu.',
          //     showButtons: ['close', 'next'],
          //     nextBtnText: 'Suivant'
          //   }
          // },
          // {
          //   element: '.tutorial-category-section',
          //   popover: {
          //     title: 'Zone des catégories',
          //     description: 'Cette zone affichera la partie principale du menu. Vous pouvez créer des catégories qui comportent différents éléments (Boissons, Plats...).',
          //     showButtons: ['close', 'next'],
          //     nextBtnText: 'Suivant'
          //   }
          // },
          // {
          //   element: '.tutorial-establishment-info-form',
          //   popover: {
          //     title: 'Gérer les informations de l\'établissement',
          //     description: 'Ces menus vous permettent de configurer les informations de votre établissement, telles que le nom, l\'adresse et les horaires.',
          //     showButtons: ['close', 'next'],
          //     nextBtnText: 'Suivant'
          //   }
          // },
          // {
          //   element: '.tutorial-footer-section',
          //   popover: {
          //     title: 'Pied de page',
          //     description: 'Vous retrouverez donc ces informations ici en bas de page, visibles pour le client.',
          //     showButtons: ['close', 'next'],
          //     nextBtnText: 'Suivant'
          //   }
          // },
          // {
          //   element: '.tutorial-parameters-button',
          //   popover: {
          //     title: 'Les paramètres globaux',
          //     description: 'Ce menu gère les paramètres globaux de l\'établissement. Cliquez sur ce bouton pour ouvrir le panneau de paramètres.',
          //     showButtons: ['close'],
          //   },
          //   onHighlighted: async () => {
          //     // Enable interaction for the parameters button and its children
          //     const paramButton = document.querySelector('.tutorial-parameters-button')
          //     const paramButtonChild = document.querySelector('.tutorial-parameters-button button')
              
          //     if (paramButton) {
          //       paramButton.classList.add('tutorial-element-interactive')
          //     }
          //     if (paramButtonChild) {
          //       paramButtonChild.classList.add('tutorial-element-interactive')
          //     }
              
          //     await waitForParameterSheetOpen(driverObj)
          //     // Auto-advance once sheet is opened
          //     setTimeout(() => driverObj.moveNext(), 500)
          //   },
          //   onDeselected: () => {
          //     // Re-disable interactions
          //     const paramButton = document.querySelector('.tutorial-parameters-button')
          //     const paramButtonChild = document.querySelector('.tutorial-parameters-button button')
              
          //     if (paramButton) {
          //       paramButton.classList.remove('tutorial-element-interactive')
          //     }
          //     if (paramButtonChild) {
          //       paramButtonChild.classList.remove('tutorial-element-interactive')
          //     }
          //   }
          // },
          // {
          //   element: '.tutorial-quota-section',
          //   popover: {
          //     title: 'Quotas de l\'établissement',
          //     description: 'En haut du panneau, vous verrez les quotas et fonctionnalités incluses de votre plan.',
          //     showButtons: ['close', 'next'],
          //     nextBtnText: 'Suivant'
          //   }
          // },
          // {
          //   element: '.tutorial-color-settings',
          //   popover: {
          //     title: 'Couleur de l\'établissement',
          //     description: 'Personnalisez la couleur principale de votre menu pour qu\'elle corresponde à votre image de marque.',
          //     showButtons: ['close', 'next'],
          //     nextBtnText: 'Suivant'
          //   }
          // },
          // {
          //   element: '.tutorial-qr-code',
          //   popover: {
          //     title: 'QR Code',
          //     description: 'Générez un QR Code pour votre menu public ou pour accéder à cette page d\'administration (évitez de le partager publiquement).',
          //     showButtons: ['close', 'next'],
          //     nextBtnText: 'Suivant'
          //   }
          // },
          // {
          //   element: '.tutorial-basket-section',
          //   popover: {
          //     title: 'Panier',
          //     description: 'Activez ou désactivez le panier, il permet aux clients de sauvegarder leurs choix dans une liste.',
          //     showButtons: ['close', 'next'],
          //     nextBtnText: 'Suivant'
          //   }
          // },
          // {
          //   element: '.tutorial-password-change',
          //   popover: {
          //     title: 'Changer le mot de passe',
          //     description: 'Vous pouvez modifier votre mot de passe administrateur ici. Assurez-vous de le garder secret !',
          //     showButtons: ['close', 'next'],
          //     nextBtnText: 'Suivant'
          //   }
          // },
          // {
          //   element: '.tutorial-help-section',
          //   popover: {
          //     title: 'Section d\'aide',
          //     description: 'La section d\'aide afin de (re)lancer ce tutoriel ou contacter le support.',
          //     showButtons: ['close', 'next'],
          //     nextBtnText: 'Suivant'
          //   }
          // },
          // {
          //   element: '.tutorial-logout',
          //   popover: {
          //     title: 'Déconnexion',
          //     description: 'En bas du panneau, utilisez ce bouton pour vous déconnecter en toute sécurité de votre espace administrateur.',
          //     showButtons: ['close', 'next'],
          //     nextBtnText: 'Suivant'
          //   }
          // },
          // {
          //   element: '[data-testid="sheet-close"]',
          //   popover: {
          //     title: 'Fermer le panneau',
          //     description: 'Maintenant, fermez ce panneau, on va créer un nouveau menu.',
          //     showButtons: ['close'],
          //   },
          //   onHighlighted: async () => {
          //     // Enable interaction only for the close button
          //     const closeButton = document.querySelector('[data-testid="sheet-close"]')
          //     if (closeButton) {
          //       closeButton.classList.add('tutorial-element-interactive')
          //     }
          //     await waitForParameterSheetClose()
          //     // Auto-advance once sheet is closed
          //     setTimeout(() => driverObj.moveNext(), 500)
          //   },
          //   onDeselected: () => {
          //     // Re-disable interactions
          //     const closeButton = document.querySelector('[data-testid="sheet-close"]')
          //     if (closeButton) {
          //       closeButton.classList.remove('tutorial-element-interactive')
          //     }
          //   }
          // },
          {
            element: '.tutorial-add-category',
            popover: {
              title: 'Créer votre première catégorie',
              description: 'Créez votre première catégorie en cliquant sur ce bouton.',
              showButtons: ['close'],
            },
            onHighlighted: async () => {
              // Enable interaction for the add category button and its children
              const allButtons = document.querySelectorAll('.tutorial-add-category button, .tutorial-add-category [role="button"], .tutorial-add-category')
              
              allButtons.forEach(btn => {
                btn.classList.add('tutorial-element-interactive')
              })
              
              await waitForCategoryCreation(driverObj)
              // Auto-advance once category is created
              setTimeout(() => driverObj.moveNext(), 500)
            },
            onDeselected: () => {
              // Re-disable interactions
              const allButtons = document.querySelectorAll('.tutorial-add-category button, .tutorial-add-category [role="button"], .tutorial-add-category')
              allButtons.forEach(btn => {
                btn.classList.remove('tutorial-element-interactive')
              })
            }
          },
          {
            element: '.tutorial-category-edit-buttons',
            popover: {
              title: 'Modifier la catégorie',
              description: 'Parfait ! Ces boutons permettent de modifier, dupliquer ou supprimer la catégorie.',
              showButtons: ['close', 'next'],
              nextBtnText: 'Suivant'
            }
          },
          {
            element: '.tutorial-add-item',
            popover: {
              title: 'Ajouter un plat',
              description: 'Ensuite cliquez sur ce bouton pour ajouter votre premier élément à cette catégorie.',
              showButtons: ['close'],
            },
            onHighlighted: async () => {
              // Enable interaction for the add item button and its children
              const itemButton = document.querySelector('.tutorial-add-item button')
              const itemButtonAlt = document.querySelector('.tutorial-add-item')
              const allButtons = document.querySelectorAll('.tutorial-add-item button, .tutorial-add-item [role="button"], .tutorial-add-item')
              
              allButtons.forEach(btn => {
                btn.classList.add('tutorial-element-interactive')
              })
              
              if (itemButton) {
                itemButton.classList.add('tutorial-element-interactive')
              }
              if (itemButtonAlt) {
                itemButtonAlt.classList.add('tutorial-element-interactive')
              }
              
              await waitForItemCreation(driverObj)
              // Auto-advance once item is created
              setTimeout(() => driverObj.moveNext(), 500)
            },
            onDeselected: () => {
              // Re-disable interactions
              const allButtons = document.querySelectorAll('.tutorial-add-item button, .tutorial-add-item [role="button"], .tutorial-add-item')
              allButtons.forEach(btn => {
                btn.classList.remove('tutorial-element-interactive')
              })
            }
          },
          {
            element: '.tutorial-edit-item',
            popover: {
              title: 'Modifier l\'élément',
              description: 'Excellent ! Pour modifier un élément, il suffit de cliquer dessus. Allez-y, cliquez sur le plat que vous venez de créer.',
              showButtons: ['close'],
            },
            onHighlighted: async () => {
              // Enable interaction only on the main card area, not on action buttons
              const tutorialEditItem = document.querySelector('.tutorial-edit-item')
              if (tutorialEditItem) {
                tutorialEditItem.classList.add('tutorial-element-interactive')
                
                // Specifically disable the duplicate button by adding the tutorial-button-disabled class
                // Use multiple selectors to cover all possible button variants
                const duplicateButton = tutorialEditItem.querySelector('button[title="Dupliquer l\'article"], [title="Dupliquer l\'article"]')
                if (duplicateButton) {
                  duplicateButton.classList.add('tutorial-button-disabled')
                }
                
                // Also disable any buttons containing CopyPlus icon as additional safety
                const copyPlusButtons = tutorialEditItem.querySelectorAll('button')
                copyPlusButtons.forEach(button => {
                  const copyPlusIcon = button.querySelector('[class*="lucide-copy-plus"], .lucide-copy-plus')
                  if (copyPlusIcon) {
                    button.classList.add('tutorial-button-disabled')
                  }
                })
              }
              
              // Wait for the dialog to open and auto-advance immediately
              try {
                await waitForItemDialogOpen()
                // Move to next step as soon as dialog is detected (no delay)
                if (driverObj && typeof driverObj.moveNext === 'function') {
                  driverObj.moveNext()
                }
              } catch (error) {
                console.error('Error waiting for item dialog:', error)
              }
            },
            onDeselected: () => {
              // Re-enable interactions and restore button styles
              const tutorialEditItem = document.querySelector('.tutorial-edit-item')
              if (tutorialEditItem) {
                tutorialEditItem.classList.remove('tutorial-element-interactive')
              }
            }
          },
          {
            element: '.tutorial-item-dialog',
            popover: {
              title: 'Modifier l\'élément',
              description: 'Parfait ! Ce formulaire vous permet de modifier tous les détails de votre plat : nom, description, prix, disponibilité et badges alimentaires. Fermez cette fenêtre pour continuer.',
              showButtons: ['close', 'next'],
              nextBtnText: 'Suivant'
            },
            onHighlighted: async () => {
              // Wait for the dialog to close and auto-advance to final step
              try {
                await waitForItemDialogClose()
                // Jump directly to the final congratulations step
                if (driverObj && typeof driverObj.moveNext === 'function') {
                  // Skip the close button step and go directly to congratulations
                  driverObj.moveNext() // Go to close button step
                  setTimeout(() => driverObj.moveNext(), 100) // Then immediately to final step
                }
              } catch (error) {
                console.error('Error waiting for dialog close:', error)
              }
            }
          },
          {
            element: '[data-testid="dialog-close"]',
            popover: {
              title: 'Fermer l\'élément',
              description: 'Pour finir, cliquez sur \'Annuler\' pour fermer la fenêtre et terminer la présentation.',
              showButtons: ['close']
            },
            onHighlighted: async () => {
              // Enable interaction only for the close button
              const closeButton = document.querySelector('[data-testid="dialog-close"]')
              if (closeButton) {
                closeButton.classList.add('tutorial-element-interactive')
              }
              await waitForItemDialogClose()
              // Auto-advance once dialog is closed
              setTimeout(() => driverObj.moveNext(), 500)
            },
            onDeselected: () => {
              // Re-disable interactions
              const closeButton = document.querySelector('[data-testid="dialog-close"]')
              if (closeButton) {
                closeButton.classList.remove('tutorial-element-interactive')
              }
            }
          },
          {
            popover: {
              title: 'Félicitations !',
              description: 'Vous maîtrisez maintenant les bases de Simple Menu ! Vous pouvez continuer à créer d\'autres catégories et plats. N\'hésitez pas à explorer toutes les fonctionnalités.',
              showButtons: ['close', 'next'],
              nextBtnText: 'Commencer'
            },
            onDeselected: () => {
              // Launch confetti after a short delay
              setTimeout(() => {
                celebrateCompletion()
                
                // Mark tutorial as completed in memory only
                setTutorialCompleted(true)
              }, 300)
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
