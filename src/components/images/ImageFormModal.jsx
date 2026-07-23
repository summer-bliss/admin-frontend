import { useState, useEffect, useRef, useCallback } from 'react'
import { UploadCloud, X, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import useImageStore from '../../lib/imageStore'

const INITIAL_FORM = {
  image_url: '',
  title: '',
  description: '',
  category: '',
}

const URL_REGEX = /^https?:\/\/.+/i
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_MB = 10
const CLOUD_NAME = 'o6odreog'
const UPLOAD_PRESET = 'summer-bliss-weddings'
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

function ImageDropZone({ onUploaded, existingUrl }) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [preview, setPreview] = useState(existingUrl || null)
  const [uploadError, setUploadError] = useState('')
  const [uploaded, setUploaded] = useState(Boolean(existingUrl))
  const inputRef = useRef(null)

  useEffect(() => {
    if (existingUrl) {
      setPreview(existingUrl)
      setUploaded(true)
    }
  }, [existingUrl])

  const uploadToCloudinary = useCallback(async (file) => {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      setUploadError('Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your .env file.')
      return
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError('Only JPG, PNG, WEBP and GIF images are allowed.')
      return
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setUploadError(`File is too large. Maximum size is ${MAX_SIZE_MB} MB.`)
      return
    }

    setUploadError('')
    setUploading(true)
    setUploadProgress(0)
    setUploaded(false)

    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)

    try {
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', CLOUDINARY_URL)

        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            setUploadProgress(Math.round((evt.loaded / evt.total) * 100))
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText)
            onUploaded(data.secure_url)
            setUploaded(true)
            setUploading(false)
            resolve()
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText)
              reject(new Error(errorData.error?.message || 'Upload failed. Please try again.'))
            } catch (e) {
              reject(new Error('Upload failed. Please try again.'))
            }
          }
        }

        xhr.onerror = () => reject(new Error('Network error during upload.'))
        xhr.send(formData)
      })
    } catch (err) {
      setUploadError(err.message)
      setPreview(null)
      setUploading(false)
    } finally {
      URL.revokeObjectURL(objectUrl)
    }
  }, [onUploaded])

  const handleFiles = useCallback((files) => {
    const file = files[0]
    if (file) uploadToCloudinary(file)
  }, [uploadToCloudinary])

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const onDragLeave = (e) => { e.preventDefault(); setIsDragging(false) }
  const onDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }
  const onInputChange = (e) => handleFiles(e.target.files)

  const clearImage = (e) => {
    e.stopPropagation()
    setPreview(null)
    setUploaded(false)
    setUploadError('')
    setUploadProgress(0)
    onUploaded('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">
        Upload Image
      </label>

      <div
        id="image-dropzone"
        role="button"
        tabIndex={0}
        aria-label="Drag and drop image or click to browse"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden
          ${isDragging
            ? 'border-purple-400 bg-purple-500/10 scale-[1.01]'
            : uploaded
              ? 'border-emerald-500/40 bg-emerald-500/5'
              : 'border-white/10 bg-[#0f0f14] hover:border-purple-500/40 hover:bg-purple-500/5'
          }
          ${preview ? 'h-44' : 'h-36'}
        `}
      >
        <input
          ref={inputRef}
          id="image-file-input"
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          className="hidden"
          onChange={onInputChange}
          aria-hidden="true"
        />

        {preview ? (
          <>
            <img
              src={preview}
              alt="Preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
            {!uploading && (
              <button
                type="button"
                id="clear-preview-btn"
                onClick={clearImage}
                aria-label="Remove uploaded image"
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-slate-300 hover:text-white hover:bg-black/90 transition-colors z-10"
              >
                <X size={14} />
              </button>
            )}
            {uploading && (
              <div className="relative z-10 flex flex-col items-center gap-2 w-32">
                <div className="w-full h-1.5 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full bg-purple-400 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-white text-xs font-medium">{uploadProgress}%</span>
              </div>
            )}
            {!uploading && uploaded && (
              <div className="relative z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                <CheckCircle size={13} className="text-emerald-400" />
                <span className="text-emerald-400 text-xs font-medium">Uploaded</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 p-4 text-center pointer-events-none select-none">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDragging ? 'bg-purple-500/30' : 'bg-white/5'}`}>
              <UploadCloud size={20} className={isDragging ? 'text-purple-300' : 'text-slate-500'} />
            </div>
            <div>
              <p className="text-slate-300 text-sm font-medium">
                {isDragging ? 'Drop it here!' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-slate-600 text-xs mt-0.5">
                JPG, PNG, WEBP, GIF · max {MAX_SIZE_MB} MB
              </p>
            </div>
          </div>
        )}
      </div>

      {uploadError && (
        <div
          role="alert"
          className="flex items-start gap-2 mt-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20"
        >
          <AlertCircle size={13} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-red-400 text-xs">{uploadError}</p>
        </div>
      )}

      <div className="flex items-center gap-2 mt-3">
        <div className="flex-1 h-px bg-white/5" />
        <span className="text-slate-600 text-xs">or paste a URL below</span>
        <div className="flex-1 h-px bg-white/5" />
      </div>
    </div>
  )
}

