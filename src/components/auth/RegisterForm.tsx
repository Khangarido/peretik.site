'use client'

// In Supabase Dashboard → Authentication → Settings:
// Enable "Confirm email" = ON
// Email OTP expiry = 600 seconds (10 min)

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const schema = z.object({
  first_name: z.string().min(1, 'Нэр оруулна уу'),
  last_name: z.string().min(1, 'Овог оруулна уу'),
  email: z.string().email('И-мэйл хаяг буруу байна'),
  sex: z.enum(['male', 'female', 'other'], { error: 'Хүйс сонгоно уу' }),
  age: z.string().min(1, 'Нас оруулна уу').refine((v) => !isNaN(Number(v)) && Number(v) >= 13 && Number(v) <= 100, 'Нас 13-100 хооронд байх ёстой'),
  password: z.string().min(8, 'Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой'),
  confirm_password: z.string(),
  terms: z.literal(true, { error: 'Үйлчилгээний нөхцөлийг зөвшөөрнө үү' }),
  marketing: z.boolean().optional(),
}).refine((d) => d.password === d.confirm_password, {
  message: 'Нууц үг таарахгүй байна',
  path: ['confirm_password'],
})

type FormData = z.infer<typeof schema>

const OTP_LENGTH = 6
const RESEND_COOLDOWN = 60

