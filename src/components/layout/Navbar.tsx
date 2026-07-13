import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { signOut } from '../../services/auth'
import { obtenerMiPerfil } from '../../services/perfil'
import { EditarPerfilModal } from '../perfil/EditarPerfilModal'

export function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [perfilAbierto, setPerfilAbierto] = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [perfil, setPerfil] = useState<{ nombre: string; apodo: string | null } | null>(null)

  useEffect(() => {
    if (!user) {
      setPerfil(null)
      return
    }
    let cancelado = false
    obtenerMiPerfil(user.id)
      .then((u) => {
        if (!cancelado) setPerfil({ nombre: u.nombre, apodo: u.apodo })
      })
      .catch(() => {})
    return () => {
      cancelado = true
    }
  }, [user])

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  const nombreMostrado = perfil?.apodo || perfil?.nombre || user?.email

  return (
    <nav className="relative flex items-center justify-between bg-navy-900 px-4 py-3 sm:px-6">
      <Link to={user ? '/dashboard' : '/'} className="font-display text-lg text-white">
        🎁 SecretGift
      </Link>
      {user && (
        <div className="text-sm">
          <button
            onClick={() => setMenuAbierto((v) => !v)}
            className="rounded-full px-3 py-1.5 font-semibold text-pale-sky-100 hover:bg-navy-800"
          >
            {nombreMostrado}
          </button>
          {menuAbierto && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuAbierto(false)} />
              <div className="card absolute right-4 top-full z-50 mt-2 flex w-44 flex-col gap-1 p-1">
                <button
                  onClick={() => {
                    setPerfilAbierto(true)
                    setMenuAbierto(false)
                  }}
                  className="rounded-md px-3 py-2 text-left text-sm text-navy-900 hover:bg-pale-sky-100"
                >
                  👤 Editar Perfil
                </button>
                <button
                  onClick={handleLogout}
                  className="rounded-md px-3 py-2 text-left text-sm text-navy-900 hover:bg-pale-sky-100"
                >
                  Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
      )}
      {perfilAbierto && user && (
        <EditarPerfilModal
          usuarioId={user.id}
          onClose={() => setPerfilAbierto(false)}
          onGuardado={setPerfil}
        />
      )}
    </nav>
  )
}
