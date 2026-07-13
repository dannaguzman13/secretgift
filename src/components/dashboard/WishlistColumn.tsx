import type { Preferencias } from '../../types/domain'

export function WishlistColumn({ wishlist }: { wishlist: Preferencias | null }) {
  if (!wishlist || wishlist.deseos.length === 0) {
    return <p className="text-sm text-navy-500">Todavía no dejó su lista de deseos.</p>
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {wishlist.deseos.map((deseo, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-navy-900">
          <span className="text-success">✔</span> {deseo}
        </li>
      ))}
      {wishlist.restricciones && (
        <li className="mt-2 text-xs text-navy-500">🚫 {wishlist.restricciones}</li>
      )}
    </ul>
  )
}
