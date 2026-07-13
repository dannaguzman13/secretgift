import { Link, useNavigate } from 'react-router-dom'

const problems = [
  {
    emoji: '🤔',
    title: 'Desconfianza',
    text: 'El sorteo manual genera dudas. ¿Es justo? ¿Se hizo bien?',
  },
  {
    emoji: '📱',
    title: 'Caos en WhatsApp',
    text: 'Las reglas se pierden. Nadie recuerda fechas. Información dispersa.',
  },
  {
    emoji: '👤',
    title: 'Una sola persona lo maneja',
    text: 'El administrador carga con todo. Sorpresas, recordatorios, seguimiento.',
  },
  {
    emoji: '🚫',
    title: 'Sin privacidad',
    text: 'Todos ven a quién le toca. Se pierde la sorpresa.',
  },
  {
    emoji: '⏰',
    title: 'Se olvidan las fechas',
    text: 'Alguien siempre olvida comprar. Faltan regalos en la entrega.',
  },
  {
    emoji: '❌',
    title: 'Cambios de último momento',
    text: 'Alguien se va. Otro llega. ¿Cómo reajusta el sorteo?',
  },
]

const steps = [
  'Crear grupo',
  'Invitar participantes',
  'Definir reglas',
  'Sorteo automático',
  'Comprar regalo',
  'Confirmar compra',
  'Entregar y celebrar',
]

const useCases = [
  { emoji: '👥', title: 'Amigos', items: ['🎄 Navidad', '🎂 Cumpleaños', '✈️ Viajes', '🎓 Fin de semestre'], featured: true },
  { emoji: '🏢', title: 'Empresas', items: ['🎉 Fin de año', '🎯 Celebración de metas', '👨‍💼 Equipos remotos', '👋 Despedidas'], featured: true },
  { emoji: '👨‍👩‍👧‍👦', title: 'Familias', items: ['🎄 Navidad', '🏡 Reuniones', '🎂 Cumpleaños'], featured: false },
  { emoji: '🎓', title: 'Universidades', items: ['📚 Semilleros', '🤝 Grupos estudiantiles', '🔬 Laboratorios'], featured: false },
  { emoji: '🏫', title: 'Colegios', items: ['👨‍🎓 Cursos', '👨‍🏫 Profesores', '📸 Promociones'], featured: false },
  { emoji: '⛪', title: 'Comunidades', items: ['⚽ Clubes deportivos', '📖 Clubs de lectura', '🙏 Iglesias'], featured: false },
]

const benefits = [
  { emoji: '🔒', title: 'Privacidad total', text: 'Solo ves tu grupo. Nadie conoce a quién le toca hasta que revela su regalo.' },
  { emoji: '✨', title: 'Sorteo justo', text: 'Automático. Sin manipulación. Respeta todas las reglas que defines.' },
  { emoji: '📊', title: 'Seguimiento en tiempo real', text: 'Todos ven quién compró. Recordatorios antes de la fecha límite.' },
  { emoji: '⚡', title: 'Setup en segundos', text: 'Crear un grupo toma menos de un minuto. Invita por enlace o email.' },
  { emoji: '📱', title: 'Funciona en celular', text: 'Diseñado para mobile. Usa desde cualquier lugar, en cualquier momento.' },
  { emoji: '♻️', title: 'Reutiliza grupos', text: 'Repite eventos sin crear desde cero. Tu historial en un lugar.' },
]

const trust = [
  {
    title: '🔐 Tu privacidad está protegida',
    items: [
      'Solo ves los grupos donde participas',
      'Nadie accede a tus datos privados',
      'Tu asignación es confidencial hasta que la reveles',
    ],
  },
  {
    title: '⚙️ El sorteo es automático',
    items: ['Sin intervención manual', 'Respeta todas tus reglas', 'Algoritmo transparente'],
  },
  {
    title: '✅ Todo es claro desde el inicio',
    items: ['Reglas definidas antes del sorteo', 'Todos ven el progreso', 'Sin sorpresas desagradables'],
  },
]

