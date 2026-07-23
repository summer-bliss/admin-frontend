import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import useRatingStore from '../../lib/ratingStore'
import { Star } from 'lucide-react'

export default function ReviewFormModal({ open, onClose, editData }) {
  const { createRating, updateRating } = useRatingStore()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hoverRating, setHoverRating] = useState(0)
  
  const [formData, setFormData] = useState({
    recipe_id: '',
    client_name: '',
    comment: '',
    ratings: 5
  })

  useEffect(() => {
    if (open) {
      if (editData) {
        setFormData({
          recipe_id: editData.recipe_id || '',
          client_name: editData.client_name || '',
          comment: editData.comment || '',
          ratings: editData.ratings || 5
        })
      } else {
        setFormData({
          recipe_id: '',
          client_name: '',
          comment: '',
          ratings: 5
        })
      }
      setError(null)
      setHoverRating(0)
    }
  }, [open, editData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!formData.recipe_id || !formData.client_name || !formData.comment || !formData.ratings) {
      setError('Please fill in all fields')
      return
    }

    const payload = {
      ...formData,
      recipe_id: Number(formData.recipe_id),
      ratings: Number(formData.ratings)
    }

    setLoading(true)
    try {
      let success
      if (editData) {
        success = await updateRating(editData.id, payload)
      } else {
        success = await createRating(payload)
      }

      if (success) {
        onClose()
      } else {
        setError('Failed to save review. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editData ? 'Edit Review' : 'New Review'} size="md">
      <form onSubmit={handleSubmit} className="space-y-5 py-2">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="recipe_id" className="block text-sm font-medium text-slate-300">
              Recipe ID
            </label>
            <input
              type="number"
              id="recipe_id"
              value={formData.recipe_id}
              onChange={e => setFormData({ ...formData, recipe_id: e.target.value })}
              className="w-full bg-[#141420] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50"
              placeholder="e.g. 1"
            />
          </div>
          
          <div className="space-y-1.5">
            <label htmlFor="client_name" className="block text-sm font-medium text-slate-300">
              Client Name
            </label>
            <input
              type="text"
              id="client_name"
              value={formData.client_name}
              onChange={e => setFormData({ ...formData, client_name: e.target.value })}
              className="w-full bg-[#141420] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50"
              placeholder="e.g. John Doe"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">
            Rating
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData({ ...formData, ratings: star })}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-md transition-transform hover:scale-110"
                aria-label={`Rate ${star} stars`}
              >
                <Star
                  size={28}
                  className={`transition-colors ${
                    star <= (hoverRating || formData.ratings)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-slate-600'
                  }`}
                />
              </button>
            ))}
            <span className="ml-3 text-sm font-medium text-slate-400">
              {formData.ratings} out of 5 stars
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="comment" className="block text-sm font-medium text-slate-300">
            Comment
          </label>
          <textarea
            id="comment"
            value={formData.comment}
            onChange={e => setFormData({ ...formData, comment: e.target.value })}
            rows={4}
            className="w-full bg-[#141420] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 resize-none"
            placeholder="What did the client say about this cake?"
          />
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {editData ? 'Save Changes' : 'Create Review'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
