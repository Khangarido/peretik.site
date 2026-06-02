'use client'

// Supabase Dashboard → Authentication → Settings:
// "Confirm email" = ON, OTP expiry = 600 seconds

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TermsModal } from '@/components/ui/TermsModal'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const schema = z.object({
  first_name: z.string().min(1, 'Нэр оруулна уу'),
  last_name: z.string().min(1, 'Овог оруулна уу'),
  email: z.string().email('И-мэйл буруу байна'),
  phone: z.string().min(8, 'Утасны дугаар оруулна уу').max(8, 'Утасны дугаар 8 оронтой байна').regex(/^[0-9]{8}$/, 'Зөвхөн тоо оруулна уу'),
  sex: z.enum(['male', 'female', 'other'], { error: 'Хүйс сонгоно уу' }),
  age: z.coerce.number({ error: 'Нас оруулна уу' }).min(13, 'Наснаас доош байна').max(100, 'Нас буруу байна'),
  password: z.string().min(8, 'Нууц үг хамгийн багадаа 8 тэмдэгт байна'),
  confirmPassword: z.string().min(1, 'Нууц үг давтана уу'),
  terms: z.literal(true, { error: 'Үйлчилгээний нөхцөлийг зөвшөөрнө үү' }),
  marketing: z.boolean().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Нууц үг таарахгүй байна',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

const OTP_LEN = 6
const COOLDOWN = 60

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [termsModalOpen, setTermsModalOpen] = useState(false)

  // OTP state
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [regEmail, setRegEmail] = useState('')
  const [otp, setOtp] = useState<string[]>(Array(OTP_LEN).fill(''))
  const [otpLoading, setOtpLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  const startCooldown = useCallback(() => {
    setCooldown(COOLDOWN)
    timerRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0 }
        return prev - 1
      })
    }, 1000)
  }, [])

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { marketing: false },
  })

  const termsChecked = watch('terms')

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
          age: data.age,
          phone: data.phone ? `+976${data.phone}` : null,
          email_marketing_consent: data.marketing ?? false,
        },
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    setRegEmail(data.email)
    setStep('otp')
    startCooldown()
    setLoading(false)
  }

  // ── OTP input handlers ───────────────────────────────────────────────────────
  const handleOtpChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[i] = digit
    setOtp(next)
    if (digit && i < OTP_LEN - 1) otpRefs.current[i + 1]?.focus()
  }

  const handleOtpKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus()
  }

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LEN)
    if (!digits) return
    const next = [...otp]
    for (let i = 0; i < digits.length; i++) next[i] = digits[i]
    setOtp(next)
    otpRefs.current[Math.min(digits.length, OTP_LEN - 1)]?.focus()
  }

  const handleVerify = async () => {
    const code = otp.join('')
    if (code.length < OTP_LEN) { toast.error('6 оронтой кодоо оруулна уу'); return }
    setOtpLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.verifyOtp({
      email: regEmail,
      token: code,
      type: 'signup',
    })

    if (error) { toast.error(error.message); setOtpLoading(false); return }

    toast.success('Бүртгэл амжилттай! Тавтай морилно уу!')
    router.push('/')
    router.refresh()
  }

  const handleResend = async () => {
    if (cooldown > 0) return
    const supabase = createClient()
    const { error } = await supabase.auth.resend({ type: 'signup', email: regEmail })
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
          <h1 className="font-heading text-2xl font-bold text-white mb-2">
            И-мэйл рүү баталгаажуулах код илгээлээ
          </h1>
          <p className="text-sm text-zinc-500">
            <span className="text-[#CA8A04]">{regEmail}</span>
          </p>
        </div>

        <div className="flex gap-2 justify-center mb-6">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => { otpRefs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleOtpChange(i, e.target.value)}
              onKeyDown={e => handleOtpKey(i, e)}
              onPaste={i === 0 ? handleOtpPaste : undefined}
              className="w-11 h-14 text-center text-xl font-bold text-white bg-[#0D0D0D] border border-white/10 rounded-lg focus:outline-none focus:border-[#CA8A04]/60 focus:ring-1 focus:ring-[#CA8A04]/30 transition-colors caret-transparent"
            />
          ))}
        </div>

        <Button
          onClick={handleVerify}
          disabled={otpLoading || otp.join('').length < OTP_LEN}
          className="w-full h-11 bg-[#CA8A04] hover:bg-[#D97706] text-black font-semibold tracking-wide disabled:opacity-50 mb-4"
        >
          {otpLoading ? '...' : 'Баталгаажуулах'}
        </Button>

        <div className="text-center mb-4">
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0}
            className="text-sm text-zinc-500 hover:text-[#CA8A04] transition-colors disabled:cursor-not-allowed disabled:text-zinc-600"
          >
            {cooldown > 0 ? `Дахин код илгээх (${cooldown}с)` : 'Дахин код илгээх'}
          </button>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => { setStep('form'); setOtp(Array(OTP_LEN).fill('')) }}
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

        {/* Row 1: Нэр + Овог */}
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

        {/* Row 2: И-мэйл */}
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

        {/* Row: Утасны дугаар (optional) */}
        <div>
          <Label className="text-xs text-zinc-500 uppercase tracking-widest">
            Утасны дугаар <span className="text-red-400">*</span>
          </Label>
          <div className="relative mt-1.5 flex items-center">
            <span className="absolute left-3 text-sm text-zinc-400 select-none pointer-events-none">+976</span>
            <Input
              {...register('phone')}
              type="tel"
              inputMode="numeric"
              maxLength={8}
              placeholder="9900 0000"
              autoComplete="tel"
              className="bg-[#0D0D0D] border-white/10 text-white focus:border-[#CA8A04]/50 pl-14"
            />
          </div>
          {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone.message}</p>}
        </div>

        {/* Row 3: Хүйс + Нас */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-zinc-500 uppercase tracking-widest">Хүйс</Label>
            <select
              {...register('sex')}
              defaultValue=""
              className="mt-1.5 w-full h-10 px-3 rounded-md text-sm bg-[#0D0D0D] border border-white/10 text-white focus:outline-none focus:border-[#CA8A04]/50 transition-colors"
            >
              <option value="" disabled>Сонгоно уу</option>
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

        {/* Row 4: Нууц үг */}
        <div>
          <Label className="text-xs text-zinc-500 uppercase tracking-widest">Нууц үг</Label>
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

        {/* Row 5: Нууц үг давтах */}
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

        {/* Checkbox 1: Terms (required) */}
        <div className="space-y-1 pt-1">
          <div className="flex gap-3">
            <input
              {...register('terms')}
              id="terms"
              type="checkbox"
              className="mt-0.5 w-4 h-4 shrink-0 rounded border-white/20 bg-[#0D0D0D] accent-[#CA8A04] cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-zinc-400 leading-relaxed cursor-pointer select-none">
              Би peretik.site-н{' '}
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setTermsModalOpen(true) }}
                className="text-[#CA8A04] underline underline-offset-2 hover:text-[#D97706] transition-colors"
              >
                үйлчилгээний нөхцөл
              </button>
              -ийг зөвшөөрч, бүртгүүлэхийг баталгаажуулж байна.
            </label>
          </div>
          {errors.terms && <p className="text-xs text-red-400 pl-7">{errors.terms.message}</p>}
        </div>

        <TermsModal
          open={termsModalOpen}
          onClose={() => setTermsModalOpen(false)}
          onAccept={() => setValue('terms', true, { shouldValidate: true })}
        />

        {/* Checkbox 2: Marketing (optional) */}
        <div className="flex gap-3">
          <input
            {...register('marketing')}
            id="marketing"
            type="checkbox"
            className="mt-0.5 w-4 h-4 shrink-0 rounded border-white/20 bg-[#0D0D0D] accent-[#CA8A04] cursor-pointer"
          />
          <label htmlFor="marketing" className="text-xs text-zinc-400 leading-relaxed cursor-pointer">
            Peretik-н шинэ бүтээгдэхүүн, урамшуулал болон мэдэгдлүүдийг и-мэйлээр хүлээн авахыг зөвшөөрч байна.
          </label>
        </div>

        <Button
          type="submit"
          disabled={loading || !termsChecked}
          className="w-full h-11 bg-[#CA8A04] hover:bg-[#D97706] text-black font-semibold tracking-wide disabled:opacity-50 mt-2"
        >
          {loading ? '...' : 'Бүртгүүлэх'}
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-500 mt-6">
        Бүртгэл байна уу?{' '}
        <Link href="/login" className="text-[#CA8A04] hover:underline">
          Нэвтрэх
        </Link>
      </p>
    </div>
  )
}
