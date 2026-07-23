import Badge from '../ui/Badge'

const recentOrders = [
  { id: '#ORD-001', customer: 'Emma Wilson', item: 'Chocolate Fudge Cake', total: '$42.00', status: 'Delivered', date: '2025-12-01' },
  { id: '#ORD-002', customer: 'James Carter', item: 'Strawberry Dream', total: '$38.00', status: 'Processing', date: '2025-12-02' },
  { id: '#ORD-003', customer: 'Lily Chen', item: 'Red Velvet Layer', total: '$55.00', status: 'Pending', date: '2025-12-03' },
  { id: '#ORD-004', customer: 'Noah Adams', item: 'Lemon Drizzle', total: '$29.00', status: 'Delivered', date: '2025-12-04' },
  { id: '#ORD-005', customer: 'Olivia Hart', item: 'Vanilla Cloud', total: '$48.00', status: 'Cancelled', date: '2025-12-05' },
]

const statusVariant = {
  Delivered: 'success',
  Processing: 'info',
  Pending: 'warning',
  Cancelled: 'danger',
}

export default function RecentOrders() {
  return (
    <div className="rounded-2xl bg-[#141420] border border-white/5 overflow-hidden">
      <div className="px-5 md:px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <h2 className="text-slate-100 text-base font-semibold">Recent Orders</h2>
        <span className="text-xs text-slate-500">Last 5 orders</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full" aria-label="Recent orders">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-xs text-slate-500 font-medium px-5 md:px-6 py-3 uppercase tracking-wider">Order</th>
              <th className="text-left text-xs text-slate-500 font-medium px-4 py-3 uppercase tracking-wider">Customer</th>
              <th className="text-left text-xs text-slate-500 font-medium px-4 py-3 uppercase tracking-wider hidden md:table-cell">Item</th>
              <th className="text-left text-xs text-slate-500 font-medium px-4 py-3 uppercase tracking-wider">Total</th>
              <th className="text-left text-xs text-slate-500 font-medium px-4 py-3 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order, i) => (
              <tr
                key={order.id}
                className={`transition-colors hover:bg-white/3 ${i !== recentOrders.length - 1 ? 'border-b border-white/5' : ''}`}
              >
                <td className="px-5 md:px-6 py-3.5">
                  <span className="text-purple-400 text-sm font-medium">{order.id}</span>
                </td>
                <td className="px-4 py-3.5 text-slate-300 text-sm">{order.customer}</td>
                <td className="px-4 py-3.5 text-slate-400 text-sm hidden md:table-cell">{order.item}</td>
                <td className="px-4 py-3.5 text-slate-200 text-sm font-medium">{order.total}</td>
                <td className="px-4 py-3.5">
                  <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
