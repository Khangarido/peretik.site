'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

const schema = z.object({
  email: z.string().email('И-мэйл буруу байна'),
})
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setServerError('')
    const supabase = createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    })

    if (error) {
      setServerError(error.message)
      setLoading(false)
      return
    }

    setSentEmail(data.email)
    setSent(true)
    setLoading(false)
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (sent) {
    return (
      <div className="w-full max-w-sm mx-auto text-center animate-in fade-in duration-300">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#CA8A04]/10 border border-[#CA8A04]/20 mb-6">
          <Mail className="w-7 h-7 text-[#CA8A04]" />
        </div>
        <h1 className="font-heading text-3xl font-bold text-white mb-3">И-мэйл илгээлээ!</h1>
        <p className="text-sm text-zinc-400 leading-relaxed mb-8">
          Та{' '}
          <span className="text-[#CA8A04]">{sentEmail}</span>
          {' '}хаяг руу нууц үг сэргээх холбоос хүлээн авна.
        </p>
        <Link
          href="/login"
          className="text-sm text-zinc-500 hover:text-[#CA8A04] transition-colors"
        >
          ← Нэвтрэх хуудас руу буцах
        </Link>
      </div>
    )
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-sm mx-auto animate-in fade-in duration-300">
      <div className="text-center mb-8">
        <h1 className="font-heading text-4xl font-bold text-white mb-2">Нууц үг сэргээх</h1>
        <p className="text-sm text-zinc-500 leading-relaxed mt-3">
          И-мэйл хаягаа оруулна уу, бид нууц үг сэргээх холбоос илгээнэ.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label className="text-xs text-zinc-500 uppercase tracking-widest">И-мэйл</Label>
          <Input
            {...register('email')}
            type="email"
            autoComplete="email"
            className="mt-1.5 bg-[#0D0D0D] border-white/10 text-white focus:border-[#CA8A04]/50"
          />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
        </div>

        {serverError && (
          <p className="text-xs text-red-400">{serverError}</p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-[#CA8A04] hover:bg-[#D97706] text-black font-semibold tracking-wide disabled:opacity-50"
        >
          {loading ? '...' : 'Илгээх'}
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-500 mt-6">
        <Link href="/login" className="text-[#CA8A04] hover:underline">
          Нэвтрэх
        </Link>
      </p>
    </div>
  )
}
