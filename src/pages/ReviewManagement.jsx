import { useState } from 'react'
import { Plus, MessageSquare } from 'lucide-react'
import ReviewTable from '../components/reviews/ReviewTable'
import ReviewFormModal from '../components/reviews/ReviewFormModal'
import Button from '../components/ui/Button'
import useRatingStore from '../lib/ratingStore'

export default function ReviewManagement() {
  const { ratings, loading } = useRatingStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState(null)

  const handleNewReview = () => {
    setEditData(null)
    setModalOpen(true)
  }

  const handleEdit = (review) => {
    setEditData(review)
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
          <h1 className="text-slate-100 text-2xl font-bold">Client Reviews</h1>
          <p className="text-slate-500 text-sm mt-1">
            {loading ? 'Loading…' : `${ratings.length} review${ratings.length !== 1 ? 's' : ''} total`}
          </p>
        </div>
        <Button
          id="new-review-btn"
          variant="primary"
          size="md"
          onClick={handleNewReview}
        >
          <Plus size={16} />
          New Review
        </Button>
      </div>

      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#141420] border border-white/5">
        <MessageSquare size={16} className="text-purple-400 shrink-0" />
        <p className="text-slate-500 text-xs">
          Manage client feedback and ratings. These will be displayed on the customer-facing portfolio for specific services.
        </p>
      </div>

      <ReviewTable onEdit={handleEdit} />

      <ReviewFormModal
        open={modalOpen}
        onClose={handleClose}
        editData={editData}
      />
    </div>
  )
}
