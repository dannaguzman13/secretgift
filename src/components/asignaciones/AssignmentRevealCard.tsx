import { useState } from 'react'
import { WishlistView } from '../wishlist/WishlistView'

export function AssignmentRevealCard({ eventoId, receptorId }: { eventoId: string; receptorId: string }) {
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="[perspective:1200px]">
      <button
        type="button"
        onClick={() => setRevealed((r) => !r)}
        aria-label="Voltear tarjeta para revelar a quién le regalas"
        className={`relative h-72 w-full cursor-pointer text-left [transform-style:preserve-3d] transition-transform duration-[600ms] ease-bounce ${
          revealed ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* front */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg bg-navy-900 p-6 text-center text-white [backface-visibility:hidden]">
          <span className="text-5xl">🎁</span>
          <p className="font-display text-lg">Toca para ver a quién le regalas</p>
        </div>

        {/* back */}
        <div className="absolute inset-0 flex flex-col overflow-hidden rounded-lg bg-coral-400 p-4 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="card flex-1 overflow-y-auto">
            <h3 className="mb-2 text-xs font-bold tracking-wide text-navy-600 uppercase">
              Ideas de regalo
            </h3>
            <WishlistView eventoId={eventoId} usuarioId={receptorId} />
          </div>
        </div>
      </button>
    </div>
  )
}
