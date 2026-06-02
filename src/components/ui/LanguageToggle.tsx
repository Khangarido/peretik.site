'use client'

import { useLangStore } from '@/lib/store/langStore'
import { cn } from '@/lib/utils'

interface Props {
  className?: string
}

export function LanguageToggle({ className }: Props) {
  const { lang, setLang } = useLangStore()

  return (
    <div
      className={cn(
        'flex items-center text-[11px] font-bold tracking-widest select-none',
        className
      )}
    >
      <button
        onClick={() => setLang('mn')}
        className={cn(
          'px-2 py-1 transition-colors',
          lang === 'mn' ? 'text-white' : 'text-zinc-600 hover:text-zinc-300'
        )}
      >
        MN
      </button>
      <span className="text-zinc-700">|</span>
      <button
        onClick={() => setLang('en')}
        className={cn(
          'px-2 py-1 transition-colors',
          lang === 'en' ? 'text-white' : 'text-zinc-600 hover:text-zinc-300'
        )}
      >
        EN
      </button>
    </div>
  )
}
