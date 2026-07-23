import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Images, UploadCloud, ShoppingBag, Camera, Menu, X, Star } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/images', icon: Images, label: 'Portfolio Management' },
  { to: '/upload', icon: UploadCloud, label: 'Upload Home Slider Images' },
  // { to: '/orders', icon: ShoppingBag, label: 'Booking Management' },
  // { to: '/reviews', icon: Star, label: 'Client Reviews' },
]

export default function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        id="sidebar-toggle"
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-purple-600 text-white shadow-lg"
        aria-label="Toggle sidebar"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-[#0d0d1a] border-r border-white/5 flex flex-col z-40 transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Camera size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-base leading-none">PhotoAdmin</p>
            <p className="text-slate-500 text-xs mt-0.5">Management Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1" aria-label="Main navigation">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              id={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow shadow-purple-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    className={isActive ? 'text-purple-400' : 'text-slate-500 group-hover:text-slate-300'}
                  />
                  {label}
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-5 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
              A
            </div>
            <div>
              <p className="text-slate-200 text-xs font-medium">Admin</p>
              {/* <p className="text-slate-500 text-xs">admin@cakesite.com</p> */}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
