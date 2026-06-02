'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function PromoteUserForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    const supabase = createClient()

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (!user) {
      toast.error('Хэрэглэгч олдсонгүй')
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', user.id)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success(`${email} админ болгогдлоо`)
      setEmail('')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handlePromote} className="p-5 bg-[#0D0D0D] rounded border border-white/[0.06] space-y-4">
      <h3 className="font-heading text-base font-semibold text-zinc-300 uppercase tracking-widest">
        Админ нэмэх
      </h3>
      <div>
        <Label className="text-xs text-zinc-500 uppercase tracking-widest">И-мэйл</Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          className="mt-1.5 bg-black border-white/10 text-white focus:border-[#CA8A04]/50"
        />
      </div>
      <Button
        type="submit"
        disabled={loading || !email}
        className="w-full bg-[#CA8A04] hover:bg-[#D97706] text-black font-semibold disabled:opacity-50"
      >
        {loading ? '...' : 'Админ болгох'}
      </Button>
      <p className="text-xs text-zinc-600">
        Хэрэглэгч урьдчилан бүртгүүлсэн байх шаардлагатай.
      </p>
    </form>
  )
}
