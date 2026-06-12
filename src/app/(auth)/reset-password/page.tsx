'use client'

// Supabase → Authentication → Email Templates → "Reset password"
// Set subject: "Peretik - Нууц үг сэргээх"
// Set body HTML:
/*
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#000000;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="500" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;letter-spacing:8px;font-weight:300;">PERETIK</h1>
              <div style="width:50px;height:2px;background:#CA8A04;margin:12px auto;"></div>
            </td>
          </tr>
          <tr>
            <td style="background:#0D0D0D;border-radius:8px;padding:40px;text-align:center;">
              <h2 style="color:#ffffff;font-size:20px;font-weight:400;margin:0 0 16px;">Нууц үг сэргээх</h2>
              <p style="color:#71717A;font-size:14px;margin:0 0 28px;">Доорх товчийг дарж нууц үгээ шинэчлэнэ үү.</p>
              <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#CA8A04;color:#000000;font-size:14px;font-weight:700;padding:14px 32px;border-radius:6px;text-decoration:none;letter-spacing:1px;">НУУЦ ҮГ СЭРГЭЭХ</a>
              <p style="color:#71717A;font-size:13px;margin:24px 0 0;">Энэ холбоос 1 цагийн дотор хүчинтэй.</p>
              <p style="color:#3f3f46;font-size:12px;margin:12px 0 0;">Хэрэв та хүсээгүй бол үл тоомсорлоно уу.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:24px 0;">
              <p style="color:#3f3f46;font-size:12px;margin:0;">© 2026 Peretik. Бүх эрх хуулиар хамгаалагдсан.</p>
              <a href="https://peretik.site" style="color:#CA8A04;font-size:12px;text-decoration:none;">peretik.site</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
*/

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

const schema = z.object({
  password: z.string().min(8, 'Нууц үг хамгийн багадаа 8 тэмдэгт байна'),
  confirmPassword: z.string().min(1, 'Нууц үг давтана уу'),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Нууц үг таарахгүй байна',
  path: ['confirmPassword'],
})
type FormData = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const router = useRouter()
  const [sessionReady, setSessionReady] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then((result) => {
      setSessionReady(!!result.data.session)
    })
  }, [])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setServerError('')
    const supabase = createClient()

    const { error } = await supabase.auth.updateUser({ password: data.password })

    if (error) {
      setServerError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => router.push('/'), 2000)
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (sessionReady === null) {
    return (
      <div className="w-full max-w-sm mx-auto text-center">
        <p className="text-zinc-500 text-sm">...</p>
      </div>
    )
  }

  // ── Invalid / expired link ─────────────────────────────────────────────────
  if (!sessionReady) {
    return (
      <div className="w-full max-w-sm mx-auto text-center animate-in fade-in duration-300">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 mb-5">
          <span className="text-red-400 text-2xl">✕</span>
        </div>
        <h1 className="font-heading text-2xl font-bold text-white mb-3">Холбоос хүчингүй болсон байна</h1>
        <p className="text-sm text-zinc-500 mb-6">Холбоос хугацаа дууссан эсвэл аль хэдийн ашигласан байна.</p>
        <Link
          href="/forgot-password"
          className="inline-block text-sm bg-[#CA8A04] hover:bg-[#D97706] text-black font-semibold px-6 py-2.5 rounded-md transition-colors"
        >
          Дахин илгээх
        </Link>
      </div>
    )
  }

  // ── Success ────────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="w-full max-w-sm mx-auto text-center animate-in fade-in duration-300">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#CA8A04]/10 border border-[#CA8A04]/20 mb-5">
          <CheckCircle className="w-7 h-7 text-[#CA8A04]" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-white mb-3">Нууц үг амжилттай солигдлоо!</h1>
        <p className="text-sm text-zinc-500">Нүүр хуудас руу шилжиж байна...</p>
      </div>
    )
  }

  // ── Reset form ─────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-sm mx-auto animate-in fade-in duration-300">
      <div className="text-center mb-8">
        <h1 className="font-heading text-4xl font-bold text-white mb-2">Шинэ нууц үг</h1>
        <p className="text-sm text-zinc-500">Тохируулах</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label className="text-xs text-zinc-500 uppercase tracking-widest">Шинэ нууц үг</Label>
          <div className="relative mt-1.5">
            <Input
              {...register('password')}
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              className="bg-[#0D0D0D] border-white/10 text-white focus:border-[#CA8A04]/50 pr-10"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <Label className="text-xs text-zinc-500 uppercase tracking-widest">Нууц үг давтах</Label>
          <div className="relative mt-1.5">
            <Input
              {...register('confirmPassword')}
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              className="bg-[#0D0D0D] border-white/10 text-white focus:border-[#CA8A04]/50 pr-10"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowConfirm(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-xs text-red-400 mt-1">{errors.confirmPassword.message}</p>}
        </div>

        {serverError && <p className="text-xs text-red-400">{serverError}</p>}

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-[#CA8A04] hover:bg-[#D97706] text-black font-semibold tracking-wide disabled:opacity-50"
        >
          {loading ? '...' : 'Хадгалах'}
        </Button>
      </form>
    </div>
  )
}
