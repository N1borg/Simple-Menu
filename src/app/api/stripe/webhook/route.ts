import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe-server'
import { getServerSupabase } from '@/lib/supabase'
import { auditLog } from '@/lib/security'
import { handlePromotionEnd, checkPromotionExpiry } from '@/lib/promotion-manager'
import { sendWelcomeEmail } from '@/lib/email-gmail'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    await auditLog({
      action: 'webhook_signature_verification_failed',
      user: 'system',
      details: { error: err instanceof Error ? err.message : 'Unknown error' }
    })
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  const supabase = await getServerSupabase()

  try {    
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
          await auditLog({
            action: 'webhook_missing_metadata',
            user: 'system',
            details: { 
              sessionId: session.id,
              availableMetadata: Object.keys(session.metadata || {})
            }
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
          await auditLog({
            action: 'establishment_creation_failed',
            user: establishmentSlug,
            details: {
              error: createError.message,
              plan,
              sessionId: session.id
            }
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
            } catch (emailError) {
              await auditLog({
                action: 'welcome_email_failed',
                user: establishmentSlug,
                details: {
                  error: emailError instanceof Error ? emailError.message : 'Unknown error',
                  establishmentId: establishment.id
                }
              })
            }
          }
        }
        
        // Log de l'inscription réussie
        await auditLog({
          action: 'establishment_created_after_payment',
          user: establishmentSlug,
          details: {
            establishmentName,
            establishmentSlug,
            plan,
            isPromotion: session.metadata?.isPromotion,
            customerId: session.customer,
            subscriptionId: session.subscription,
            establishmentId: establishment?.id
          }
        })
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any
        const subscriptionId = invoice.subscription
        
        // Check if promotion should expire (after 3 months)
        if (subscriptionId) {
          const shouldExpire = await checkPromotionExpiry(subscriptionId)
          if (shouldExpire) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId)
            const plan = subscription.metadata?.plan
            
            if (plan) {
              await handlePromotionEnd(subscriptionId, plan)
              await auditLog({
                action: 'promotion_expired_automatically',
                user: subscription.metadata?.establishmentSlug || 'unknown',
                details: { subscriptionId, plan }
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
            await auditLog({
              action: 'subscription_update_failed',
              user: subscription.metadata?.establishmentSlug || 'unknown',
              details: { 
                error: error.message,
                subscriptionId: subscription.id,
                establishmentId: subscription.metadata.establishmentId
              }
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
            await auditLog({
              action: 'subscription_cancellation_failed',
              user: subscription.metadata?.establishmentSlug || 'unknown',
              details: { 
                error: error.message,
                subscriptionId: subscription.id,
                establishmentId: subscription.metadata.establishmentId
              }
            })
          } else {
            await auditLog({
              action: 'subscription_canceled',
              user: subscription.metadata?.establishmentSlug || 'unknown',
              details: { subscriptionId: subscription.id }
            })
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any
        
        await auditLog({
          action: 'payment_failed',
          user: 'system',
          details: { 
            subscriptionId: invoice.subscription,
            invoiceId: invoice.id,
            attemptCount: invoice.attempt_count
          }
        })
        break
      }

      default:
        // Log unhandled events for monitoring without console output
        await auditLog({
          action: 'unhandled_webhook_event',
          user: 'system',
          details: { eventType: event.type }
        })
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    await auditLog({
      action: 'webhook_processing_error',
      user: 'system',
      details: { 
        error: error instanceof Error ? error.message : 'Unknown error',
        eventType: event?.type
      }
    })
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
