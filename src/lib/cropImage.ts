/**
 * Create a cropped image from a source image and crop area
 * @param imageSrc - The source image URL
 * @param pixelCrop - The crop area in pixels
 * @param rotation - Rotation in degrees (default 0)
 * @returns Promise that resolves to the cropped image as a Blob URL
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0
): Promise<string> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Could not get canvas context')
  }

  const maxSize = Math.max(image.width, image.height)
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

  // Set canvas size to accommodate the rotation
  canvas.width = safeArea
  canvas.height = safeArea

  // Translate canvas context to center
  ctx.translate(safeArea / 2, safeArea / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.translate(-safeArea / 2, -safeArea / 2)

  // Draw the rotated image
  ctx.drawImage(
    image,
    safeArea / 2 - image.width / 2,
    safeArea / 2 - image.height / 2
  )

  // Get the cropped image data
  const data = ctx.getImageData(
    0,
    0,
    safeArea,
    safeArea
  )

  // Set canvas to final crop size
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  // Paste the cropped area
  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width / 2 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height / 2 - pixelCrop.y)
  )

  // Convert canvas to blob and return URL
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'))
        return
      }
      const fileUrl = URL.createObjectURL(blob)
      resolve(fileUrl)
    }, 'image/jpeg', 0.95)
  })
}

/**
 * Helper function to create an image element from a URL
 */
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous') // Needed for CORS
    image.src = url
  })
}

