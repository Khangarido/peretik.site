import { LoginForm } from '@/components/auth/LoginForm'
import { Suspense } from 'react'

export const metadata = { title: 'Нэвтрэх — Peretik' }

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  )
}
