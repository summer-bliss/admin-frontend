import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatCard({ title, value, icon: Icon, trend, trendValue, gradient, id }) {
  const positive = trend === 'up'

  return (
    <div
      id={id}
      className="relative overflow-hidden rounded-2xl bg-[#141420] border border-white/5 p-5 group hover:border-white/10 transition-all duration-300"
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${gradient} shadow-lg`}>
            <Icon size={20} className="text-white" />
          </div>
          {trendValue !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-medium ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
              {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {trendValue}%
            </div>
          )}
        </div>

        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
        <p className="text-slate-100 text-2xl font-bold tracking-tight">{value}</p>
      </div>
    </div>
  )
}
