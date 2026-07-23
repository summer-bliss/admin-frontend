import { useEffect } from 'react'
import { Calendar } from 'lucide-react'
import useOrderStore from '../lib/orderStore'
import OrderTable from '../components/orders/OrderTable'

const MOCK_ORDERS = [
  { id: '#BKG-001', customer: 'Emma Wilson', item: 'Wedding Photography Package', total: '$1200.00', status: 'Delivered', date: '2025-12-01' },
  { id: '#BKG-002', customer: 'James Carter', item: 'Engagement Shoot', total: '$350.00', status: 'Processing', date: '2025-12-02' },
  { id: '#BKG-003', customer: 'Lily Chen', item: 'Portrait Session', total: '$150.00', status: 'Pending', date: '2025-12-03' },
  { id: '#BKG-004', customer: 'Noah Adams', item: 'Maternity Shoot', total: '$250.00', status: 'Delivered', date: '2025-12-04' },
  { id: '#BKG-005', customer: 'Olivia Hart', item: 'Family Photoshoot', total: '$300.00', status: 'Cancelled', date: '2025-12-05' },
  { id: '#BKG-006', customer: 'Ethan Brooks', item: 'Event Coverage', total: '$800.00', status: 'Processing', date: '2025-12-06' },
  { id: '#BKG-007', customer: 'Sophia Reed', item: 'Product Photography', total: '$450.00', status: 'Delivered', date: '2025-12-07' },
]

export default function OrderManagement() {
  const { fetchOrders, orders, loading, error } = useOrderStore()

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const displayOrders = orders.length ? orders : MOCK_ORDERS

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-slate-100 text-2xl font-bold">Booking Management</h1>
          <p className="text-slate-500 text-sm mt-1">
            {loading ? 'Loading bookings…' : `${displayOrders.length} booking${displayOrders.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs font-medium">Live</span>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm"
        >
          <Calendar size={16} className="shrink-0" />
          {error} Showing sample data.
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <OrderTable orders={displayOrders} />
      )}
    </div>
  )
}
