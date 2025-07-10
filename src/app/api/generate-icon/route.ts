import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const logoUrl = searchParams.get('logo')
  const size = parseInt(searchParams.get('size') || '192')

  if (!logoUrl) {
    return new Response('Logo URL required', { status: 400 })
  }

  try {
    // Fetch the original logo
    const logoResponse = await fetch(logoUrl)
    if (!logoResponse.ok) {
      throw new Error('Failed to fetch logo')
    }

    const logoBuffer = await logoResponse.arrayBuffer()
    
    // Create circular icon using Canvas API
    const canvas = new OffscreenCanvas(size, size)
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      throw new Error('Canvas context not available')
    }

    // Create circular clipping path
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    ctx.clip()

    // Create image from buffer
    const blob = new Blob([logoBuffer])
    const imageBitmap = await createImageBitmap(blob)
    
    // Draw image to fit the circle
    const minDimension = Math.min(imageBitmap.width, imageBitmap.height)
    const scale = size / minDimension
    const scaledWidth = imageBitmap.width * scale
    const scaledHeight = imageBitmap.height * scale
    const x = (size - scaledWidth) / 2
    const y = (size - scaledHeight) / 2
    
    ctx.drawImage(imageBitmap, x, y, scaledWidth, scaledHeight)

    // Convert to PNG
    const blob2 = await canvas.convertToBlob({ type: 'image/png' })
    const arrayBuffer = await blob2.arrayBuffer()

    return new Response(arrayBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    })
  } catch (error) {
    console.error('Error generating icon:', error)
    
    // Fallback to default icon
    const defaultIconResponse = await fetch(`${req.nextUrl.origin}/icons/icon-${size}.png`)
    if (defaultIconResponse.ok) {
      const defaultBuffer = await defaultIconResponse.arrayBuffer()
      return new Response(defaultBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400',
        },
      })
    }
    
    return new Response('Error generating icon', { status: 500 })
  }
}
