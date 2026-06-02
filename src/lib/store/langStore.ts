'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { UserLang } from '@/types'
import mn, { type I18nStrings } from '@/lib/i18n/mn'
import en from '@/lib/i18n/en'

interface LangStore {
  lang: UserLang
  /** Current translation strings — always in sync with `lang` */
  t: I18nStrings
  setLang: (lang: UserLang) => void
  toggleLang: () => void
}

export const useLangStore = create<LangStore>()(
  persist(
    (set, get) => ({
      lang: 'mn' as UserLang,
      t: mn as I18nStrings,

      setLang(lang: UserLang) {
        set({ lang, t: lang === 'mn' ? (mn as I18nStrings) : (en as I18nStrings) })
        if (typeof document !== 'undefined') {
          document.documentElement.lang = lang
        }
      },

      toggleLang() {
        get().setLang(get().lang === 'mn' ? 'en' : 'mn')
      },
    }),
    {
      name: 'peretik-lang',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      ),
    }
  )
)
