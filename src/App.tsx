import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Navbar } from './components/layout/Navbar'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { DashboardPage } from './pages/DashboardPage'
import { CreateEventPage } from './pages/CreateEventPage'
import { JoinBuyerPage } from './pages/JoinBuyerPage'
import { EventDetailPage } from './pages/EventDetailPage'

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-pale-sky-50">
      <Navbar />
      {children}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/join/:codigo" element={<JoinBuyerPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/crear-evento"
            element={
              <ProtectedRoute>
                <CreateEventPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/eventos/:id"
            element={
              <ProtectedRoute>
                <EventDetailPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}
