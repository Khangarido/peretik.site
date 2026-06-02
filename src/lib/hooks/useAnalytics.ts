'use client'

import { useCallback } from 'react'
import { generateSessionId, getDeviceType } from '@/lib/utils'

let sessionId: string | null = null

function getSessionId() {
  if (typeof window === 'undefined') return ''
  if (!sessionId) {
    sessionId = sessionStorage.getItem('peretik_session') ?? generateSessionId()
    sessionStorage.setItem('peretik_session', sessionId)
  }
  return sessionId
}

export function useAnalytics() {
  const track = useCallback(async (event: string, data: Record<string, unknown>) => {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          session_id: getSessionId(),
          device_type: getDeviceType(),
          ...data,
        }),
      })
    } catch {
      // Non-critical — ignore analytics failures
    }
  }, [])

  const trackProductView = useCallback(
    (productId: string, userId?: string) => {
      track('product_view', { product_id: productId, user_id: userId })
    },
    [track]
  )

  return { track, trackProductView }
}
