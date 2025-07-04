import { NextRequest, NextResponse } from "next/server"
import cloudinary from "cloudinary"
import sharp from "sharp"
import { jwtVerify } from 'jose'
import { auditLog } from '@/lib/security'
import { sanitizeString, isDemoSlug } from '@/lib/validate'
import { requireAdminAuth } from '@/lib/auth'

cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error('JWT_SECRET not defined')

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(req)
  if ('slug' in auth === false) return auth as NextResponse
  const slug = (auth as { slug: string }).slug

  try {
    // Parse and validate request
    const contentType = req.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      return NextResponse.json({ error: "Content-Type doit être application/json" }, { status: 400 })
    }

    const body = await req.json()
    const { file, folder = "logos" } = body

    // Protection avancée mode démo
    if (isDemoSlug(slug)) {
      return NextResponse.json({ error: 'Modification désactivée (mode démo).' }, { status: 403 })
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'

    // Validate file presence
    if (!file) {
      auditLog({ action: 'upload_image_failed', ip, details: { error: 'Aucun fichier fourni' } })
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 })
    }

    // Validate and extract image data
    const matches = /^data:(image\/(png|jpeg|jpg|webp|gif));base64,/.exec(file)
    if (!matches) {
      auditLog({ action: 'upload_image_failed', ip, details: { error: 'Format invalide', file } })
      return NextResponse.json({ 
        error: "Format invalide. Formats acceptés: PNG, JPEG, WebP, GIF" 
      }, { status: 400 })
    }

    const base64Data = file.replace(/^data:image\/[^;]+;base64,/, "")
    
    try {
      const buffer = Buffer.from(base64Data, 'base64')
      
      // No file size limit - we'll optimize any image
      console.log(`Processing image: ${(buffer.length / 1024 / 1024).toFixed(2)}MB`)

      // 6. Process and optimize image server-side
      // First, get image metadata to handle orientation
      const metadata = await sharp(buffer).metadata()
      
      let processedImage = sharp(buffer)
        .rotate() // Auto-rotate based on EXIF orientation
        .resize(400, 400, { 
          fit: 'inside',
          withoutEnlargement: false, // Allow enlargement of small images
          background: { r: 255, g: 255, b: 255, alpha: 1 } // White background for transparent images
        })

      // Always convert to JPEG for consistency and smaller file size
      const optimizedBuffer = await processedImage
        .jpeg({ 
          quality: 85,
          progressive: true,
          mozjpeg: true // Use mozjpeg encoder if available
        })
        .toBuffer()

      console.log(`Optimized image: ${(optimizedBuffer.length / 1024).toFixed(0)}KB`)

      // 7. Upload to Cloudinary with establishment-specific folder
      const cloudinaryUrl = await new Promise<string>((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream(
          {
            folder: `${folder}/${slug}`,
            overwrite: false,
            unique_filename: true,
            resource_type: "image",
            format: "jpg", // Force JPEG
            quality: "auto:good",
            fetch_format: "auto", // Let Cloudinary serve WebP to supporting browsers
            transformation: [
              { width: 400, height: 400, crop: "limit" },
              { quality: "auto:good" },
              { format: "auto" } // Auto-format based on browser support
            ]
          },
          (error, result) => {
            if (error || !result) {
              console.error('Cloudinary error:', error)
              return reject(error || new Error("Échec de l'upload Cloudinary"))
            }
            resolve(result.secure_url)
          }
        )
        stream.end(optimizedBuffer)
      })

      // Success logging (after upload to cloudinary)
      auditLog({ action: 'upload_image_success', ip, details: { slug, folder, cloudinaryUrl } })

      return NextResponse.json({ 
        url: cloudinaryUrl,
        message: "Image optimisée et uploadée avec succès"
      })

    } catch (imageError: any) {
      console.error("Image processing error:", imageError)
      auditLog({ action: 'upload_image_failed', ip, details: { error: imageError.message } })
      if (imageError.message?.includes('Input buffer contains unsupported image format')) {
        return NextResponse.json({ 
          error: "Format d'image non supporté ou fichier corrompu" 
        }, { status: 400 })
      }
      return NextResponse.json({ 
        error: "Impossible de traiter l'image. Vérifiez que c'est un fichier valide." 
      }, { status: 400 })
    }
  } catch (error: any) {
    console.error("Upload error:", error)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
    auditLog({ action: 'upload_image_failed', ip, details: { error: error.message } })
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 })
  }
}
