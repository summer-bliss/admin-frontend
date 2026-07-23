import { create } from 'zustand'
import api from './api'

const URL_REGEX = /^https?:\/\/.+/i

const useImageStore = create((set, get) => ({
  images: [],
  loading: false,
  error: null,

  currentPage: 1,
  totalPages: 1,

  setCurrentPage: (page) => set({ currentPage: page }),

  fetchImages: async () => {
    const { currentPage } = get()
    set({ loading: true, error: null })
    try {
      const { data } = await api.get(`/gallery?page=${currentPage}&limit=10`)

      const payload = data.data || data
      let flatImages = []

      if (Array.isArray(payload)) {
        flatImages = payload
      } else if (payload && typeof payload === 'object') {
        Object.values(payload).forEach((items) => {
          if (Array.isArray(items)) {
            flatImages.push(...items)
          }
        })
      }

      set({
        images: flatImages,
        loading: false,
        totalPages: data.pagination?.totalPages || data.pagination?.total_pages || payload?.pagination?.totalPages || payload?.pagination?.total_pages || data.totalPages || data.total_pages || 1
      })
    } catch {
      set({ error: 'Failed to load images.', loading: false })
    }
  },

  createImage: async (payload) => {
    const { image_url, title, description, category, sub_category } = payload

    if (!URL_REGEX.test(image_url)) {
      throw new Error('Invalid image URL format.')
    }
    if (!title || title.trim().length < 2) {
      throw new Error('Title must be at least 2 characters.')
    }

    const { data } = await api.post('/gallery', {
      image_url: image_url.trim(),
      title: title.trim(),
      description: description?.trim() || '',
      category: category?.trim() || '',
      sub_category: sub_category?.trim() || '',
    })

    await get().fetchImages()
    return data
  },

  updateImage: async (id, payload) => {
    const { image_url, title, description, category, sub_category } = payload

    if (image_url && !URL_REGEX.test(image_url)) {
      throw new Error('Invalid image URL format.')
    }

    const { data } = await api.put(`/gallery/${id}`, {
      image_url: image_url?.trim(),
      title: title?.trim(),
      description: description?.trim(),
      category: category?.trim(),
      sub_category: sub_category?.trim(),
    })

    await get().fetchImages()
    return data
  },

  deleteImage: async (id) => {
    await api.delete(`/gallery/${id}`)
    await get().fetchImages()
  },
}))

export default useImageStore
