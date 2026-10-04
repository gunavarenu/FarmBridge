import { useState, useRef, useCallback } from 'react'
import { uploadImage, thumbnail } from '../../services/cloudinaryService'
import type { Language } from '../../types'

interface Props {
  onUpload: (url: string) => void
  existingUrl?: string
  lang: Language
}

export default function ImageUploader({ onUpload, existingUrl, lang }: Props) {
  const [preview,  setPreview]  = useState<string | null>(existingUrl ?? null)
  const [progress, setProgress] = useState(0)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const text = {
    en: { drag: 'Drag photo here or', browse: 'browse', change: 'Change photo', hint: 'JPG / PNG / WebP · max 5 MB' },
    hi: { drag: 'फ़ोटो यहाँ खींचें या', browse: 'चुनें', change: 'फ़ोटो बदलें', hint: 'JPG / PNG / WebP · अधिकतम 5 MB' },
    mr: { drag: 'फोटो येथे ड्रॅग करा किंवा', browse: 'निवडा', change: 'फोटो बदला', hint: 'JPG / PNG / WebP · कमाल 5 MB' },
  }[lang]

  const handleFile = useCallback(async (file: File) => {
    setError(''); setLoading(true); setProgress(0)
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
    try {
      const result = await uploadImage(file, setProgress)
      setPreview(thumbnail(result.url, 800, 600))
      onUpload(result.url)
    } catch (err) {
      setError((err as Error).message); setPreview(null)
    } finally {
      setLoading(false); setProgress(0)
    }
  }, [onUpload])

  return (
    <div
      className={`uploader-zone ${dragging ? 'uploader-dragging' : ''} ${preview ? 'uploader-has-preview' : ''}`}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f) }}
      onClick={() => !loading && inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />

      {preview ? (
        <div className="uploader-preview-wrap">
          <img src={preview} alt="preview" className="uploader-preview-img" />
          <div className="uploader-overlay">
            <span>{loading ? `${progress}%` : `📷 ${text.change}`}</span>
          </div>
        </div>
      ) : (
        <div className="uploader-placeholder">
          <div className="uploader-icon">📸</div>
          <p className="uploader-text">{text.drag} <span className="uploader-browse">{text.browse}</span></p>
          <p className="uploader-hint">{text.hint}</p>
        </div>
      )}

      {loading && (
        <div className="uploader-progress-bar">
          <div className="uploader-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      )}
      {error && <p className="error-msg" style={{ margin: '6px 8px 0' }}>⚠ {error}</p>}
    </div>
  )
}