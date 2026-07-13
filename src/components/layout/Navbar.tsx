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
    <nav className="flex items-center justify-between bg-navy-900 px-4 py-3 sm:px-6">
      <Link to="/" className="font-display text-lg text-white">
        🎁 SecretGift
      </Link>
      {user && (
        <div className="flex items-center gap-4 text-sm">
          <span className="hidden text-pale-sky-200 sm:inline">{user.email}</span>
          <button
            onClick={handleLogout}
            className="rounded-full px-3 py-1.5 font-semibold text-pale-sky-100 hover:bg-navy-800"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </nav>
  )
}
