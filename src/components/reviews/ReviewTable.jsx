import { useState, useMemo, useEffect } from 'react'
import useRatingStore from '../../lib/ratingStore'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import { Pencil, Trash2, Search, AlertTriangle, Star, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react'

export default function ReviewTable({ onEdit }) {
  const { 
    ratings, 
    loading, 
    deleteRating, 
    fetchRatings,
    currentPage,
    setCurrentPage,
    totalPages
  } = useRatingStore()
  
  const [deletingId, setDeletingId] = useState(null)
  const [reviewToDelete, setReviewToDelete] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchRatings()
  }, [currentPage, fetchRatings])

  const confirmDelete = async () => {
    if (!reviewToDelete) return
    setDeletingId(reviewToDelete.id)
    try {
      await deleteRating(reviewToDelete.id)
      setReviewToDelete(null)
    } finally {
      setDeletingId(null)
    }
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const filteredRatings = useMemo(() => {
    if (!searchQuery) return ratings
    const q = searchQuery.toLowerCase()
    return ratings.filter(r => 
      (r.client_name?.toLowerCase() || '').includes(q) ||
      (r.comment?.toLowerCase() || '').includes(q) ||
      (r.recipe_id?.toString() || '').includes(q)
    )
  }, [ratings, searchQuery])

  if (loading && !ratings.length) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!ratings.length && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-56 rounded-2xl bg-[#141420] border border-white/5">
        <MessageSquare size={40} className="text-slate-600 mb-3" />
        <p className="text-slate-400 text-sm font-medium">No reviews found on this page.</p>
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
          {filteredRatings.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
              No reviews match your search on this page.
            </div>
          ) : (
            <div className={`overflow-x-auto ${loading ? 'opacity-50 pointer-events-none' : ''} transition-opacity`}>
              <table className="w-full" aria-label="Review management table">
                <thead>
                  <tr className="border-b border-white/5 bg-white/2">
                    <th className="text-left text-xs text-slate-500 font-medium px-5 py-3 uppercase tracking-wider w-20">Recipe ID</th>
                    <th className="text-left text-xs text-slate-500 font-medium px-4 py-3 uppercase tracking-wider">Client Name</th>
                    <th className="text-left text-xs text-slate-500 font-medium px-4 py-3 uppercase tracking-wider">Rating</th>
                    <th className="text-left text-xs text-slate-500 font-medium px-4 py-3 uppercase tracking-wider">Comment</th>
                    <th className="text-right text-xs text-slate-500 font-medium px-5 py-3 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRatings.map((rating, i) => (
                    <tr
                      key={rating.id || i}
                      className={`transition-colors hover:bg-white/3 ${i !== filteredRatings.length - 1 ? 'border-b border-white/5' : ''}`}
                    >
                      <td className="px-5 py-3">
                        <span className="text-slate-300 font-mono text-sm">#{rating.recipe_id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-200 text-sm font-medium">{rating.client_name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={14}
                              className={star <= rating.ratings ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-400 text-sm truncate max-w-[250px]">{rating.comment || '—'}</p>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            id={`edit-review-${rating.id || i}`}
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(rating)}
                            aria-label={`Edit review by ${rating.client_name}`}
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button
                            id={`delete-review-${rating.id || i}`}
                            variant="danger"
                            size="sm"
                            onClick={() => setReviewToDelete(rating)}
                            aria-label={`Delete review by ${rating.client_name}`}
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

      <Modal open={!!reviewToDelete} onClose={() => setReviewToDelete(null)} title="Delete Review" size="sm">
        <div className="flex flex-col items-center text-center space-y-4 py-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="text-red-400" size={24} />
          </div>
          <div>
            <h3 className="text-slate-200 font-medium text-base mb-1">Are you sure?</h3>
            <p className="text-slate-400 text-sm">
              Do you really want to delete the review from <strong>{reviewToDelete?.client_name}</strong>? This action cannot be undone.
            </p>
          </div>
          <div className="flex items-center w-full gap-3 mt-6">
            <Button className="flex-1" variant="secondary" onClick={() => setReviewToDelete(null)}>
              Cancel
            </Button>
            <Button className="flex-1" variant="danger" loading={deletingId === reviewToDelete?.id} onClick={confirmDelete}>
              Delete Review
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
