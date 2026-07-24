import { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import { UploadCloud, Image as ImageIcon, X, CheckCircle, RefreshCw, Trash2, Edit3 } from 'lucide-react'
import Button from '../components/ui/Button'
import useHomePageStore from '../lib/homePageStore'

const MAX_FILE_SIZE = 10 * 1024 * 1024

const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    if (file.size <= MAX_FILE_SIZE) {
      resolve(file)
      return
    }

    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      const MAX_DIMENSION = 3840
      let { width, height } = img
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      const tryCompress = (quality) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas compression failed'))
              return
            }
            if (blob.size <= MAX_FILE_SIZE || quality <= 0.1) {
              const compressed = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })
              resolve(compressed)
            } else {
              tryCompress(Math.max(quality - 0.1, 0.1))
            }
          },
          'image/jpeg',
          quality,
        )
      }

      tryCompress(0.85)
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to load image for compression'))
    }

    img.src = objectUrl
  })
}

function ImageSection({ title, description, maxImages, activeImages, sectionName, onUpload, onUpdate, onDelete, onRefresh, loading }) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [editingImage, setEditingImage] = useState(null)
  const inputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (validFiles.length !== files.length) {
      toast.error('Some files were not images and were ignored')
    }

    const activeCount = Array.isArray(activeImages) ? activeImages.length : 0
    const allowedRemaining = maxImages - activeCount

    if (selectedFiles.length + validFiles.length > allowedRemaining) {
      toast.error(`You can only upload a maximum of ${maxImages} images total. You have ${activeCount} active images.`)
      return
    }

    const newFiles = [...selectedFiles, ...validFiles].slice(0, allowedRemaining)
    setSelectedFiles(newFiles)

    previewUrls.forEach(url => URL.revokeObjectURL(url))
    setPreviewUrls(newFiles.map(f => URL.createObjectURL(f)))
    setUploadComplete(false)
  }

  const handleRemove = (index) => {
    const newFiles = [...selectedFiles]
    newFiles.splice(index, 1)

    const newUrls = [...previewUrls]
    URL.revokeObjectURL(newUrls[index])
    newUrls.splice(index, 1)

    setSelectedFiles(newFiles)
    setPreviewUrls(newUrls)
    setUploadComplete(false)

    if (newFiles.length === 0 && inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const [uploadStatus, setUploadStatus] = useState('idle') // 'idle' | 'compressing' | 'uploading'

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

    if (!cloudName || !uploadPreset) {
      toast.error('Cloudinary configuration is missing. Please check your .env file.')
      return
    }

    try {
      // Step 1 – compress any oversized images client-side
      setUploadStatus('compressing')
      const compressedFiles = await Promise.all(selectedFiles.map(compressImage))

      // Step 2 – upload to Cloudinary
      setUploadStatus('uploading')
      setIsUploading(true)
      const uploadedUrls = []

      for (const file of compressedFiles) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', uploadPreset)

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        })

        const data = await response.json()
        if (data.secure_url) {
          uploadedUrls.push(data.secure_url)
        } else {
          throw new Error(data.error?.message || 'Failed to upload image')
        }
      }

      // Step 3 – save URLs to the database
      try {
        for (const url of uploadedUrls) {
          await onUpload({ image_url: url, section: sectionName })
        }
        toast.success(`Successfully uploaded and saved ${uploadedUrls.length} image(s)!`)
        setUploadComplete(true)
      } catch (err) {
        console.error('Failed to save image URLs to database', err)
        toast.error('Images uploaded to Cloudinary, but failed to save to database.')
      }

    } catch (error) {
      console.error('Upload error:', error)
      toast.error('An error occurred while uploading the images.')
    } finally {
      setIsUploading(false)
      setUploadStatus('idle')
    }
  }

  const handleReset = () => {
    setSelectedFiles([])
    previewUrls.forEach(url => URL.revokeObjectURL(url))
    setPreviewUrls([])
    setUploadComplete(false)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleDeleteActive = async (id) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await onDelete(id, sectionName)
        toast.success('Image deleted successfully')
      } catch {
        // Error handled in store
      }
    }
  }

  const handleUpdateActive = async (e) => {
    e.preventDefault()
    try {
      await onUpdate(editingImage.id, {
        title: editingImage.title,
        image_url: editingImage.image_url,
        section: sectionName
      })
      toast.success('Image updated successfully')
      setEditingImage(null)
    } catch {
      // Error handled in store
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-slate-100 text-2xl font-bold">{title}</h1>
        <p className="text-slate-500 text-sm mt-1">{description}</p>
      </div>

      {activeImages && activeImages.length > 0 && (
        <div className="bg-[#141420] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-200 text-lg font-semibold">Currently Active Images</h2>
            <Button variant="secondary" size="sm" onClick={onRefresh} disabled={loading}>
              <RefreshCw size={14} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {activeImages.map((img) => (
              <div key={img.id} className="relative rounded-xl overflow-hidden bg-black/40 border border-white/5 aspect-video flex items-center justify-center group">
                <img src={img.image_url} alt={img.title || 'Image'} className="max-w-full max-h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                  <button
                    onClick={() => setEditingImage(img)}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                    title="Edit Title"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteActive(img.id)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-full transition-colors"
                    title="Delete Image"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                {img.title && (
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 px-2 py-1 text-xs text-white truncate text-center">
                    {img.title}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[#141420] border border-white/5 rounded-2xl p-8">
        {selectedFiles.length === 0 ? (
          <div
            className={`relative border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center transition-colors duration-200
              ${dragActive ? 'border-purple-500 bg-purple-500/10' : 'border-slate-700 bg-[#0f0f14] hover:border-slate-600'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
              <UploadCloud size={32} className={dragActive ? 'text-purple-400' : 'text-slate-400'} />
            </div>
            <h3 className="text-lg font-medium text-slate-200 mb-2">
              Drag and drop your images here
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              or click to browse your files. Supports JPG, PNG, WEBP (Max {maxImages} images).
            </p>
            <Button variant="primary" size="md" onClick={() => inputRef.current?.click()}>
              Select Files
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative rounded-xl overflow-hidden bg-black/40 border border-white/5 aspect-video flex items-center justify-center">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="max-w-full max-h-full object-contain"
                  />
                  {!isUploading && !uploadComplete && (
                    <button
                      onClick={() => handleRemove(index)}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}

              {selectedFiles.length < maxImages && !isUploading && !uploadComplete && (
                <div
                  onClick={() => inputRef.current?.click()}
                  className="relative rounded-xl border-2 border-dashed border-slate-700 bg-black/20 hover:border-slate-500 aspect-video flex flex-col items-center justify-center cursor-pointer transition-colors group"
                >
                  <UploadCloud size={24} className="text-slate-500 mb-2 group-hover:text-purple-400 transition-colors" />
                  <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                    Add more ({maxImages - selectedFiles.length} left)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-[#0f0f14] border border-white/5 gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  <ImageIcon size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate max-w-[200px] sm:max-w-xs">
                    {selectedFiles.length} image{selectedFiles.length !== 1 ? 's' : ''} selected
                  </p>
                  <p className="text-xs text-slate-500">
                    Max {maxImages} allowed
                  </p>
                </div>
              </div>

              {uploadComplete ? (
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle size={18} />
                  <span className="text-sm font-medium">Uploaded Successfully</span>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleUpload}
                  disabled={isUploading || uploadStatus === 'compressing'}
                >
                  {uploadStatus === 'compressing'
                    ? 'Compressing...'
                    : uploadStatus === 'uploading'
                      ? 'Uploading...'
                      : `Upload ${selectedFiles.length} Image${selectedFiles.length !== 1 ? 's' : ''}`}
                </Button>
              )}
            </div>

            {uploadComplete && (
              <div className="space-y-4 mt-4">
                <div className="flex justify-end">
                  <Button variant="secondary" size="md" onClick={handleReset}>
                    Upload More Images
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {editingImage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141420] border border-white/5 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-slate-100 mb-4">Edit Image</h3>
            <form onSubmit={handleUpdateActive} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Image URL</label>
                <input
                  type="text"
                  required
                  value={editingImage.image_url || ''}
                  onChange={(e) => setEditingImage({ ...editingImage, image_url: e.target.value })}
                  className="w-full bg-[#0f0f14] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={editingImage.title || ''}
                  onChange={(e) => setEditingImage({ ...editingImage, title: e.target.value })}
                  placeholder="Optional title..."
                  className="w-full bg-[#0f0f14] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <Button variant="secondary" type="button" onClick={() => setEditingImage(null)}>Cancel</Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ImageUpload() {
  const {
    headerImages,
    previousWorkImages,
    fetchHeaderImages,
    fetchPreviousWorkImages,
    createPageImage,
    updatePageImage,
    deletePageImage,
    loading
  } = useHomePageStore()

  useEffect(() => {
    fetchHeaderImages()
    fetchPreviousWorkImages()
  }, [fetchHeaderImages, fetchPreviousWorkImages])

  return (
    <div className="space-y-12 max-w-4xl mx-auto pb-12">
      <ImageSection
        title="Header Images"
        description="Upload up to 5 images for the header slider."
        maxImages={5}
        sectionName="header"
        activeImages={headerImages}
        loading={loading}
        onUpload={createPageImage}
        onUpdate={updatePageImage}
        onDelete={deletePageImage}
        onRefresh={fetchHeaderImages}
      />

      <hr className="border-white/10" />

      <ImageSection
        title="Previous Work Images"
        description="Upload up to 6 images for the previous work section."
        maxImages={6}
        sectionName="previous_work"
        activeImages={previousWorkImages}
        loading={loading}
        onUpload={createPageImage}
        onUpdate={updatePageImage}
        onDelete={deletePageImage}
        onRefresh={fetchPreviousWorkImages}
      />
    </div>
  )
}