export default function ImageFormModal({ open, onClose, editData = null }) {
  const { createImage, updateImage } = useImageStore()
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const isEditing = Boolean(editData)

  useEffect(() => {
    if (open) {
      setForm(editData ? {
        image_url: editData.image_url || '',
        title: editData.title || '',
        description: editData.description || '',
        category: editData.category || '',
      } : INITIAL_FORM)
      setErrors({})
      setServerError('')
    }
  }, [open, editData])

  const validate = () => {
    const e = {}
    if (!URL_REGEX.test(form.image_url)) e.image_url = 'Please upload an image or enter a valid URL (https://...).'
    if (!form.title.trim() || form.title.trim().length < 2) e.title = 'Title must be at least 2 characters.'
    if (form.title.trim().length > 120) e.title = 'Title must be under 120 characters.'
    if (form.description.length > 1000) e.description = 'Description must be under 1000 characters.'
    if (form.category.trim().length > 80) e.category = 'Category must be under 80 characters.'
    return e
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleUploaded = (url) => {
    setForm((prev) => ({ ...prev, image_url: url }))
    if (errors.image_url) setErrors((prev) => ({ ...prev, image_url: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    setServerError('')

    try {
      if (isEditing) {
        await updateImage(editData.id, form)
      } else {
        await createImage(form)
      }
      onClose()
    } catch (err) {
      setServerError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (field) =>
    `w-full bg-[#0f0f14] border ${errors[field] ? 'border-red-500/60' : 'border-white/10'} rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 ${errors[field] ? 'focus:ring-red-500/30' : 'focus:ring-purple-500/30'} focus:border-purple-500/50 transition-colors`

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Edit Image' : 'Add New Image'} size="md">
      <form id="image-form" onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">

          <ImageDropZone
            onUploaded={handleUploaded}
            existingUrl={isEditing ? editData?.image_url : ''}
          />

          <div>
            <label htmlFor="image_url" className="block text-xs font-medium text-slate-400 mb-1.5">
              Image URL <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <ImageIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
              <input
                id="image_url"
                name="image_url"
                type="url"
                value={form.image_url}
                onChange={handleChange}
                placeholder="https://res.cloudinary.com/..."
                maxLength={2048}
                className={`${inputClass('image_url')} pl-9`}
                aria-describedby={errors.image_url ? 'image_url-error' : undefined}
              />
            </div>
            {errors.image_url && (
              <p id="image_url-error" role="alert" className="text-red-400 text-xs mt-1">{errors.image_url}</p>
            )}
          </div>

          <div>
            <label htmlFor="title" className="block text-xs font-medium text-slate-400 mb-1.5">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Chocolate Fudge Cake"
              maxLength={120}
              className={inputClass('title')}
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
            {errors.title && (
              <p id="title-error" role="alert" className="text-red-400 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="category" className="block text-xs font-medium text-slate-400 mb-1.5">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className={inputClass('category')}
              aria-describedby={errors.category ? 'category-error' : undefined}
            >
              <option value="">Select Category...</option>
              <option value="Wedding">Wedding</option>
              <option value="Engagement">Engagement</option>
            </select>
            {errors.category && (
              <p id="category-error" role="alert" className="text-red-400 text-xs mt-1">{errors.category}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-medium text-slate-400 mb-1.5">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe this image..."
              rows={3}
              maxLength={1000}
              className={`${inputClass('description')} resize-none`}
              aria-describedby={errors.description ? 'description-error' : undefined}
            />
            <div className="flex justify-between mt-1">
              {errors.description
                ? <p id="description-error" role="alert" className="text-red-400 text-xs">{errors.description}</p>
                : <span />}
              <span className="text-slate-600 text-xs">{form.description.length}/1000</span>
            </div>
          </div>

          {serverError && (
            <div
              role="alert"
              className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
            >
              {serverError}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/5">
          <Button id="image-form-cancel" type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button id="image-form-submit" type="submit" variant="primary" loading={loading}>
            {isEditing ? 'Save Changes' : 'Add Image'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
