import { useState, useEffect } from 'react'
import { DollarSign, Calendar, Images, TrendingUp } from 'lucide-react'
import StatCard from '../components/dashboard/StatCard'
import SalesChart from '../components/dashboard/SalesChart'
// import RecentOrders from '../components/dashboard/RecentOrders'

const BASE_STATS = [
  {
    id: 'stat-revenue',
    title: 'Total Revenue',
    value: '0',
    icon: DollarSign,
    trend: 'up',
    trendValue: 12.4,
    gradient: 'bg-gradient-to-br from-purple-500 to-purple-700',
  },
  {
    id: 'stat-orders',
    title: 'Total Bookings',
    value: '0',
    icon: Calendar,
    trend: 'up',
    trendValue: 8.1,
    gradient: 'bg-gradient-to-br from-pink-500 to-pink-700',
  },
  {
    id: 'stat-images',
    title: 'Portfolio Images',
    value: '…',
    icon: Images,
    trend: 'up',
    trendValue: 3.5,
    gradient: 'bg-gradient-to-br from-violet-500 to-indigo-600',
  },
  {
    id: 'stat-growth',
    title: 'Monthly Growth',
    value: '0%',
    icon: TrendingUp,
    trend: 'up',
    trendValue: 4.2,
    gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600',
  },
]

export default function Dashboard() {
  const [stats, setStats] = useState(BASE_STATS)

  useEffect(() => {
    fetch('http://localhost:3000/gallery')
      .then((res) => res.json())
      .then((data) => {
        const count =
          data?.pagination?.total ??
          (data?.data
            ? Object.values(data.data).reduce(
              (acc, subCats) =>
                acc +
                Object.values(subCats).reduce((a, imgs) => a + (Array.isArray(imgs) ? imgs.length : 0), 0),
              0
            )
            : Array.isArray(data)
              ? data.length
              : 0)
        setStats((prev) =>
          prev.map((s) =>
            s.id === 'stat-images' ? { ...s, value: String(count) } : s
          )
        )
      })
      .catch(() => {
        setStats((prev) =>
          prev.map((s) =>
            s.id === 'stat-images' ? { ...s, value: 'N/A' } : s
          )
        )
      })
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-slate-100 text-2xl font-bold">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back, Admin. Here&apos;s your overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.id} {...stat} />
        ))}
      </div>

      <SalesChart />

      {/* <RecentOrders /> */}
    </div>
  )
}
