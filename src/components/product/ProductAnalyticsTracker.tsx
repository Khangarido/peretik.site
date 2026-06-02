'use client'

import { useEffect, useRef } from 'react'
import { useAnalytics } from '@/lib/hooks/useAnalytics'

interface Props {
  productId: string
  userId?: string
}

export function ProductAnalyticsTracker({ productId, userId }: Props) {
  const { trackProductView } = useAnalytics()
  const startRef = useRef(Date.now())

  useEffect(() => {
    trackProductView(productId, userId)

    return () => {
      const duration = Math.floor((Date.now() - startRef.current) / 1000)
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'product_view_duration',
          product_id: productId,
          user_id: userId,
          duration_seconds: duration,
        }),
        keepalive: true,
      }).catch(() => {})
    }
  }, [productId, userId, trackProductView])

  return null
}
