import { create } from 'zustand'
import api from './api'

const useHomePageStore = create((set, get) => ({
  loading: false,
  error: null,
  headerImages: [],
  previousWorkImages: [],

  fetchHeaderImages: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.get('/page-images?section=header')
      set({ headerImages: data.data || [], loading: false })
      return data.data || []
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch header images', 
        loading: false 
      })
      throw error
    }
  },

  fetchPreviousWorkImages: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.get('/page-images?section=previous_work')
      set({ previousWorkImages: data.data || [], loading: false })
      return data.data || []
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch previous work images', 
        loading: false 
      })
      throw error
    }
  },
  
  createPageImage: async (payload) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/page-images', payload)
      if (payload.section === 'header') await get().fetchHeaderImages()
      else await get().fetchPreviousWorkImages()
      set({ loading: false })
      return data
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to create page image', 
        loading: false 
      })
      throw error
    }
  },

  updatePageImage: async (id, payload) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.put(`/page-images/${id}`, payload)
      if (payload.section === 'header') await get().fetchHeaderImages()
      else await get().fetchPreviousWorkImages()
      set({ loading: false })
      return data
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to update page image',
        loading: false
      })
      throw error
    }
  },

  deletePageImage: async (id, section) => {
    set({ loading: true, error: null })
    try {
      await api.delete(`/page-images/${id}`)
      if (section === 'header') await get().fetchHeaderImages()
      else await get().fetchPreviousWorkImages()
      set({ loading: false })
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to delete page image',
        loading: false
      })
      throw error
    }
  }
}))

export default useHomePageStore
