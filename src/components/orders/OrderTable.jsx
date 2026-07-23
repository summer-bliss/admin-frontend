import Badge from '../ui/Badge'

const statusVariant = {
  Delivered: 'success',
  Processing: 'info',
  Pending: 'warning',
  Cancelled: 'danger',
  Refunded: 'purple',
}

export default function OrderTable({ orders }) {
  if (!orders || !orders.length) {
    return (
      <div className="flex flex-col items-center justify-center h-56 rounded-2xl bg-[#141420] border border-white/5">
        <p className="text-slate-400 text-sm font-medium">No orders found</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-[#141420] border border-white/5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full" aria-label="Orders table">
          <thead>
            <tr className="border-b border-white/5 bg-white/2">
              <th className="text-left text-xs text-slate-500 font-medium px-5 py-3 uppercase tracking-wider">Order ID</th>
              <th className="text-left text-xs text-slate-500 font-medium px-4 py-3 uppercase tracking-wider">Customer</th>
              <th className="text-left text-xs text-slate-500 font-medium px-4 py-3 uppercase tracking-wider hidden md:table-cell">Item</th>
              <th className="text-left text-xs text-slate-500 font-medium px-4 py-3 uppercase tracking-wider">Total</th>
              <th className="text-left text-xs text-slate-500 font-medium px-4 py-3 uppercase tracking-wider">Status</th>
              <th className="text-left text-xs text-slate-500 font-medium px-4 py-3 uppercase tracking-wider hidden lg:table-cell">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, i) => (
              <tr
                key={order.id || i}
                className={`transition-colors hover:bg-white/3 ${i !== orders.length - 1 ? 'border-b border-white/5' : ''}`}
              >
                <td className="px-5 py-3.5">
                  <span className="text-purple-400 text-sm font-medium">{order.id}</span>
                </td>
                <td className="px-4 py-3.5 text-slate-300 text-sm">{order.customer}</td>
                <td className="px-4 py-3.5 text-slate-400 text-sm hidden md:table-cell">{order.item}</td>
                <td className="px-4 py-3.5 text-slate-200 text-sm font-medium">{order.total}</td>
                <td className="px-4 py-3.5">
                  <Badge variant={statusVariant[order.status] || 'default'}>{order.status}</Badge>
                </td>
                <td className="px-4 py-3.5 text-slate-500 text-xs hidden lg:table-cell">{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
