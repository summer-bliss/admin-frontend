import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const data = [
  { month: 'Jan', revenue: 4200, orders: 38 },
  { month: 'Feb', revenue: 5800, orders: 52 },
  { month: 'Mar', revenue: 4900, orders: 44 },
  { month: 'Apr', revenue: 7100, orders: 63 },
  { month: 'May', revenue: 6400, orders: 57 },
  { month: 'Jun', revenue: 8900, orders: 79 },
  { month: 'Jul', revenue: 7600, orders: 68 },
  { month: 'Aug', revenue: 9400, orders: 84 },
  { month: 'Sep', revenue: 8200, orders: 73 },
  { month: 'Oct', revenue: 10500, orders: 94 },
  { month: 'Nov', revenue: 12300, orders: 110 },
  { month: 'Dec', revenue: 14800, orders: 132 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-3 shadow-xl">
        <p className="text-slate-300 text-xs font-semibold mb-2">{label}</p>
        {payload.map((item) => (
          <p key={item.dataKey} className="text-xs" style={{ color: item.color }}>
            {item.name}: {item.dataKey === 'revenue' ? `$${item.value.toLocaleString()}` : item.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function SalesChart() {
  return (
    <div className="rounded-2xl bg-[#141420] border border-white/5 p-5 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-slate-100 text-base font-semibold">Sales Overview</h2>
          <p className="text-slate-500 text-xs mt-0.5">Revenue & orders over the last 12 months</p>
        </div>
        <span className="text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full font-medium">
          2025
        </span>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ec4899" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
          <XAxis
            dataKey="month"
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>
            )}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue ($)"
            stroke="#a855f7"
            strokeWidth={2}
            fill="url(#colorRevenue)"
            dot={false}
            activeDot={{ r: 5, fill: '#a855f7', stroke: '#0f0f14', strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="orders"
            name="Orders"
            stroke="#ec4899"
            strokeWidth={2}
            fill="url(#colorOrders)"
            dot={false}
            activeDot={{ r: 5, fill: '#ec4899', stroke: '#0f0f14', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
