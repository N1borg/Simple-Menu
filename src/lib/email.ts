/**
 * Email Service Integration for Simple Menu
 * Handles automated email delivery for new client onboarding
 */

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EstablishmentCredentials {
  establishmentName: string
  slug: string
  initialPassword: string
  setupUrl: string
  adminUrl: string
  contactEmail?: string
}

/**
 * Generate a secure initial password
 */
export function generateInitialPassword(): string {
  const length = 16
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lowercase = 'abcdefghijkmnpqrstuvwxyz'
  const numbers = '23456789'
  const symbols = '!@#$%&*+-=?'
  const allChars = uppercase + lowercase + numbers + symbols
  
  let password = ''
  
  // Ensure at least one character from each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]
  
  // Fill the rest with random characters
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }
  
  // Shuffle the password to avoid predictable patterns
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

/**
 * Generate a unique slug from establishment name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .slice(0, 50) // Limit length
}

/**
 * HTML Email Template for New Establishment Setup
 */
function getSetupEmailTemplate(credentials: EstablishmentCredentials): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue chez Simple Menu</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      background-color: #f8fafc;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: white; 
      border-radius: 12px; 
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header { 
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); 
      color: white; 
      padding: 40px 30px; 
      text-align: center; 
    }
    .header h1 { 
      font-size: 28px; 
      margin-bottom: 10px; 
      font-weight: 600;
    }
    .header p { 
      font-size: 16px; 
      opacity: 0.9; 
    }
    .content { 
      padding: 40px 30px; 
    }
    .welcome-box {
      background: #f1f5f9;
      border-left: 4px solid #3b82f6;
      padding: 20px;
      margin: 25px 0;
      border-radius: 0 8px 8px 0;
    }
    .credentials-box {
      background: #fef3c7;
      border: 2px solid #fbbf24;
      border-radius: 8px;
      padding: 25px;
      margin: 25px 0;
    }
    .credentials-box h3 {
      color: #92400e;
      margin-bottom: 15px;
      font-size: 18px;
    }
    .credential-item {
      margin: 12px 0;
      padding: 12px;
      background: white;
      border-radius: 6px;
      border: 1px solid #fed7aa;
    }
    .credential-label {
      font-weight: 600;
      color: #92400e;
      display: block;
      margin-bottom: 5px;
    }
    .credential-value {
      font-family: 'Courier New', monospace;
      font-size: 16px;
      color: #1f2937;
      background: #f9fafb;
      padding: 8px;
      border-radius: 4px;
      word-break: break-all;
    }
    .action-buttons {
      text-align: center;
      margin: 30px 0;
    }
    .btn {
      display: inline-block;
      padding: 14px 28px;
      margin: 10px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      transition: all 0.3s ease;
    }
    .btn-primary {
      background: #3b82f6;
      color: white;
    }
    .btn-primary:hover {
      background: #1d4ed8;
    }
    .btn-secondary {
      background: #e5e7eb;
      color: #374151;
    }
    .steps-section {
      background: #f8fafc;
      border-radius: 8px;
      padding: 25px;
      margin: 25px 0;
    }
    .step {
      display: flex;
      align-items: flex-start;
      margin: 15px 0;
    }
    .step-number {
      background: #3b82f6;
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      margin-right: 15px;
      flex-shrink: 0;
    }
    .step-content h4 {
      color: #1f2937;
      margin-bottom: 5px;
    }
    .step-content p {
      color: #6b7280;
      font-size: 14px;
    }
    .footer {
      background: #f8fafc;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      color: #6b7280;
      font-size: 14px;
      margin: 5px 0;
    }
    .security-notice {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
    }
    .security-notice h4 {
      color: #dc2626;
      margin-bottom: 10px;
    }
    .security-notice p {
      color: #7f1d1d;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Bienvenue chez Simple Menu !</h1>
      <p>Votre menu numérique est prêt à être configuré</p>
    </div>
    
    <div class="content">
      <div class="welcome-box">
        <h2>Félicitations ${credentials.establishmentName} !</h2>
        <p>Votre compte Simple Menu a été créé avec succès. Vous pouvez maintenant commencer à créer votre menu numérique professionnel.</p>
      </div>

      <div class="credentials-box">
        <h3>🔐 Vos informations de connexion</h3>
        <div class="credential-item">
          <span class="credential-label">URL de votre menu :</span>
          <div class="credential-value">${credentials.setupUrl.replace('/admin/setup', '')}</div>
        </div>
        <div class="credential-item">
          <span class="credential-label">Identifiant :</span>
          <div class="credential-value">${credentials.slug}</div>
        </div>
        <div class="credential-item">
          <span class="credential-label">Mot de passe temporaire :</span>
          <div class="credential-value">${credentials.initialPassword}</div>
        </div>
      </div>

      <div class="security-notice">
        <h4>⚠️ Important - Sécurité</h4>
        <p>Ce mot de passe est temporaire et doit être changé lors de votre première connexion. Ne partagez jamais vos identifiants avec des tiers.</p>
      </div>

      <div class="action-buttons">
        <a href="${credentials.setupUrl}" class="btn btn-primary">🚀 Commencer la configuration</a>
        <a href="${credentials.adminUrl}" class="btn btn-secondary">📱 Accéder au tableau de bord</a>
      </div>

      <div class="steps-section">
        <h3 style="margin-bottom: 20px; color: #1f2937;">📋 Prochaines étapes</h3>
        
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h4>Première connexion</h4>
            <p>Utilisez vos identifiants pour vous connecter et définir votre nouveau mot de passe</p>
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h4>Personnalisation</h4>
            <p>Ajoutez votre logo, choisissez vos couleurs et configurez vos informations</p>
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h4>Création du menu</h4>
            <p>Ajoutez vos catégories, plats et prix pour créer votre menu complet</p>
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">4</div>
          <div class="step-content">
            <h4>Déploiement</h4>
            <p>Partagez votre QR code ou lien avec vos clients pour qu'ils accèdent à votre menu</p>
          </div>
        </div>
      </div>

      <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 25px 0;">
        <h4 style="color: #0369a1; margin-bottom: 10px;">💡 Besoin d'aide ?</h4>
        <p style="color: #0c4a6e; font-size: 14px;">
          Notre équipe est là pour vous accompagner. Répondez à cet email ou contactez-nous à 
          <a href="mailto:contact.simplemenu@gmail.com" style="color: #0369a1;">contact.simplemenu@gmail.com</a>
        </p>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>Simple Menu</strong> - La solution complète pour votre menu numérique</p>
      <p>Cet email a été envoyé automatiquement. Merci de ne pas répondre directement à cet email.</p>
      <p style="margin-top: 15px; font-size: 12px;">
        Si vous n'avez pas demandé la création de ce compte, veuillez nous contacter immédiatement.
      </p>
    </div>
  </div>
</body>
</html>
  `
}

/**
 * Text version of the setup email (fallback)
 */
function getSetupEmailText(credentials: EstablishmentCredentials): string {
  return `
🎉 BIENVENUE CHEZ SIMPLE MENU !

Félicitations ${credentials.establishmentName} !
Votre compte Simple Menu a été créé avec succès.

🔐 VOS INFORMATIONS DE CONNEXION :
═══════════════════════════════════
URL de votre menu : ${credentials.setupUrl.replace('/admin/setup', '')}
Identifiant : ${credentials.slug}
Mot de passe initial : ${credentials.initialPassword}

⚠️ IMPORTANT - SÉCURITÉ
Ce mot de passe est temporaire et doit être changé lors de votre première connexion.

🚀 COMMENCER LA CONFIGURATION :
${credentials.setupUrl}

📱 ACCÉDER AU TABLEAU DE BORD :
${credentials.adminUrl}

📋 PROCHAINES ÉTAPES :
1. Première connexion - Utilisez vos identifiants et définissez votre nouveau mot de passe
2. Personnalisation - Ajoutez votre logo, couleurs et informations
3. Création du menu - Ajoutez vos catégories, plats et prix
4. Déploiement - Partagez votre QR code ou lien avec vos clients

💡 BESOIN D'AIDE ?
Notre équipe est là pour vous accompagner : contact.simplemenu@gmail.com

Simple Menu - La solution complète pour votre menu numérique
  `
}

/**
 * Send setup credentials email to new establishment
 */
export async function sendSetupEmail(credentials: EstablishmentCredentials): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      return false
    }

    const fromEmail = process.env.FROM_EMAIL || 'contact.simplemenu@gmail.com'
    const toEmail = credentials.contactEmail || 'client@example.com'

    const result = await resend.emails.send({
      from: `Simple Menu <${fromEmail}>`,
      to: [toEmail],
      subject: `🎉 Bienvenue ${credentials.establishmentName} - Vos accès Simple Menu`,
      html: getSetupEmailTemplate(credentials),
      text: getSetupEmailText(credentials),
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      },
      tags: [
        { name: 'category', value: 'onboarding' },
        { name: 'establishment', value: credentials.slug }
      ]
    })

    if (result.error) {
      console.error('Email sending failed:', result.error)
      return false
    }

    console.log('Setup email sent successfully:', result.data?.id)
    return true
  } catch (error) {
    console.error('Error sending setup email:', error)
    return false
  }
}

/**
 * Send welcome email with PDF guide (optional enhancement)
 */
export async function sendWelcomeEmail(
  establishmentName: string, 
  contactEmail: string
): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      return false
    }

    const fromEmail = process.env.FROM_EMAIL || 'contact.simplemenu@gmail.com'

    const result = await resend.emails.send({
      from: `Simple Menu <${fromEmail}>`,
      to: [contactEmail],
      subject: `📖 Guide de démarrage - ${establishmentName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Guide de démarrage Simple Menu</h2>
          <p>Bonjour ${establishmentName},</p>
          <p>Voici votre guide complet pour créer et gérer votre menu numérique.</p>
          <p>Nous sommes ravis de vous accompagner dans cette nouvelle aventure !</p>
          <p>L'équipe Simple Menu</p>
        </div>
      `,
      tags: [
        { name: 'category', value: 'welcome-guide' },
        { name: 'establishment', value: establishmentName.toLowerCase().replace(/\s+/g, '-') }
      ]
    })

    return !result.error
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return false
  }
}
