import { create } from 'zustand'
import api from './api'

const useOrderStore = create((set) => ({
  orders: [],
  loading: false,
  error: null,

  fetchOrders: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.get('/orders')
      set({ orders: data, loading: false })
    } catch {
      set({ error: 'Failed to load orders.', loading: false })
    }
  },
}))

export default useOrderStore