export function RegisterForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // OTP step state
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [otpLoading, setOtpLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { marketing: false },
  })

  useEffect(() => {
    return () => { if (cooldownRef.current) clearInterval(cooldownRef.current) }
  }, [])

  const startCooldown = useCallback(() => {
    setResendCooldown(RESEND_COOLDOWN)
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(cooldownRef.current!); return 0 }
        return prev - 1
      })
    }, 1000)
  }, [])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          sex: data.sex,
          age: Number(data.age),
          email_marketing_consent: data.marketing ?? false,
        },
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    setRegisteredEmail(data.email)
    setMarketingConsent(data.marketing ?? false)
    setStep('otp')
    startCooldown()
    setLoading(false)
  }

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[index] = digit
    setOtp(next)
    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    const next = [...otp]
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]
    setOtp(next)
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1)
    otpRefs.current[focusIndex]?.focus()
  }

  const handleVerify = async () => {
    const code = otp.join('')
    if (code.length < OTP_LENGTH) {
      toast.error('6 оронтой кодоо оруулна уу')
      return
    }
    setOtpLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.verifyOtp({
      email: registeredEmail,
      token: code,
      type: 'signup',
    })

    if (error) {
      toast.error(error.message)
      setOtpLoading(false)
      return
    }

    if (marketingConsent) {
      fetch('/api/email/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registeredEmail }),
      }).catch(() => {})
    }

    toast.success('Бүртгэл амжилттай! Тавтай морилно уу!')
    router.push('/')
    router.refresh()
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    const supabase = createClient()
    const { error } = await supabase.auth.resend({ type: 'signup', email: registeredEmail })
    if (error) { toast.error(error.message); return }
    toast.success('Шинэ код илгээлээ')
    startCooldown()
  }

  // ── OTP screen ───────────────────────────────────────────────────────────────
  if (step === 'otp') {
    return (
      <div className="w-full max-w-sm mx-auto animate-in fade-in duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#CA8A04]/10 border border-[#CA8A04]/20 mb-4">
            <Mail className="w-6 h-6 text-[#CA8A04]" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-white mb-2">И-мэйл баталгаажуулах</h1>
          <p className="text-sm text-zinc-500">
            <span className="text-zinc-300">{registeredEmail}</span> хаяг руу 6 оронтой код илгээлээ
          </p>
        </div>

        <div className="flex gap-2 justify-center mb-6">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { otpRefs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(i, e)}
              onPaste={i === 0 ? handleOtpPaste : undefined}
              className="w-11 h-14 text-center text-xl font-bold text-white bg-[#0D0D0D] border border-white/10 rounded-lg focus:outline-none focus:border-[#CA8A04]/60 focus:ring-1 focus:ring-[#CA8A04]/30 transition-colors caret-transparent"
            />
          ))}
        </div>

        <Button
          onClick={handleVerify}
          disabled={otpLoading || otp.join('').length < OTP_LENGTH}
          className="w-full h-11 bg-[#CA8A04] hover:bg-[#D97706] text-black font-semibold tracking-wide disabled:opacity-50 mb-4"
        >
          {otpLoading ? '...' : 'Баталгаажуулах'}
        </Button>

        <div className="text-center mb-4">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="text-sm text-zinc-500 hover:text-[#CA8A04] transition-colors disabled:cursor-not-allowed disabled:text-zinc-600"
          >
            {resendCooldown > 0 ? `Дахин код илгээх (${resendCooldown}с)` : 'Дахин код илгээх'}
          </button>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => { setStep('form'); setOtp(Array(OTP_LENGTH).fill('')) }}
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft size={14} />
            Буцах
          </button>
        </div>
      </div>
    )
  }

  // ── Registration form ────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-sm mx-auto animate-in fade-in duration-300">
      <div className="text-center mb-8">
        <h1 className="font-heading text-4xl font-bold text-white mb-2">Бүртгүүлэх</h1>
        <p className="text-sm text-zinc-500">PERETIK</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* First name + Last name */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-zinc-500 uppercase tracking-widest">Нэр</Label>
            <Input
              {...register('first_name')}
              autoComplete="given-name"
              className="mt-1.5 bg-[#0D0D0D] border-white/10 text-white focus:border-[#CA8A04]/50"
            />
            {errors.first_name && <p className="text-xs text-red-400 mt-1">{errors.first_name.message}</p>}
          </div>
          <div>
            <Label className="text-xs text-zinc-500 uppercase tracking-widest">Овог</Label>
            <Input
              {...register('last_name')}
              autoComplete="family-name"
              className="mt-1.5 bg-[#0D0D0D] border-white/10 text-white focus:border-[#CA8A04]/50"
            />
            {errors.last_name && <p className="text-xs text-red-400 mt-1">{errors.last_name.message}</p>}
          </div>
        </div>

        {/* Email */}
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

        {/* Sex + Age */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-zinc-500 uppercase tracking-widest">Хүйс</Label>
            <select
              {...register('sex')}
              className="mt-1.5 w-full h-10 px-3 rounded-md text-sm bg-[#0D0D0D] border border-white/10 text-white focus:outline-none focus:border-[#CA8A04]/50 transition-colors"
            >
              <option value="" disabled>Сонгох</option>
              <option value="male">Эрэгтэй</option>
              <option value="female">Эмэгтэй</option>
              <option value="other">Бусад</option>
            </select>
            {errors.sex && <p className="text-xs text-red-400 mt-1">{errors.sex.message}</p>}
          </div>
          <div>
            <Label className="text-xs text-zinc-500 uppercase tracking-widest">Нас</Label>
            <Input
              {...register('age')}
              type="number"
              min={13}
              max={100}
              autoComplete="off"
              className="mt-1.5 bg-[#0D0D0D] border-white/10 text-white focus:border-[#CA8A04]/50"
            />
            {errors.age && <p className="text-xs text-red-400 mt-1">{errors.age.message}</p>}
          </div>
        </div>

        {/* Password */}
        <div>
          <Label className="text-xs text-zinc-500 uppercase tracking-widest">Нууц үг</Label>
          <div className="relative mt-1.5">
            <Input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
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

        {/* Confirm password */}
        <div>
          <Label className="text-xs text-zinc-500 uppercase tracking-widest">Нууц үг давтах</Label>
          <div className="relative mt-1.5">
            <Input
              {...register('confirm_password')}
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              className="bg-[#0D0D0D] border-white/10 text-white focus:border-[#CA8A04]/50 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirm_password && <p className="text-xs text-red-400 mt-1">{errors.confirm_password.message}</p>}
        </div>

        {/* Terms checkbox (required) */}
        <div className="flex gap-3 pt-1">
          <input
            {...register('terms')}
            id="terms"
            type="checkbox"
            className="mt-0.5 w-4 h-4 shrink-0 rounded border-white/20 bg-[#0D0D0D] accent-[#CA8A04] cursor-pointer"
          />
          <label htmlFor="terms" className="text-xs text-zinc-400 leading-relaxed cursor-pointer">
            Би <span className="text-[#CA8A04]">peretik.site</span>-н үйлчилгээний нөхцөлийг зөвшөөрч, бүртгүүлэхийг баталгаажуулж байна.
          </label>
        </div>
        {errors.terms && <p className="text-xs text-red-400 -mt-2">{errors.terms.message}</p>}

        {/* Marketing checkbox (optional) */}
        <div className="flex gap-3">
          <input
            {...register('marketing')}
            id="marketing"
            type="checkbox"
            className="mt-0.5 w-4 h-4 shrink-0 rounded border-white/20 bg-[#0D0D0D] accent-[#CA8A04] cursor-pointer"
          />
          <label htmlFor="marketing" className="text-xs text-zinc-400 leading-relaxed cursor-pointer">
            Peretik-н шинэ бүтээгдэхүүн, урамшуулал, мэдэгдлүүдийг и-мэйлээр хүлээн авахыг зөвшөөрч байна.
          </label>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-[#CA8A04] hover:bg-[#D97706] text-black font-semibold tracking-wide disabled:opacity-50 mt-2"
        >
          {loading ? '...' : 'Бүртгүүлэх'}
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-500 mt-6">
        Бүртгэлтэй юу?{' '}
        <Link href="/login" className="text-[#CA8A04] hover:underline">
          Нэвтрэх
        </Link>
      </p>
    </div>
  )
}
