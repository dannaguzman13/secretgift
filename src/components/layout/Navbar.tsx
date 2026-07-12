import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { signOut } from '../../services/auth'

export function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
      <Link to="/" className="text-lg font-semibold text-slate-900">
        🎁 SecretGift
      </Link>
      {user && (
        <div className="flex items-center gap-4 text-sm">
          <span className="hidden text-slate-500 sm:inline">{user.email}</span>
          <button
            onClick={handleLogout}
            className="rounded-md px-3 py-1.5 text-slate-600 hover:bg-slate-100"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </nav>
  )
}
