'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Shield, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatDate, cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { User } from '@/types'

interface Props {
  admins: User[]
  currentUserId: string
}

export function AdminsClient({ admins, currentUserId }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [email, setEmail] = useState('')
  const [promoting, setPromoting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const promoteUser = async () => {
    if (!email.trim()) return
    setPromoting(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setMessage({ type: 'error', text: data.error ?? 'Хэрэглэгч олдсонгүй' })
      } else {
        setMessage({ type: 'success', text: 'Хэрэглэгч admin боллоо' })
        setEmail('')
        startTransition(() => router.refresh())
      }
    } catch {
      setMessage({ type: 'error', text: 'Алдаа гарлаа' })
    }
    setPromoting(false)
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Promote form */}
      <div className="p-6 bg-[#0D0D0D] rounded border border-white/[0.06] space-y-4">
        <h2 className="text-[10px] text-zinc-600 uppercase tracking-[0.3em]">Admin эрх олгох</h2>
        <div>
          <Label className="text-[10px] text-zinc-500 uppercase tracking-widest">И-мэйл хаяг</Label>
          <div className="flex gap-3 mt-1.5">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && promoteUser()}
              placeholder="user@example.com"
              className="flex-1 bg-black border-white/10 text-white focus:border-[#CA8A04]/40"
            />
            <Button
              onClick={promoteUser}
              disabled={promoting || !email.trim()}
              className="bg-[#CA8A04] hover:bg-[#D97706] text-black font-bold disabled:opacity-50"
            >
              <UserPlus size={14} className="mr-2" />
              {promoting ? '...' : 'Admin эрх олгох'}
            </Button>
          </div>
          {message && (
            <p className={cn(
              'text-sm mt-2',
              message.type === 'success' ? 'text-green-400' : 'text-red-400'
            )}>
              {message.text}
            </p>
          )}
        </div>
      </div>

      {/* Admins list */}
      <div className="space-y-3">
        <h2 className="text-[10px] text-zinc-600 uppercase tracking-[0.3em]">
          Одоогийн admin-ууд ({admins.length})
        </h2>
        {admins.map((admin) => (
          <div
            key={admin.id}
            className={cn(
              'flex items-center gap-4 p-4 bg-[#0D0D0D] rounded border transition-colors',
              admin.id === currentUserId
                ? 'border-[#CA8A04]/20 bg-[#CA8A04]/5'
                : 'border-white/[0.06]'
            )}
          >
            <div className="w-10 h-10 rounded-full bg-[#111] border border-white/10 overflow-hidden flex items-center justify-center font-heading text-base text-zinc-600 flex-shrink-0">
              {admin.avatar_url ? (
                <Image src={admin.avatar_url} alt="" width={40} height={40} className="object-cover" />
              ) : (
                (admin.full_name ?? admin.email)[0]?.toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm text-white font-medium">{admin.full_name ?? '—'}</p>
                {admin.id === currentUserId && (
                  <span className="text-[9px] bg-[#CA8A04]/20 text-[#CA8A04] border border-[#CA8A04]/30 rounded px-1.5 py-0.5 font-medium tracking-wide">
                    ТА
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-600 truncate">{admin.email}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Shield size={14} className="text-[#CA8A04]" />
              <p className="text-[10px] text-zinc-600">{formatDate(admin.created_at ?? '', 'mn')}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
