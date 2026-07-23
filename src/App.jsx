import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import ImageManagement from './pages/ImageManagement'
import ImageUpload from './pages/ImageUpload'
import OrderManagement from './pages/OrderManagement'
import ReviewManagement from './pages/ReviewManagement'

export default function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#1a1a2e',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }
      }} />
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/images" element={<ImageManagement />} />
          <Route path="/upload" element={<ImageUpload />} />
          {/* <Route path="/orders" element={<OrderManagement />} /> */}
          {/* <Route path="/reviews" element={<ReviewManagement />} /> */}
        </Route>
      </Routes>
    </>
  )
}
