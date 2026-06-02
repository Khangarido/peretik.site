'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { useLangStore } from '@/lib/store/langStore'
import { toast } from 'sonner'

const schema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: 'Нууц үг таарахгүй байна',
  path: ['confirm_password'],
})
type FormData = z.infer<typeof schema>

export function RegisterForm() {
  const { t, lang } = useLangStore()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.full_name, lang },
      },
    })

    if (error) {
      toast.error(error.message)
    } else {
      // Send welcome email in background
      fetch('/api/email/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, full_name: data.full_name, lang }),
      }).catch(() => {})

      toast.success(
        lang === 'mn'
          ? 'Бүртгэл амжилттай! Тавтай морилно уу!'
          : 'Welcome to Peretik!'
      )
      router.push('/')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-8">
        <h1 className="font-heading text-4xl font-bold text-white mb-2">{t.auth.register_title}</h1>
        <p className="text-sm text-zinc-500">PERETIK</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label className="text-xs text-zinc-500 uppercase tracking-widest">{t.auth.full_name}</Label>
          <Input
            {...register('full_name')}
            autoComplete="name"
            className="mt-1.5 bg-[#0D0D0D] border-white/10 text-white focus:border-[#CA8A04]/50"
          />
          {errors.full_name && <p className="text-xs text-red-400 mt-1">{errors.full_name.message}</p>}
        </div>

        <div>
          <Label className="text-xs text-zinc-500 uppercase tracking-widest">{t.auth.email}</Label>
          <Input
            {...register('email')}
            type="email"
            autoComplete="email"
            className="mt-1.5 bg-[#0D0D0D] border-white/10 text-white focus:border-[#CA8A04]/50"
          />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <Label className="text-xs text-zinc-500 uppercase tracking-widest">{t.auth.password}</Label>
          <Input
            {...register('password')}
            type="password"
            autoComplete="new-password"
            className="mt-1.5 bg-[#0D0D0D] border-white/10 text-white focus:border-[#CA8A04]/50"
          />
          {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <Label className="text-xs text-zinc-500 uppercase tracking-widest">{t.auth.confirm_password}</Label>
          <Input
            {...register('confirm_password')}
            type="password"
            autoComplete="new-password"
            className="mt-1.5 bg-[#0D0D0D] border-white/10 text-white focus:border-[#CA8A04]/50"
          />
          {errors.confirm_password && <p className="text-xs text-red-400 mt-1">{errors.confirm_password.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-[#CA8A04] hover:bg-[#D97706] text-black font-semibold tracking-wide disabled:opacity-50"
        >
          {loading ? '...' : t.auth.register}
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-500 mt-6">
        {t.auth.have_account}{' '}
        <Link href="/login" className="text-[#CA8A04] hover:underline">
          {t.auth.login}
        </Link>
      </p>
    </div>
  )
}
