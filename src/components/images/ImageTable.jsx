import { useState, useMemo, useEffect } from 'react'
import useImageStore from '../../lib/imageStore'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import { Pencil, Trash2, Image as ImageIcon, Search, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'

export default function ImageTable({ onEdit }) {
  const { 
    images, 
    loading, 
    deleteImage, 
    fetchImages, 
    currentPage, 
    setCurrentPage, 
    totalPages 
  } = useImageStore()
  
  const [deletingId, setDeletingId] = useState(null)
  const [imageToDelete, setImageToDelete] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchImages()
  }, [currentPage, fetchImages])

  const confirmDelete = async () => {
    if (!imageToDelete) return
    setDeletingId(imageToDelete.id)
    try {
      await deleteImage(imageToDelete.id)
      setImageToDelete(null)
    } finally {
      setDeletingId(null)
    }
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const filteredImages = useMemo(() => {
    if (!searchQuery) return images
    const q = searchQuery.toLowerCase()
    return images.filter(img => 
      (img.title?.toLowerCase() || '').includes(q) ||
      (img.category?.toLowerCase() || '').includes(q)
    )
  }, [images, searchQuery])

  if (loading && !images.length) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!images.length && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-56 rounded-2xl bg-[#141420] border border-white/5">
        <ImageIcon size={40} className="text-slate-600 mb-3" />
        <p className="text-slate-400 text-sm font-medium">No images found on this page.</p>
        <div className="flex gap-2 mt-4">
          <Button variant="ghost" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search current page..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full bg-[#141420] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
            />
          </div>
        </div>

        <div className="rounded-2xl bg-[#141420] border border-white/5 overflow-hidden">
          {filteredImages.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
              No images match your search on this page.
            </div>
          ) : (
            <div className={`overflow-x-auto ${loading ? 'opacity-50 pointer-events-none' : ''} transition-opacity`}>
              <table className="w-full" aria-label="Image management table">
                <thead>
                  <tr className="border-b border-white/5 bg-white/2">
                    <th className="text-left text-xs text-slate-500 font-medium px-5 py-3 uppercase tracking-wider w-16">Preview</th>
                    <th className="text-left text-xs text-slate-500 font-medium px-4 py-3 uppercase tracking-wider">Title</th>
                    <th className="text-left text-xs text-slate-500 font-medium px-4 py-3 uppercase tracking-wider hidden lg:table-cell">Category</th>
                    <th className="text-left text-xs text-slate-500 font-medium px-4 py-3 uppercase tracking-wider hidden md:table-cell">Description</th>
                    <th className="text-right text-xs text-slate-500 font-medium px-5 py-3 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredImages.map((img, i) => (
                    <tr
                      key={img.id || i}
                      className={`transition-colors hover:bg-white/3 ${i !== filteredImages.length - 1 ? 'border-b border-white/5' : ''}`}
                    >
                      <td className="px-5 py-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 flex items-center justify-center">
                          <img
                            src={img.image_url}
                            alt={img.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                          <span className="hidden items-center justify-center w-full h-full">
                            <ImageIcon size={16} className="text-slate-600" />
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-200 text-sm font-medium truncate max-w-[160px]">{img.title}</p>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs font-medium text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
                          {img.category || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-slate-500 text-xs truncate max-w-[220px]">{img.description || '—'}</p>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            id={`edit-image-${img.id || i}`}
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(img)}
                            aria-label={`Edit ${img.title}`}
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button
                            id={`delete-image-${img.id || i}`}
                            variant="danger"
                            size="sm"
                            onClick={() => setImageToDelete(img)}
                            aria-label={`Delete ${img.title}`}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500">
            Page {currentPage} of {Math.max(totalPages, 1)}
          </span>
          <div className="flex items-center gap-1 bg-[#141420] border border-white/5 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={currentPage === 1 ? 'opacity-50' : ''}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="text-xs font-medium text-slate-300 px-3">
              {currentPage} / {Math.max(totalPages, 1)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className={currentPage >= totalPages ? 'opacity-50' : ''}
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>

      <Modal open={!!imageToDelete} onClose={() => setImageToDelete(null)} title="Delete Image" size="sm">
        <div className="flex flex-col items-center text-center space-y-4 py-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="text-red-400" size={24} />
          </div>
          <div>
            <h3 className="text-slate-200 font-medium text-base mb-1">Are you sure?</h3>
            <p className="text-slate-400 text-sm">
              Do you really want to delete <strong>{imageToDelete?.title}</strong>? This action cannot be undone.
            </p>
          </div>
          <div className="flex items-center w-full gap-3 mt-6">
            <Button className="flex-1" variant="secondary" onClick={() => setImageToDelete(null)}>
              Cancel
            </Button>
            <Button className="flex-1" variant="danger" loading={deletingId === imageToDelete?.id} onClick={confirmDelete}>
              Delete Image
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
