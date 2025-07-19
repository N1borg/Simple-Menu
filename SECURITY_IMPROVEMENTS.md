# 🔒 Améliorations de Sécurité - Simple-Menu

Ce document détaille les améliorations de sécurité implémentées dans le projet Simple-Menu.

## 📋 Résumé des Améliorations

### 1. ✅ Validation Stricte des Slugs
### 2. ✅ Validation Complète des Images
### 3. ✅ Protection CSRF
### 4. ✅ Validation de Contenu des Images

---

## 1. 🔗 Validation Stricte des Slugs

### Problème Identifié
- Validation basique avec regex simple
- Slugs interdits limités
- Pas de validation de longueur stricte

### Solution Implémentée

#### Nouvelle fonction `validateSlug()` dans `src/lib/validate.ts`:
```typescript
export function validateSlug(slug: any): { isValid: boolean; error?: string } {
  // Regex plus stricte : commence et finit par alphanumérique
  const slugRegex = /^[a-z0-9][a-z0-9-]{1,98}[a-z0-9]$/
  
  // Vérifications multiples
  if (!slugRegex.test(slug)) {
    return { 
      isValid: false, 
      error: 'Le slug doit contenir entre 3 et 100 caractères, commencer et finir par une lettre ou un chiffre' 
    }
  }
  
  // Liste étendue des slugs interdits
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
```

#### Routes Mises à Jour:
- `src/app/api/signup/route.ts`
- `src/app/api/admin/establishment/create/route.ts`

---

## 2. 🖼️ Validation Complète des Images

### Problème Identifié
- Validation basée uniquement sur regex côté client
- Pas de vérification du contenu réel des images
- Pas de validation des dimensions

### Solution Implémentée

#### Nouvelles fonctions dans `src/lib/validate.ts`:

```typescript
// Validation du contenu des images
export async function validateImageContent(buffer: Buffer): Promise<{ isValid: boolean; error?: string; metadata?: any }> {
  const metadata = await sharp(buffer).metadata()
  
  // Vérifier le format
  const allowedFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif']
  if (!allowedFormats.includes(metadata.format)) {
    return { 
      isValid: false, 
      error: `Format non supporté: ${metadata.format}` 
    }
  }
  
  // Vérifier les dimensions
  if (metadata.width > 5000 || metadata.height > 5000) {
    return { 
      isValid: false, 
      error: 'Image trop grande. Dimensions maximales: 5000x5000 pixels' 
    }
  }
  
  // Vérifier la taille du fichier
  const fileSizeMB = buffer.length / (1024 * 1024)
  if (fileSizeMB > 10) {
    return { 
      isValid: false, 
      error: 'Fichier trop volumineux. Taille maximale: 10 MB' 
    }
  }
  
  return { isValid: true, metadata }
}

// Validation du base64
export function validateBase64Image(base64String: string): { isValid: boolean; buffer?: Buffer; mimeType?: string; error?: string } {
  // Vérifier le format data URL
  const matches = /^data:(image\/(png|jpeg|jpg|webp|gif));base64,/.exec(base64String)
  if (!matches) {
    return { 
      isValid: false, 
      error: 'Format invalide. Doit être une image base64 valide' 
    }
  }
  
  // Vérifier que c'est du base64 valide
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
    return { 
      isValid: false, 
      error: 'Données base64 invalides' 
    }
  }
  
  return { isValid: true, buffer, mimeType }
}
```

#### Route Mise à Jour:
- `src/app/api/admin/upload-image/route.ts`

---

## 3. 🛡️ Protection CSRF

### Problème Identifié
- Pas de protection contre les attaques CSRF
- Tokens de session non sécurisés

### Solution Implémentée

#### Nouveau système CSRF dans `src/lib/csrf.ts`:

```typescript
export class CSRFProtection {
  private static readonly TOKEN_LENGTH = 32
  private static readonly TOKEN_EXPIRY = 24 * 60 * 60 * 1000 // 24 heures

  // Générer un token CSRF sécurisé
  static generateToken(): string {
    const randomToken = randomBytes(this.TOKEN_LENGTH).toString('hex')
    const timestamp = Date.now().toString()
    const data = `${randomToken}.${timestamp}`
    
    const signature = createHmac('sha256', CSRF_SECRET)
      .update(data)
      .digest('hex')
    
    return `${data}.${signature}`
  }

  // Valider un token CSRF
  static validateToken(token: string): { isValid: boolean; error?: string } {
    // Vérification de la signature HMAC
    // Vérification de l'expiration
    // Validation du format
  }
}
```

#### Middleware CSRF:
```typescript
export function requireCSRF(req: NextRequest): NextResponse | null {
  const csrfCheck = CSRFProtection.verifyToken(req)
  
  if (!csrfCheck.isValid) {
    return NextResponse.json({ 
      error: 'Protection CSRF échouée', 
      details: csrfCheck.error 
    }, { status: 403 })
  }
  
  return null // Continue la requête
}
```

#### Hook React pour CSRF dans `src/hooks/useCSRF.ts`:
```typescript
export function useCSRF() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  
  // Fonction pour faire des requêtes avec le token CSRF
  const fetchWithCSRF = async (url: string, options: RequestInit = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      ...options.headers
    }
    
    return fetch(url, { ...options, headers, credentials: 'include' })
  }
  
  return { csrfToken, fetchWithCSRF }
}
```

