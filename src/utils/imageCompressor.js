/**
 * Client-side Image Compression & Optimization Utility
 * Converts heavy PNG/JPG files to lightweight WebP format before uploading to Supabase Storage
 */

export async function compressImage(file, options = {}) {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82,
    outputType = 'image/webp'
  } = options

  // If not an image, return original
  if (!file || !file.type.startsWith('image/')) {
    return file
  }

  // If already small SVG or GIF, don't compress
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result

      img.onload = () => {
        let width = img.width
        let height = img.height

        // Calculate aspect ratio preserving scale
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          } else {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        // High quality smoothing
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file)
              return
            }

            // Create a new File object with updated extension if WebP
            const extension = outputType === 'image/webp' ? '.webp' : '.jpg'
            const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
            const newFileName = `${originalName}${extension}`

            const optimizedFile = new File([blob], newFileName, {
              type: outputType,
              lastModified: Date.now()
            })

            // Only use optimized if it's actually smaller
            if (optimizedFile.size < file.size) {
              resolve(optimizedFile)
            } else {
              resolve(file)
            }
          },
          outputType,
          quality
        )
      }

      img.onerror = () => {
        resolve(file) // Fallback to original file on load error
      }
    }

    reader.onerror = () => {
      resolve(file) // Fallback to original file on read error
    }
  })
}
