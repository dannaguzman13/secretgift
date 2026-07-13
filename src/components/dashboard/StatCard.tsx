export function StatCard({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="card flex flex-col items-center gap-1 py-3 text-center">
      <span className="text-xs font-bold tracking-wide text-navy-500 uppercase">
        {emoji} {label}
      </span>
      <span className="font-display text-lg text-navy-900">{value}</span>
    </div>
  )
}
