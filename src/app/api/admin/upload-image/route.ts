import { NextRequest, NextResponse } from "next/server"
import cloudinary from "cloudinary"
import sharp from "sharp"
import { auditLog, getRequestMetadata, STANDARD_ERRORS } from '@/lib/security'
import { isDemoSlug } from '@/lib/validate'
import { requireSecureAdminAuth } from '@/lib/auth'

cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error('JWT_SECRET not defined')

export async function POST(req: NextRequest) {
  const requestMetadata = getRequestMetadata(req)
  let slug = 'unknown'

  try {
    const auth = await requireSecureAdminAuth(req)
    if ('slug' in auth === false) return auth as NextResponse
    slug = (auth as { slug: string }).slug

    // Parse and validate request
    const contentType = req.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      auditLog({
        action: 'upload_image_failed',
        severity: 'warning',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Invalid content type' }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.INVALID_INPUT }, { status: 400 })
    }

    const body = await req.json()
    const { file, folder = "logos" } = body

    // Protection avancée mode démo
    if (isDemoSlug(slug)) {
      auditLog({
        action: 'upload_image_blocked',
        severity: 'warning',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Demo mode restriction' }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.FORBIDDEN }, { status: 403 })
    }

    // Validate file presence
    if (!file) {
      auditLog({
        action: 'upload_image_failed',
        severity: 'warning',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'No file provided' }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.INVALID_INPUT }, { status: 400 })
    }

    // Validate and extract image data
    const matches = /^data:(image\/(png|jpeg|jpg|webp|gif));base64,/.exec(file)
    if (!matches) {
      auditLog({
        action: 'upload_image_failed',
        severity: 'warning',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Invalid image format' }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.INVALID_INPUT }, { status: 400 })
    }

    const base64Data = file.replace(/^data:image\/[^;]+;base64,/, "")
    
    try {
      const buffer = Buffer.from(base64Data, 'base64')

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
              return reject(error || new Error("Upload failed"))
            }
            resolve(result.secure_url)
          }
        )
        stream.end(optimizedBuffer)
      })

      // Success logging (after upload to cloudinary)
      auditLog({
        action: 'upload_image_success',
        severity: 'info',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { 
          folder,
          cloudinaryUrl
        }
      })

      return NextResponse.json({ 
        url: cloudinaryUrl,
        message: "Image optimisée et uploadée avec succès"
      })

    } catch (imageError: any) {
      auditLog({
        action: 'upload_image_failed',
        severity: 'error',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { 
          reason: 'Image processing failed',
          error: imageError.message
        }
      })

      if (imageError.message?.includes('Input buffer contains unsupported image format')) {
        return NextResponse.json({ error: STANDARD_ERRORS.INVALID_INPUT }, { status: 400 })
      }
      return NextResponse.json({ error: STANDARD_ERRORS.SERVER_ERROR }, { status: 400 })
    }

  } catch (error: any) {
    auditLog({
      action: 'upload_image_error',
      severity: 'error',
      user: slug,
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    })
    
    return NextResponse.json({ error: STANDARD_ERRORS.SERVER_ERROR }, { status: 500 })
  }
}
