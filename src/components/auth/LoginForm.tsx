'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { useLangStore } from '@/lib/store/langStore'
import { toast } from 'sonner'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})
type FormData = z.infer<typeof schema>

export function LoginForm() {
  const { t } = useLangStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/'
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const supabase = createClient()
    const { error, data: authData } = await supabase.auth.signInWithPassword(data)
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    // Check if admin — redirect to /admin
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', authData.user.id)
      .single()
    const dest = profile?.role === 'admin' ? '/admin' : (redirectTo || '/')
    router.push(dest)
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-8">
        <h1 className="font-heading text-4xl font-bold text-white mb-2">{t.auth.login_title}</h1>
        <p className="text-sm text-zinc-500">PERETIK</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <div className="flex justify-between items-center">
            <Label className="text-xs text-zinc-500 uppercase tracking-widest">{t.auth.password}</Label>
            <Link href="/forgot-password" className="text-xs text-zinc-500 hover:text-[#CA8A04] transition-colors">
              {t.auth.forgot_password}
            </Link>
          </div>
          <div className="relative mt-1.5">
            <Input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className="bg-[#0D0D0D] border-white/10 text-white focus:border-[#CA8A04]/50 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-[#CA8A04] hover:bg-[#D97706] text-black font-semibold tracking-wide disabled:opacity-50"
        >
          {loading ? '...' : t.auth.login}
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-500 mt-6">
        {t.auth.no_account}{' '}
        <Link href="/register" className="text-[#CA8A04] hover:underline">
          {t.auth.register}
        </Link>
      </p>
    </div>
  )
}
