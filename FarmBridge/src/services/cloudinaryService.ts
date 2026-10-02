const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string

export interface UploadResult {
  url: string
  publicId: string
}

export async function uploadImage(file: File, onProgress?: (pct: number) => void): Promise<UploadResult> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Only JPG, PNG or WebP allowed.')
  if (file.size > 5 * 1024 * 1024) throw new Error('Image must be smaller than 5 MB.')

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    console.warn('Cloudinary not configured. Using mock image upload.')
    return new Promise((resolve) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += 25
        if (onProgress) onProgress(progress)
        if (progress >= 100) {
          clearInterval(interval)
          resolve({ url: URL.createObjectURL(file), publicId: 'mock_' + Date.now() })
        }
      }, 250)
    })
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', 'farmbridge/products')

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const d = JSON.parse(xhr.responseText)
        resolve({ url: d.secure_url, publicId: d.public_id })
      } else {
        reject(new Error('Upload failed. Check Cloudinary settings.'))
      }
    }
    xhr.onerror = () => reject(new Error('Network error during upload.'))
    xhr.send(formData)
  })
}

export function thumbnail(url: string, w: number, h: number): string {
  if (url.startsWith('blob:') || !url.includes('/upload/')) return url
  return url.replace('/upload/', `/upload/c_fill,w_${w},h_${h},q_auto,f_auto/`)
}