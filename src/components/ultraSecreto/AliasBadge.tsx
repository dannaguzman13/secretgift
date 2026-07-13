export function AliasBadge({ alias }: { alias: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-sm font-bold text-sky-900">
      🕵️ {alias}
    </span>
  )
}
