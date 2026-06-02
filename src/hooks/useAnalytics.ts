'use client'

import { useEffect, useRef } from 'react'
import { getSessionId } from './useSessionId'
import { getDeviceType } from '@/lib/utils'

interface Options {
  productId: string
}

function postTrack(payload: Record<string, unknown>) {
  // Use sendBeacon when available (fires reliably on page close)
  const body = JSON.stringify(payload)
  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' })
    navigator.sendBeacon('/api/analytics/track', blob)
  } else {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {})
  }
}

/**
 * Tracks product view duration.
 * - On mount: records start time, sends a 'view' page_event
 * - On unmount OR document visibility hidden: sends duration via sendBeacon
 */
export function useProductAnalytics({ productId }: Options) {
  const startRef = useRef<number>(0)
  const sentRef = useRef(false)

  useEffect(() => {
    if (!productId) return
    startRef.current = Date.now()
    sentRef.current = false

    const sessionId = getSessionId()
    const deviceType = getDeviceType()

    // Fire a 'view' page event on mount
    postTrack({
      event_type: 'view',
      product_id: productId,
      session_id: sessionId,
      device_type: deviceType,
      duration_seconds: 0,
    })

    const flush = () => {
      if (sentRef.current) return
      sentRef.current = true
      const duration = Math.round((Date.now() - startRef.current) / 1000)
      postTrack({
        event_type: 'view',
        product_id: productId,
        session_id: sessionId,
        duration_seconds: duration,
        device_type: deviceType,
      })
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flush()
    }

    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      flush()
    }
  }, [productId])
}
