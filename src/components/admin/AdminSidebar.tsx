'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Tag,
  Shield,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { useLangStore } from '@/lib/store/langStore'
import { useAuth } from '@/lib/hooks/useAuth'
import { cn } from '@/lib/utils'
import type { I18nStrings } from '@/lib/i18n/mn'

const navItems = (t: I18nStrings) => [
  { href: '/admin', label: t.admin.dashboard, icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: t.admin.products, icon: Package },
  { href: '/admin/orders', label: t.admin.orders, icon: ShoppingCart },
  { href: '/admin/users', label: t.admin.users, icon: Users },
  { href: '/admin/analytics', label: t.admin.analytics, icon: BarChart3 },
  { href: '/admin/coupons', label: t.admin.coupons, icon: Tag },
  { href: '/admin/admins', label: t.admin.admins, icon: Shield },
]

export function AdminSidebar() {
  const { t } = useLangStore()
  const { signOut } = useAuth()
  const pathname = usePathname()

  return (
    <aside className="w-60 min-h-screen bg-[#0D0D0D] border-r border-white/[0.08] flex flex-col fixed top-0 left-0">
      <div className="px-6 py-6 border-b border-white/[0.08]">
        <Link href="/" className="font-heading text-xl font-bold tracking-[0.15em] text-white hover:text-[#CA8A04] transition-colors">
          PERETIK
        </Link>
        <p className="text-[10px] text-zinc-600 mt-0.5 tracking-widest uppercase">Admin</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems(t).map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all group',
                active
                  ? 'bg-[#CA8A04]/10 text-[#CA8A04] font-medium'
                  : 'text-zinc-500 hover:text-white hover:bg-white/[0.04]'
              )}
            >
              <Icon size={16} className={active ? 'text-[#CA8A04]' : 'text-zinc-600 group-hover:text-zinc-300'} />
              {label}
              {active && <ChevronRight size={12} className="ml-auto text-[#CA8A04]/50" />}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/[0.08]">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded text-sm text-zinc-600 hover:text-red-400 hover:bg-red-400/5 transition-all"
        >
          <LogOut size={16} />
          {t.nav.logout}
        </button>
      </div>
    </aside>
  )
}
