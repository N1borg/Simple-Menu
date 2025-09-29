// Input validation and sanitization helpers
export function sanitizeString(str: any, maxLength = 255): string {
  if (typeof str !== 'string') return ''
  return str.trim().replace(/[<>]/g, '').slice(0, maxLength)
}

export function sanitizeNumber(num: any, min = 0, max = 1e6): number {
  const n = Number(num)
  if (isNaN(n)) return min
  return Math.max(min, Math.min(max, n))
}

export function isValidUUID(id: any): boolean {
  return typeof id === 'string' && /^[0-9a-fA-F-]{36}$/.test(id)
}

export function isDemoSlug(slug: any): boolean {
  return typeof slug === 'string' && slug.toLowerCase() === 'demo'
}

// ✅ AMÉLIORATION : Validation stricte des slugs
export function validateSlug(slug: any): { isValid: boolean; error?: string } {
  if (typeof slug !== 'string') {
    return { isValid: false, error: 'Le slug doit être une chaîne de caractères' }
  }
  
  // Regex plus stricte : commence et finit par alphanumérique, tirets autorisés au milieu
  const slugRegex = /^[a-z0-9][a-z0-9-]{1,98}[a-z0-9]$/
  
  if (!slugRegex.test(slug)) {
    return { 
      isValid: false, 
      error: 'Le slug doit contenir entre 3 et 100 caractères, commencer et finir par une lettre ou un chiffre, et ne peut contenir que des lettres minuscules, chiffres et tirets' 
    }
  }
  
  // Vérifier la longueur
  if (slug.length < 3 || slug.length > 100) {
    return { 
      isValid: false, 
      error: 'Le slug doit contenir entre 3 et 100 caractères' 
    }
  }
  
  // Vérifier les slugs interdits
  const forbiddenSlugs = [
    'admin', 'api', 'www', 'app', 'demo', 'test', 'signup', 'login', 
    'dashboard', 'settings', 'profile', 'account', 'billing', 'payment',
    'stripe', 'webhook', 'cron', 'health', 'status', 'metrics', 'logs'
  ]
  
  if (forbiddenSlugs.includes(slug.toLowerCase())) {
    return { 
      isValid: false, 
      error: 'Ce nom d\'URL est réservé, veuillez en choisir un autre' 
    }
  }
  
  return { isValid: true }
}

// ✅ NOUVEAU : Validation du contenu des images
export async function validateImageContent(buffer: Buffer): Promise<{ isValid: boolean; error?: string; metadata?: any }> {
  try {
    const sharp = require('sharp')
    const metadata = await sharp(buffer).metadata()
    
    // Vérifier le format
    const allowedFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif']
    if (!allowedFormats.includes(metadata.format)) {
      return { 
        isValid: false, 
        error: `Format non supporté: ${metadata.format}. Formats acceptés: ${allowedFormats.join(', ')}` 
      }
    }
    
    // Vérifier les dimensions
    if (metadata.width > 5000 || metadata.height > 5000) {
      return { 
        isValid: false, 
        error: 'Image trop grande. Dimensions maximales: 5000x5000 pixels' 
      }
    }
    
    if (metadata.width < 10 || metadata.height < 10) {
      return { 
        isValid: false, 
        error: 'Image trop petite. Dimensions minimales: 10x10 pixels' 
      }
    }
    
    // Vérifier la taille du fichier (après base64 decode)
    const fileSizeMB = buffer.length / (1024 * 1024)
    if (fileSizeMB > 10) {
      return { 
        isValid: false, 
        error: 'Fichier trop volumineux. Taille maximale: 10 MB' 
      }
    }
    
    return { isValid: true, metadata }
    
  } catch (error) {
    return { 
      isValid: false, 
      error: 'Impossible de valider le contenu de l\'image' 
    }
  }
}

// ✅ NOUVEAU : Validation du type MIME
export function validateMimeType(mimeType: string): boolean {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ]
  return allowedMimeTypes.includes(mimeType)
}

// ✅ NOUVEAU : Extraction et validation du base64
export function validateBase64Image(base64String: string): { isValid: boolean; buffer?: Buffer; mimeType?: string; error?: string } {
  try {
    // Vérifier le format data URL
    const matches = /^data:(image\/(png|jpeg|jpg|webp|gif));base64,/.exec(base64String)
    if (!matches) {
      return { 
        isValid: false, 
        error: 'Format invalide. Doit être une image base64 valide' 
      }
    }
    
    const mimeType = matches[1]
    if (!validateMimeType(mimeType)) {
      return { 
        isValid: false, 
        error: `Type MIME non supporté: ${mimeType}` 
      }
    }
    
    // Extraire les données base64
    const base64Data = base64String.replace(/^data:image\/[^;]+;base64,/, "")
    
    // Vérifier que c'est du base64 valide
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
      return { 
        isValid: false, 
        error: 'Données base64 invalides' 
      }
    }
    
    const buffer = Buffer.from(base64Data, 'base64')
    
    return { isValid: true, buffer, mimeType }
    
  } catch (error) {
    return { 
      isValid: false, 
      error: 'Erreur lors du traitement de l\'image base64' 
    }
  }
}
