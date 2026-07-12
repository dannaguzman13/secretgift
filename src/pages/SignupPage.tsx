import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthForm } from '../components/auth/AuthForm'
import { signUp } from '../services/auth'

export function SignupPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'
  const [checkEmail, setCheckEmail] = useState(false)

  async function handleSignup({
    email,
    password,
    nombre,
  }: {
    email: string
    password: string
    nombre?: string
  }) {
    const data = await signUp(email, password, nombre ?? '')
    if (data.session) {
      navigate(redirectTo, { replace: true })
    } else {
      setCheckEmail(true)
    }
  }

  if (checkEmail) {
    return (
      <div className="mx-auto mt-16 w-full max-w-sm px-4 text-center">
        <h1 className="mb-4 text-2xl font-semibold text-slate-900">Revisa tu correo</h1>
        <p className="text-slate-600">
          Te enviamos un enlace de confirmación. Después de confirmar tu cuenta, vuelve a{' '}
          <Link to={`/login${redirectTo !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} className="font-medium text-slate-900 underline">
            iniciar sesión
          </Link>
          .
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto mt-16 w-full max-w-sm px-4">
      <h1 className="mb-6 text-center text-2xl font-semibold text-slate-900">Crear cuenta</h1>
      <AuthForm mode="signup" onSubmit={handleSignup} />
      <p className="mt-4 text-center text-sm text-slate-500">
        ¿Ya tienes cuenta?{' '}
        <Link
          to={`/login${redirectTo !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
          className="font-medium text-slate-900 underline"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