const faqs = [
  { q: '¿Es gratis usar SecretGift?', a: 'Sí, completamente gratis. Crea grupos ilimitados sin pagar nada.' },
  {
    q: '¿Necesito crear una cuenta?',
    a: 'Para crear un grupo, sí. Para participar en un grupo creado por otro, solo necesitas hacer clic en el enlace de invitación.',
  },
  {
    q: '¿Quién puede ver a quién le toca comprar?',
    a: 'Solo la persona asignada lo ve. Todos ven el progreso de compras, pero no quién compra para quién.',
  },
  {
    q: '¿Puedo cambiar participantes después de crear el grupo?',
    a: 'Sí, hasta que hagas el sorteo. Después, puedes invitar a más gente, pero no afecta a los asignados.',
  },
  {
    q: '¿Qué pasa si alguien abandona?',
    a: 'Puedes reasignar, crear un nuevo sorteo, o dejar que alguien compre dos regalos. Tú controlas.',
  },
  {
    q: '¿Puedo reutilizar un grupo?',
    a: 'Claro. Copia un grupo anterior o crea uno nuevo con los mismos participantes. Tu historial siempre está disponible.',
  },
  { q: '¿Funciona desde celular?', a: 'Perfectamente. Está optimizado para móvil. Usa desde cualquier dispositivo.' },
  {
    q: '¿Cómo se realiza exactamente el sorteo?',
    a: 'Un algoritmo automático asigna a cada persona un comprador, respetando las exclusiones que defines (ej: no a tu pareja, no a tu jefe).',
  },
]

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="bg-pale-sky-50">
      {/* Header */}
      <header className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-4 bg-navy-900 px-4 py-4 shadow-sm sm:px-6">
        <span className="font-display text-xl text-white">🎁 SecretGift</span>
        <nav className="flex flex-wrap items-center gap-6">
          <a href="#problema" className="text-sm text-pale-sky-100/70 transition hover:text-white">
            Problema
          </a>
          <a href="#solucion" className="text-sm text-pale-sky-100/70 transition hover:text-white">
            Solución
          </a>
          <a href="#casos" className="text-sm text-pale-sky-100/70 transition hover:text-white">
            Casos de uso
          </a>
          <Link to="/login" className="btn-primary text-sm">
            Ingresar
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section id="inicio" className="relative overflow-hidden bg-gradient-to-br from-navy-900 to-navy-800 px-4 py-20 text-white sm:px-6">
        <div className="pointer-events-none absolute -top-1/2 -right-[10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,var(--color-sky-400)_0%,transparent_70%)] opacity-15" />
        <div className="pointer-events-none absolute -bottom-[30%] -left-[5%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,var(--color-coral-400)_0%,transparent_70%)] opacity-10" />
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <h1 className="mb-6 font-display text-4xl leading-tight font-bold sm:text-5xl lg:text-6xl">
              Organiza intercambios de regalos sin estrés
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-pale-sky-100/90">
              Reglas claras, sorteo justo, privacidad garantizada. Todo en un lugar. Crea un grupo en menos de un
              minuto.
            </p>
            <button className="btn-primary text-base" onClick={() => navigate('/signup')}>
              Crear grupo gratis
            </button>
          </div>
          <div className="mx-auto hidden w-full max-w-xs lg:block">
            <div className="card">
              <div className="mb-3 rounded-md bg-pale-sky-100 p-4">
                <div className="mb-2 font-display text-sm font-semibold text-navy-900">Navidad 2024</div>
                <div className="mb-1.5 text-xs text-sky-700">👥 8 participantes</div>
                <div className="mb-1.5 text-xs text-sky-700">🎯 Sorteo realizado</div>
                <div className="text-xs text-sky-700">💳 3 de 8 han comprado</div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="rounded-md bg-success-bg px-3 py-2 text-xs text-success">✓ Ana compró</div>
                <div className="rounded-md bg-success-bg px-3 py-2 text-xs text-success">✓ Carlos compró</div>
                <div className="rounded-md bg-warning-bg px-3 py-2 text-xs text-warning">⏳ Juan espera</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problems */}
      <section id="problema" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="mb-4 font-display text-3xl font-bold text-navy-900 sm:text-4xl">El problema que vives</h2>
        <p className="mb-12 text-lg text-sky-600">
          Organizar intercambios de regalos genera estrés. Nosotros lo hacemos fácil.
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {problems.map((p) => (
            <div key={p.title} className="card border-l-4 border-coral-400">
              <h3 className="mb-3 font-display text-lg text-navy-900">
                {p.emoji} {p.title}
              </h3>
              <p className="text-navy-600">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Solution */}
      <section id="solucion" className="bg-gradient-to-br from-pale-sky-50 to-pale-sky-100/50 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 font-display text-3xl font-bold text-navy-900 sm:text-4xl">
            La solución: 7 pasos simples
          </h2>
          <p className="mb-12 text-lg text-sky-600">De la idea a la celebración en minutos.</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div
                key={step}
                className={
                  i === steps.length - 1
                    ? 'card col-span-2 max-w-[70%] justify-self-center border-2 border-coral-400/30 bg-gradient-to-br from-coral-400/10 to-pale-sky-100/10 text-center font-semibold sm:col-span-3'
                    : 'card relative text-center'
                }
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-coral-400 font-display text-lg font-bold text-white">
                  {i + 1}
                </div>
                <h4 className={i === steps.length - 1 ? 'font-display text-base text-coral-600' : 'font-display text-sm text-navy-900'}>
                  {step}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section id="casos" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="mb-4 font-display text-3xl font-bold text-navy-900 sm:text-4xl">No es solo para Navidad</h2>
        <p className="mb-12 text-lg text-sky-600">Organiza intercambios en cualquier contexto.</p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {useCases.map((uc) => (
            <div
              key={uc.title}
              className={
                uc.featured
                  ? 'card border-t-4 border-coral-400 bg-gradient-to-br from-coral-400/5 to-pale-sky-100/5'
                  : 'card border-t-4 border-sky-400'
              }
            >
              <div className="mb-3 text-4xl">{uc.emoji}</div>
              <h3 className="mb-2 font-display text-lg font-semibold text-navy-900">{uc.title}</h3>
              <ul className="mt-3 space-y-1 text-sm text-sky-600">
                {uc.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gradient-to-br from-pale-sky-50 to-pale-sky-100/50 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 font-display text-3xl font-bold text-navy-900 sm:text-4xl">Por qué SecretGift</h2>
          <p className="mb-12 text-lg text-sky-600">Beneficios que realmente importan.</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b) => (
              <div key={b.title} className="flex gap-5">
                <div className="flex h-12 w-12 min-w-12 items-center justify-center text-3xl">{b.emoji}</div>
                <div>
                  <h3 className="mb-2 font-display text-base font-semibold text-navy-900">{b.title}</h3>
                  <p className="text-sm text-navy-600">{b.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="bg-gradient-to-br from-navy-900 to-navy-800 px-4 py-20 text-white sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 font-display text-3xl font-bold sm:text-4xl">Privacidad y seguridad primero</h2>
          <p className="mb-12 text-lg text-pale-sky-100/90">Respuestas a las preguntas que importan.</p>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {trust.map((t) => (
              <div key={t.title}>
                <h3 className="mb-3 font-display text-lg font-semibold text-coral-100/80">{t.title}</h3>
                <ul className="mt-3 space-y-2">
                  {t.items.map((item) => (
                    <li key={item} className="relative pl-6 text-sm text-pale-sky-100/80">
                      <span className="absolute left-0 font-bold text-coral-100/90">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="mb-4 font-display text-3xl font-bold text-navy-900 sm:text-4xl">Preguntas frecuentes</h2>
        <div className="mx-auto mt-12 max-w-2xl">
          {faqs.map((faq, i) => (
            <div
              key={faq.q}
              className={i < faqs.length - 1 ? 'mb-5 border-b border-pale-sky-200 pb-5' : ''}
            >
              <h3 className="mb-2 font-display text-lg font-semibold text-navy-900">{faq.q}</h3>
              <p className="text-sm leading-relaxed text-navy-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-gradient-to-br from-sky-400 to-pale-sky-100 px-4 py-16 text-center sm:px-6">
        <div className="mx-auto max-w-xl">
          <h2 className="mb-4 font-display text-3xl font-bold text-navy-900 sm:text-4xl">
            Organiza tu próximo intercambio en menos de un minuto
          </h2>
          <p className="mb-8 text-lg text-navy-700">Es gratis. Sin tarjeta de crédito. Sin sorpresas.</p>
          <button className="btn-primary text-base" onClick={() => navigate('/signup')}>
            Crear grupo ahora
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-900 px-4 py-10 text-center text-sm text-pale-sky-100/70 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-3 font-display text-lg text-white">🎁 SecretGift</div>
          <p>La forma más sencilla de organizar intercambios de regalos.</p>
          <div className="mt-5 border-t border-navy-800 pt-5">
            <p>© 2026 SecretGift. Privacidad y seguridad garantizadas.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
