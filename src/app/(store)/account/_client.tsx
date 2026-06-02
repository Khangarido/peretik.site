'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Camera, Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { uploadAvatar } from '@/lib/supabase/storage'
import { useLangStore } from '@/lib/store/langStore'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { OrdersClient } from '../orders/_client'
import type { User, Order } from '@/types'

interface Props {
  profile: User | null
  email: string
  orders?: Order[]
}

type Tab = 'profile' | 'security' | 'orders'

const passwordSchema = z.object({
  new_password: z.string().min(8, 'Нууц үг 8+ тэмдэгт байх ёстой'),
  confirm_password: z.string(),
}).refine((d) => d.new_password === d.confirm_password, {
  message: 'Нууц үг таарахгүй байна',
  path: ['confirm_password'],
})
type PasswordData = z.infer<typeof passwordSchema>

export function AccountClient({ profile, email, orders = [] }: Props) {
  const { lang, setLang } = useLangStore()
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url ?? null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const profileForm = useForm({
    defaultValues: {
      full_name: profile?.full_name ?? '',
      phone: profile?.phone ?? '',
    },
  })

  const passwordForm = useForm<PasswordData>({
    resolver: zodResolver(passwordSchema) as import('react-hook-form').Resolver<PasswordData>,
  })

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile?.id) return
    setUploadingAvatar(true)
    try {
      const url = await uploadAvatar(file, profile.id)
      const supabase = createClient()
      await supabase.from('users').update({ avatar_url: url }).eq('id', profile.id)
      setAvatarUrl(url)
      toast.success(lang === 'mn' ? 'Зураг шинэчлэгдлээ' : 'Avatar updated')
    } catch (err) {
      toast.error(lang === 'mn' ? 'Зураг оруулах амжилтгүй' : 'Upload failed')
    }
    setUploadingAvatar(false)
  }

  const onProfileSave = async (data: { full_name: string; phone: string }) => {
    if (!profile?.id) return
    setSavingProfile(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('users')
      .update({ full_name: data.full_name, phone: data.phone, lang })
      .eq('id', profile.id)
    if (error) toast.error(lang === 'mn' ? 'Хадгалах амжилтгүй' : 'Save failed')
    else toast.success(lang === 'mn' ? 'Хадгалагдлаа' : 'Saved')
    setSavingProfile(false)
  }

  const onPasswordSave = async (data: PasswordData) => {
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: data.new_password })
    if (error) toast.error(error.message)
    else {
      toast.success(lang === 'mn' ? 'Нууц үг шинэчлэгдлээ' : 'Password updated')
      passwordForm.reset()
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'profile', label: lang === 'mn' ? 'Профайл' : 'Profile' },
    { key: 'security', label: lang === 'mn' ? 'Аюулгүй байдал' : 'Security' },
    { key: 'orders', label: lang === 'mn' ? `Захиалгууд (${orders.length})` : `Orders (${orders.length})` },
  ]

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/[0.06] mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px',
              activeTab === tab.key
                ? 'border-[#CA8A04] text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── PROFILE TAB ────────────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <form onSubmit={profileForm.handleSubmit(onProfileSave)} className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-[#111] border-2 border-white/10 overflow-hidden">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-heading text-2xl text-zinc-700">
                    {(profile?.full_name ?? email)[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#CA8A04] hover:bg-[#D97706] text-black rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
              >
                {uploadingAvatar ? (
                  <span className="text-[9px]">...</span>
                ) : (
                  <Camera size={13} />
                )}
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <div>
              <p className="text-sm font-medium text-white">{profile?.full_name ?? email}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{email}</p>
            </div>
          </div>

          <Separator className="bg-white/[0.06]" />

          <div className="space-y-4">
            <div>
              <Label className="text-[10px] text-zinc-500 uppercase tracking-widest">
                {lang === 'mn' ? 'Нэр' : 'Full name'}
              </Label>
              <Input
                {...profileForm.register('full_name')}
                className="mt-1.5 bg-[#0D0D0D] border-white/10 text-white focus:border-[#CA8A04]/40"
              />
            </div>
            <div>
              <Label className="text-[10px] text-zinc-500 uppercase tracking-widest">
                {lang === 'mn' ? 'И-мэйл' : 'Email'}
              </Label>
              <Input
                value={email}
                disabled
                className="mt-1.5 bg-black border-white/5 text-zinc-600 cursor-not-allowed"
              />
            </div>
            <div>
              <Label className="text-[10px] text-zinc-500 uppercase tracking-widest">
                {lang === 'mn' ? 'Утас' : 'Phone'}
              </Label>
              <Input
                {...profileForm.register('phone')}
                type="tel"
                className="mt-1.5 bg-[#0D0D0D] border-white/10 text-white focus:border-[#CA8A04]/40"
              />
            </div>

            {/* Language preference */}
            <div>
              <Label className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2.5 block">
                {lang === 'mn' ? 'Хэл' : 'Language'}
              </Label>
              <div className="flex gap-2">
                {(['mn', 'en'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLang(l)}
                    className={cn(
                      'px-5 py-2 text-sm border rounded transition-all',
                      lang === l
                        ? 'border-[#CA8A04] text-[#CA8A04] bg-[#CA8A04]/5 font-medium'
                        : 'border-white/10 text-zinc-500 hover:border-white/30 hover:text-white'
                    )}
                  >
                    {l === 'mn' ? 'Монгол' : 'English'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={savingProfile}
            className="h-11 bg-[#CA8A04] hover:bg-[#D97706] text-black font-bold px-8 disabled:opacity-50"
          >
            {savingProfile ? '...' : (lang === 'mn' ? 'Хадгалах' : 'Save')}
          </Button>
        </form>
      )}

      {/* ── ORDERS TAB ─────────────────────────────────────────────────────── */}
      {activeTab === 'orders' && (
        <div>
          {orders.length === 0 ? (
            <p className="text-zinc-600 text-sm py-10 text-center">Захиалга байхгүй байна</p>
          ) : (
            <OrdersClient orders={orders} />
          )}
        </div>
      )}

      {/* ── SECURITY TAB ───────────────────────────────────────────────────── */}
      {activeTab === 'security' && (
        <form onSubmit={passwordForm.handleSubmit(onPasswordSave)} className="space-y-5 max-w-sm">
          <h2 className="font-heading text-xl text-white">
            {lang === 'mn' ? 'Нууц үг солих' : 'Change Password'}
          </h2>

          <div>
            <Label className="text-[10px] text-zinc-500 uppercase tracking-widest">
              {lang === 'mn' ? 'Шинэ нууц үг' : 'New Password'}
            </Label>
            <div className="relative mt-1.5">
              <Input
                {...passwordForm.register('new_password')}
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                className="bg-[#0D0D0D] border-white/10 text-white focus:border-[#CA8A04]/40 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {passwordForm.formState.errors.new_password && (
              <p className="text-xs text-red-400 mt-1">{passwordForm.formState.errors.new_password.message}</p>
            )}
          </div>

          <div>
            <Label className="text-[10px] text-zinc-500 uppercase tracking-widest">
              {lang === 'mn' ? 'Нууц үг давтах' : 'Confirm Password'}
            </Label>
            <Input
              {...passwordForm.register('confirm_password')}
              type="password"
              autoComplete="new-password"
              className="mt-1.5 bg-[#0D0D0D] border-white/10 text-white focus:border-[#CA8A04]/40"
            />
            {passwordForm.formState.errors.confirm_password && (
              <p className="text-xs text-red-400 mt-1">{passwordForm.formState.errors.confirm_password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={passwordForm.formState.isSubmitting}
            className="h-11 bg-[#CA8A04] hover:bg-[#D97706] text-black font-bold px-8 disabled:opacity-50"
          >
            {passwordForm.formState.isSubmitting ? '...' : (lang === 'mn' ? 'Нууц үг шинэчлэх' : 'Update Password')}
          </Button>
        </form>
      )}
    </div>
  )
}
