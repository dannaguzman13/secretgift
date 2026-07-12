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
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={url}
          className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800"
        >
          {copied ? '¡Copiado!' : 'Copiar'}
        </button>
      </div>
    </div>
  )
}
