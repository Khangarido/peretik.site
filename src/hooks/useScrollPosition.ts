'use client'

import { useEffect, useState } from 'react'

/**
 * Returns the current window.scrollY value, updated on every scroll event.
 * Safe to use in SSR — returns 0 until mounted.
 */
export function useScrollPosition(): number {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    onScroll() // sync immediately
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return scrollY
}
