import mn, { type I18nStrings } from './mn'
import en from './en'

const translations: Record<'mn' | 'en', I18nStrings> = { mn, en }

/**
 * Returns the full i18n strings object for the given language.
 *
 * Usage in Server Components:
 *   const t = useTranslation('mn')
 *
 * Usage in Client Components:
 *   const { lang } = useLangStore()
 *   const t = useTranslation(lang)
 */
export function useTranslation(lang: 'mn' | 'en'): I18nStrings {
  return translations[lang] ?? mn
}

export type { I18nStrings }
export { mn, en }
