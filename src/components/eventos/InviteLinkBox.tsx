import { useState } from 'react'

export function InviteLinkBox({ label, url }: { label: string; url: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-bold tracking-wide text-navy-600 uppercase">{label}</label>
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={url}
          className="w-full rounded-md border-2 border-pale-sky-300 bg-pale-sky-100 px-3 py-2 text-sm text-navy-700"
        />
        <button type="button" onClick={handleCopy} className="btn-secondary shrink-0 px-4 py-2 text-sm">
          {copied ? '¡Copiado!' : 'Copiar'}
        </button>
      </div>
    </div>
  )
}
