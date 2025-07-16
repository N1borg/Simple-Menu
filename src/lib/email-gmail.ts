/**
 * Email Service Integration for Simple Menu (Gmail SMTP Version)
 * Handles automated email delivery for new client onboarding using Gmail SMTP
 */

import nodemailer from 'nodemailer'

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
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '123456789'
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
 * Create Gmail SMTP transporter
 */
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD, // Gmail App Password
    },
    tls: {
      rejectUnauthorized: false
    }
  })
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
    .footer {
      background: #f8fafc;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
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
        <p>Ce mot de passe est temporaire et doit être changé lors de votre première connexion.</p>
      </div>

      <div class="action-buttons">
        <a href="${credentials.setupUrl}" class="btn btn-primary">🚀 Commencer la configuration</a>
        <a href="${credentials.adminUrl}" class="btn btn-secondary">📱 Tableau de bord</a>
      </div>

      <div class="steps-section">
        <h3 style="margin-bottom: 20px;">📋 Prochaines étapes</h3>
        
        <div class="step">
          <div class="step-number">1</div>
          <div>
            <h4>Première connexion</h4>
            <p>Utilisez vos identifiants et définissez votre nouveau mot de passe</p>
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">2</div>
          <div>
            <h4>Personnalisation</h4>
            <p>Ajoutez votre logo et choisissez vos couleurs</p>
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">3</div>
          <div>
            <h4>Création du menu</h4>
            <p>Ajoutez vos catégories et plats</p>
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">4</div>
          <div>
            <h4>Partage</h4>
            <p>Générez votre QR code pour vos clients</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>Simple Menu</strong> - La solution complète pour votre menu numérique</p>
      <p>Besoin d'aide ? Contactez-nous à contact.simplemenu@gmail.com</p>
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
 * Send setup credentials email to new establishment using Gmail SMTP
 */
export async function sendSetupEmail(credentials: EstablishmentCredentials): Promise<boolean> {
  try {
    // Check required environment variables
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.error('SMTP configuration missing: SMTP_USER or SMTP_PASSWORD not configured')
      return false
    }

    const transporter = createTransporter()
    
    // Verify transporter configuration
    await transporter.verify()
    console.log('SMTP connection verified successfully')

    const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER
    const toEmail = credentials.contactEmail || 'client@example.com'

    const mailOptions = {
      from: `"Simple Menu" <${fromEmail}>`,
      to: toEmail,
      subject: `🎉 Bienvenue ${credentials.establishmentName} - Vos accès Simple Menu`,
      html: getSetupEmailTemplate(credentials),
      text: getSetupEmailText(credentials),
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    }

    const result = await transporter.sendMail(mailOptions)
    
    console.log('Setup email sent successfully:', result.messageId)
    return true
    
  } catch (error) {
    console.error('Error sending setup email:', error)
    
    // Log specific error details for debugging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      })
    }
    
    return false
  }
}

/**
 * Send welcome email for new signups with login credentials
 */
export async function sendWelcomeEmail({
  to,
  establishmentName,
  slug,
  initialPassword,
  adminUrl
}: {
  to: string
  establishmentName: string
  slug: string
  initialPassword: string
  adminUrl: string
}): Promise<boolean> {
  try {
    const transporter = createTransporter()
    
    const htmlContent = `
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
    .btn {
      display: inline-block;
      padding: 14px 28px;
      margin: 10px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      background: #3b82f6;
      color: white;
      text-align: center;
    }
    .footer {
      background: #f8fafc;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Bienvenue chez Simple Menu !</h1>
      <p>Votre menu digital est prêt à être configuré</p>
    </div>
    
    <div class="content">
      <div class="welcome-box">
        <h2>Félicitations ${establishmentName} !</h2>
        <p>Votre menu digital Simple Menu a été créé avec succès. Vous disposez maintenant d'un mois gratuit pour découvrir tous nos services.</p>
      </div>

      <div class="credentials-box">
        <h3>🔐 Vos informations de connexion</h3>
        <p style="margin-bottom: 15px;">Utilisez ces identifiants pour accéder à votre interface d'administration :</p>
        
        <div class="credential-item">
          <span class="credential-label">URL d'administration :</span>
          <div class="credential-value">${adminUrl}</div>
        </div>
        
        <div class="credential-item">
          <span class="credential-label">Mot de passe temporaire :</span>
          <div class="credential-value">${initialPassword}</div>
        </div>
        
        <p style="margin-top: 15px; color: #dc2626; font-weight: 600;">
          ⚠️ Important : Changez ce mot de passe lors de votre première connexion
        </p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${adminUrl}" class="btn">
          🚀 Accéder à mon menu
        </a>
      </div>

      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <h3 style="color: #16a34a; margin-bottom: 10px;">✨ Prochaines étapes :</h3>
        <ol style="color: #15803d; margin-left: 20px;">
          <li>Connectez-vous avec vos identifiants ci-dessus</li>
          <li>Changez votre mot de passe temporaire</li>
          <li>Ajoutez votre logo et choisissez vos couleurs</li>
          <li>Créez vos catégories et ajoutez vos produits</li>
          <li>Partagez votre QR code avec vos clients</li>
        </ol>
      </div>

      <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <h3 style="color: #1d4ed8; margin-bottom: 10px;">📱 Votre menu public :</h3>
        <p style="color: #1e40af;">
          Vos clients pourront accéder à votre menu via : 
          <strong>simple-menu.niborgpro.fr/e/${slug}</strong>
        </p>
      </div>
    </div>

    <div class="footer">
      <p>Besoin d'aide ? Contactez-nous à <a href="mailto:contact.simplemenu@gmail.com">contact.simplemenu@gmail.com</a></p>
      <p style="margin-top: 10px; font-size: 14px; color: #64748b;">
        Simple Menu - Menu digital pour restaurants et cafés
      </p>
    </div>
  </div>
</body>
</html>`

    const textContent = `
Bienvenue chez Simple Menu !

Félicitations ${establishmentName} ! Votre menu digital a été créé avec succès.

Vos informations de connexion :
- URL d'administration : ${adminUrl}
- Mot de passe initial : ${initialPassword}

⚠️ Important : Changez ce mot de passe lors de votre première connexion

Votre menu public sera accessible à : simple-menu.niborgpro.fr/e/${slug}

Prochaines étapes :
1. Connectez-vous avec vos identifiants
2. Changez votre mot de passe temporaire
3. Ajoutez votre logo et choisissez vos couleurs
4. Créez vos catégories et ajoutez vos produits
5. Partagez votre QR code avec vos clients

Besoin d'aide ? Contactez-nous à contact.simplemenu@gmail.com

Simple Menu - Menu digital pour restaurants et cafés
    `

    const info = await transporter.sendMail({
      from: `"Simple Menu" <${process.env.FROM_EMAIL}>`,
      to: to,
      subject: `🎉 Bienvenue ${establishmentName} - Votre menu digital est prêt !`,
      text: textContent,
      html: htmlContent,
    })

    console.log('Welcome email sent successfully:', info.messageId)
    return true

  } catch (error) {
    console.error('Error sending welcome email:', error)
    return false
  }
}
