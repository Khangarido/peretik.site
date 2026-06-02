'use client'

import { useEffect, useState } from 'react'

const SESSION_KEY = 'peretik_session'

function readOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''
  const existing = localStorage.getItem(SESSION_KEY)
  if (existing) return existing
  const id = crypto.randomUUID()
  localStorage.setItem(SESSION_KEY, id)
  return id
}

/**
 * Returns a stable session_id string persisted in localStorage.
 * Generates a new UUID if none exists.
 */
export function useSessionId(): string {
  const [sessionId, setSessionId] = useState('')

  useEffect(() => {
    setSessionId(readOrCreateSessionId())
  }, [])

  return sessionId
}

/** Imperative version — use inside event handlers / effects where a hook isn't possible. */
export function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  return readOrCreateSessionId()
}
