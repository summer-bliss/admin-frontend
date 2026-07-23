import { useEffect, useState } from 'react'
import { Plus, Images } from 'lucide-react'
import useImageStore from '../lib/imageStore'
import ImageTable from '../components/images/ImageTable'
import ImageFormModal from '../components/images/ImageFormModal'
import Button from '../components/ui/Button'

export default function ImageManagement() {
  const { fetchImages, images, loading } = useImageStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState(null)

  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  const handleNewImage = () => {
    setEditData(null)
    setModalOpen(true)
  }

  const handleEdit = (img) => {
    setEditData(img)
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)
    setEditData(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-slate-100 text-2xl font-bold">Portfolio Management</h1>
          <p className="text-slate-500 text-sm mt-1">
            {loading ? 'Loading…' : `${images.length} image${images.length !== 1 ? 's' : ''} total`}
          </p>
        </div>
        <Button
          id="new-image-btn"
          variant="primary"
          size="md"
          onClick={handleNewImage}
        >
          <Plus size={16} />
          New Image
        </Button>
      </div>

      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#141420] border border-white/5">
        <Images size={16} className="text-purple-400 shrink-0" />
        <p className="text-slate-500 text-xs">
          Images are displayed in the customer-facing portfolio. Add an image URL, title, and category to make it visible.
        </p>
      </div>

      <ImageTable onEdit={handleEdit} />

      <ImageFormModal
        open={modalOpen}
        onClose={handleClose}
        editData={editData}
      />
    </div>
  )
}
