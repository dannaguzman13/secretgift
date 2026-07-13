import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { signOut } from '../../services/auth'
import { EditarPerfilModal } from '../perfil/EditarPerfilModal'

export function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [perfilAbierto, setPerfilAbierto] = useState(false)

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
          <button
            onClick={() => setPerfilAbierto(true)}
            className="rounded-full px-3 py-1.5 font-semibold text-pale-sky-100 hover:bg-navy-800"
          >
            👤 Editar Perfil
          </button>
          <span className="hidden text-pale-sky-200 sm:inline">{user.email}</span>
          <button
            onClick={handleLogout}
            className="rounded-full px-3 py-1.5 font-semibold text-pale-sky-100 hover:bg-navy-800"
          >
            Cerrar sesión
          </button>
        </div>
      )}
      {perfilAbierto && user && (
        <EditarPerfilModal usuarioId={user.id} onClose={() => setPerfilAbierto(false)} />
      )}
    </nav>
  )
}