#### Routes Protégées:
- `src/app/api/signup/route.ts`
- `src/app/api/admin/upload-image/route.ts`
- `src/app/api/admin/establishment/create/route.ts`

#### Route API pour Tokens:
- `src/app/api/csrf-token/route.ts`

---

## 4. 🔍 Validation de Contenu des Images

### Problème Identifié
- Pas de vérification du contenu réel des images
- Possibilité d'upload de fichiers malveillants

### Solution Implémentée

#### Composant `ImageUpload` amélioré dans `src/components/ImageUpload.tsx`:

```typescript
// Validation côté client des images
const validateFile = (file: File): { isValid: boolean; error?: string } => {
  // Vérifier le type MIME
  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: `Type de fichier non supporté` 
    }
  }

  // Vérifier la taille
  const fileSizeMB = file.size / (1024 * 1024)
  if (fileSizeMB > maxSize) {
    return { 
      isValid: false, 
      error: `Fichier trop volumineux. Taille maximale: ${maxSize} MB` 
    }
  }

  return { isValid: true }
}

// Conversion en base64 avec validation
const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = () => {
      const result = reader.result as string
      
      // Vérifier que c'est bien une image
      const img = new Image()
      img.onload = () => {
        // Vérifier les dimensions
        if (img.width > 5000 || img.height > 5000) {
          reject(new Error('Image trop grande. Dimensions maximales: 5000x5000 pixels'))
          return
        }
        
        if (img.width < 10 || img.height < 10) {
          reject(new Error('Image trop petite. Dimensions minimales: 10x10 pixels'))
          return
        }
        
        resolve(result)
      }
      
      img.onerror = () => {
        reject(new Error('Fichier corrompu ou non valide'))
      }
      
      img.src = result
    }
    
    reader.readAsDataURL(file)
  })
}
```

---

## 5. 🔧 Intégration dans le Layout

### Token CSRF dans les Meta Tags:

```typescript
// src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Générer un token CSRF pour la page
  const csrfToken = CSRFProtection.generateToken()

  return (
    <html lang="fr">
      <head>
        {/* Token CSRF dans les meta tags */}
        <meta name="csrf-token" content={csrfToken} />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
```

---

## 6. 📊 Impact sur la Sécurité

### Avant les Améliorations:
- ❌ Validation des slugs basique
- ❌ Pas de protection CSRF
- ❌ Validation des images limitée
- ❌ Pas de vérification du contenu des images

### Après les Améliorations:
- ✅ Validation stricte des slugs avec regex avancée
- ✅ Protection CSRF complète avec tokens HMAC
- ✅ Validation complète des images (format, taille, dimensions)
- ✅ Vérification du contenu des images côté client et serveur
- ✅ Middleware de sécurité sur toutes les routes sensibles
- ✅ Hook React pour intégration transparente côté client

---

## 7. 🚀 Utilisation

### Pour les Développeurs:

1. **Validation des Slugs:**
```typescript
import { validateSlug } from '@/lib/validate'

const validation = validateSlug('mon-restaurant')
if (!validation.isValid) {
  console.error(validation.error)
}
```

2. **Protection CSRF:**
```typescript
import { useCSRF } from '@/hooks/useCSRF'

function MonComposant() {
  const { fetchWithCSRF } = useCSRF()
  
  const handleSubmit = async (data) => {
    const response = await fetchWithCSRF('/api/mon-endpoint', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}
```

3. **Upload d'Images Sécurisé:**
```typescript
import { ImageUpload } from '@/components/ImageUpload'

<ImageUpload
  onUploadSuccess={(url) => console.log('Image uploadée:', url)}
  onUploadError={(error) => console.error('Erreur:', error)}
  maxSize={10}
  allowedTypes={['image/jpeg', 'image/png']}
/>
```

---

## 8. 🔒 Variables d'Environnement Requises

```env
# CSRF Protection
CSRF_SECRET=votre_clé_secrète_très_longue_et_complexe

# JWT (utilisé comme fallback pour CSRF)
JWT_SECRET=votre_clé_jwt_secrète

# Autres variables existantes...
```

---

## 9. 📝 Tests Recommandés

1. **Test de Validation des Slugs:**
   - Essayer des slugs invalides
   - Tester les slugs interdits
   - Vérifier les limites de longueur

2. **Test de Protection CSRF:**
   - Essayer des requêtes sans token CSRF
   - Tester avec des tokens expirés
   - Vérifier la régénération automatique

3. **Test de Validation des Images:**
   - Uploader des fichiers non-images
   - Tester les limites de taille
   - Vérifier les dimensions maximales

---

## 10. 🔄 Maintenance

### Surveillance Continue:
- Logs d'audit pour les tentatives d'attaque
- Monitoring des erreurs CSRF
- Vérification des uploads d'images

### Mises à Jour:
- Maintenir les dépendances à jour
- Surveiller les nouvelles vulnérabilités
- Adapter les validations selon les besoins

---

**Note:** Ces améliorations renforcent significativement la sécurité de l'application tout en maintenant une expérience utilisateur fluide. Toutes les modifications sont rétrocompatibles et n'affectent pas les fonctionnalités existantes. 