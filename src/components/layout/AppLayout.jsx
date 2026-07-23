import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-[#0f0f14]">
      <Sidebar />
      <main className="flex-1 lg:ml-64 min-h-screen overflow-y-auto">
        <div className="p-6 md:p-8 max-w-screen-2xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
