import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe-server'
import { getServerSupabase } from '@/lib/supabase'
import { auditLog, getRequestMetadata, STANDARD_ERRORS } from '@/lib/security'
import { handlePromotionEnd, checkPromotionExpiry } from '@/lib/promotion-manager'
import { sendWelcomeEmail } from '@/lib/email-gmail'

export async function POST(req: NextRequest) {
  const metadata = getRequestMetadata(req)
  
  try {
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      auditLog({
        action: 'webhook_failed',
        ...metadata,
        statusCode: 400,
        details: { reason: 'missing_signature' },
        severity: 'warning'
      })
      return NextResponse.json({ error: STANDARD_ERRORS.BAD_REQUEST }, { status: 400 })
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      auditLog({
        action: 'webhook_failed',
        ...metadata,
        statusCode: 500,
        details: { reason: 'webhook_secret_not_configured' },
        severity: 'critical'
      })
      return NextResponse.json({ error: STANDARD_ERRORS.SERVER_ERROR }, { status: 500 })
    }

    let event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      auditLog({
        action: 'webhook_signature_verification_failed',
        ...metadata,
        statusCode: 400,
        details: { 
          error: err instanceof Error ? err.message : 'unknown_error',
          hasSignature: !!signature
        },
        severity: 'warning'
      })
      return NextResponse.json({ error: STANDARD_ERRORS.UNAUTHORIZED }, { status: 400 })
    }

    const supabase = await getServerSupabase()

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        
        // Extract establishment data from metadata
        const {
          establishmentName,
          establishmentSlug,
          email,
          phone,
          plan,
          initialPassword
        } = session.metadata || {}
        
        if (!establishmentName || !establishmentSlug || !email || !plan || !initialPassword) {
          auditLog({
            action: 'webhook_missing_metadata',
            ...metadata,
            statusCode: 400,
            details: { 
              sessionId: session.id,
              availableMetadata: Object.keys(session.metadata || {}),
              missingFields: {
                name: !establishmentName,
                slug: !establishmentSlug,
                email: !email,
                plan: !plan,
                password: !initialPassword
              }
            },
            severity: 'warning'
          })
          break
        }
        
        // Hash the initial password
        const bcrypt = require('bcryptjs')
        const hashedPassword = await bcrypt.hash(initialPassword, 12)
        
        // Calculate trial end date (14 days from now)
        const trialEndsAt = new Date()
        trialEndsAt.setDate(trialEndsAt.getDate() + 14)
        const subscriptionStarted = new Date()
        
        // NOW create the establishment after successful payment
        const { data: establishment, error: createError } = await supabase
          .from('establishments')
          .insert({
            name: establishmentName,
            slug: establishmentSlug,
            email: email,
            phone: phone || null,
            admin_hash: hashedPassword,
            plan: plan,
            primary_color: null,
            // Subscription information
            is_active: true, // Active from the start since payment is confirmed
            plan_status: 'trial', // Start trial period
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            subscription_started_at: subscriptionStarted.toISOString(),
            trial_ends_at: trialEndsAt.toISOString(),
            created_at: new Date().toISOString()
          } as any)
          .select()
          .single()

        if (createError) {
          auditLog({
            action: 'establishment_creation_failed',
            ...metadata,
            statusCode: 500,
            details: {
              error: createError.message,
              plan,
              sessionId: session.id,
              establishmentSlug,
              dbError: createError.code
            },
            severity: 'error'
          })
        } else {
          // Send the welcome email after establishment creation
          if (establishment && initialPassword && email) {
            try {
              await sendWelcomeEmail({
                to: email,
                establishmentName: establishmentName,
                slug: establishmentSlug,
                initialPassword: initialPassword,
                adminUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/e/${establishmentSlug}/admin`
              })
              
              auditLog({
                action: 'welcome_email_sent',
                ...metadata,
                statusCode: 200,
                details: {
                  establishmentId: establishment.id,
                  establishmentSlug,
                  email
                },
                severity: 'info'
              })
            } catch (emailError) {
              auditLog({
                action: 'welcome_email_failed',
                ...metadata,
                statusCode: 500,
                details: {
                  error: emailError instanceof Error ? emailError.message : 'unknown_error',
                  establishmentId: establishment.id,
                  establishmentSlug,
                  email
                },
                severity: 'warning'
              })
            }
          }
          
          // Log successful establishment creation
          auditLog({
            action: 'establishment_created_after_payment',
            ...metadata,
            statusCode: 200,
            details: {
              establishmentName,
              establishmentSlug,
              plan,
              isPromotion: session.metadata?.isPromotion,
              customerId: session.customer,
              subscriptionId: session.subscription,
              establishmentId: establishment?.id
            },
            severity: 'info'
          })
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any
        const subscriptionId = invoice.subscription
        
        auditLog({
          action: 'invoice_payment_succeeded',
          ...metadata,
          statusCode: 200,
          details: { 
            subscriptionId,
            invoiceId: invoice.id,
            amount: invoice.amount_paid
          },
          severity: 'info'
        })
        
        // Check if promotion should expire (after 3 months)
        if (subscriptionId) {
          const shouldExpire = await checkPromotionExpiry(subscriptionId)
          if (shouldExpire) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId)
            const plan = subscription.metadata?.plan
            
            if (plan) {
              await handlePromotionEnd(subscriptionId, plan)
              auditLog({
                action: 'promotion_expired_automatically',
                ...metadata,
                statusCode: 200,
                details: { 
                  subscriptionId, 
                  plan,
                  establishmentSlug: subscription.metadata?.establishmentSlug
                },
                severity: 'info'
              })
            }
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any
        
        // Update establishment with new subscription info
        if (subscription.metadata?.establishmentId) {
          const { error } = await supabase
            .from('establishments')
            .update({
              plan_status: subscription.status,
              stripe_subscription_id: subscription.id
            } as any)
            .eq('id', subscription.metadata.establishmentId)
            
          if (error) {
            auditLog({
              action: 'subscription_update_failed',
              ...metadata,
              statusCode: 500,
              details: { 
                error: error.message,
                subscriptionId: subscription.id,
                establishmentId: subscription.metadata.establishmentId,
                establishmentSlug: subscription.metadata?.establishmentSlug,
                dbError: error.code
              },
              severity: 'error'
            })
          } else {
            auditLog({
              action: 'subscription_updated',
              ...metadata,
              statusCode: 200,
              details: { 
                subscriptionId: subscription.id,
                establishmentId: subscription.metadata.establishmentId,
                establishmentSlug: subscription.metadata?.establishmentSlug,
                newStatus: subscription.status
              },
              severity: 'info'
            })
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        
        // Deactivate establishment
        if (subscription.metadata?.establishmentId) {
          const { error } = await supabase
            .from('establishments')
            .update({
              is_active: false,
              plan_status: 'canceled',
              subscription_ended_at: new Date().toISOString()
            } as any)
            .eq('id', subscription.metadata.establishmentId)
            
          if (error) {
            auditLog({
              action: 'subscription_cancellation_failed',
              ...metadata,
              statusCode: 500,
              details: { 
                error: error.message,
                subscriptionId: subscription.id,
                establishmentId: subscription.metadata.establishmentId,
                establishmentSlug: subscription.metadata?.establishmentSlug,
                dbError: error.code
              },
              severity: 'error'
            })
          } else {
            auditLog({
              action: 'subscription_canceled',
              ...metadata,
              statusCode: 200,
              details: { 
                subscriptionId: subscription.id,
                establishmentId: subscription.metadata.establishmentId,
                establishmentSlug: subscription.metadata?.establishmentSlug
              },
              severity: 'warning'
            })
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any
        
        auditLog({
          action: 'payment_failed',
          ...metadata,
          statusCode: 200,
          details: { 
            subscriptionId: invoice.subscription,
            invoiceId: invoice.id,
            attemptCount: invoice.attempt_count,
            amount: invoice.amount_due
          },
          severity: 'warning'
        })
        break
      }

      default:
        // Log unhandled events for monitoring
        auditLog({
          action: 'unhandled_webhook_event',
          ...metadata,
          statusCode: 200,
          details: { 
            eventType: event.type
          },
          severity: 'info'
        })
    }

    auditLog({
      action: 'webhook_processed_successfully',
      ...metadata,
      statusCode: 200,
      details: { 
        eventType: event.type
      },
      severity: 'info'
    })

    return NextResponse.json({ received: true })

  } catch (error) {
    auditLog({
      action: 'webhook_processing_error',
      ...metadata,
      statusCode: 500,
      details: { 
        error: error instanceof Error ? error.message : 'unknown_error',
        stack: error instanceof Error ? error.stack : undefined,
        eventType: event?.type || 'unknown'
      },
      severity: 'error'
    })
    return NextResponse.json({ error: STANDARD_ERRORS.SERVER_ERROR }, { status: 500 })
  }
}
