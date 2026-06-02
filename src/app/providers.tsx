'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, retry: 1 },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: '#0D0D0D',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#ffffff',
          },
        }}
      />
    </QueryClientProvider>
  )
}
