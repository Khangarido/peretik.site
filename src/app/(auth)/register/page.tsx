import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata = { title: 'Бүртгүүлэх — Peretik' }

export default function RegisterPage() {
  return (
    <div className="w-full max-w-sm">
      <RegisterForm />
    </div>
  )
}
