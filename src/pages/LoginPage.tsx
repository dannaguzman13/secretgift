import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthForm } from '../components/auth/AuthForm'
import { signIn } from '../services/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  async function handleLogin({ email, password }: { email: string; password: string }) {
    await signIn(email, password)
    navigate(redirectTo, { replace: true })
  }

  return (
    <div className="mx-auto mt-16 w-full max-w-sm px-4">
      <h1 className="mb-6 text-center font-display text-3xl text-navy-900">Iniciar sesión</h1>
      <div className="card">
        <AuthForm mode="login" onSubmit={handleLogin} />
      </div>
      <p className="mt-4 text-center text-sm text-navy-600">
        ¿No tienes cuenta?{' '}
        <Link
          to={`/signup${redirectTo !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
          className="font-bold text-sky-600 hover:text-sky-700"
        >
          Regístrate
        </Link>
      </p>
    </div>
  )
}
