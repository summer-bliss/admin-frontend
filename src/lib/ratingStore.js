import { create } from 'zustand'
import api from './api'

const useRatingStore = create((set, get) => ({
  ratings: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,

  setCurrentPage: (page) => set({ currentPage: page }),

  fetchRatings: async () => {
    const { currentPage } = get()
    set({ loading: true, error: null })
    try {
      const { data } = await api.get(`/ratings?page=${currentPage}&limit=10`)
      const payload = data.data || data
      set({ 
        ratings: Array.isArray(payload) ? payload : [], 
        loading: false,
        totalPages: data.totalPages || data.total_pages || 1
      })
    } catch {
      set({ error: 'Failed to load ratings.', loading: false })
    }
  },

  createRating: async (payload) => {
    try {
      set({ loading: true, error: null })
      await api.post('/ratings', payload)
      await get().fetchRatings()
      return true
    } catch {
      set({ error: 'Failed to create rating.', loading: false })
      return false
    }
  },

  updateRating: async (id, payload) => {
    try {
      set({ loading: true, error: null })
      await api.patch(`/ratings/${id}`, payload)
      await get().fetchRatings()
      return true
    } catch {
      set({ error: 'Failed to update rating.', loading: false })
      return false
    }
  },

  deleteRating: async (id) => {
    try {
      set({ loading: true, error: null })
      await api.delete(`/ratings/${id}`)
      await get().fetchRatings()
      return true
    } catch {
      set({ error: 'Failed to delete rating.', loading: false })
      return false
    }
  },
}))

export default useRatingStore
