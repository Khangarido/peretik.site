'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, User, Heart, LogOut, LayoutDashboard, ShoppingBag } from 'lucide-react'
import { CartDrawer } from '@/components/ui/CartDrawer'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import { useLangStore } from '@/lib/store/langStore'
import { useAuth } from '@/lib/hooks/useAuth'
import { useWishlistStore } from '@/lib/store/wishlistStore'
import { useCartStore } from '@/lib/store/cartStore'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Navbar() {
  const { t } = useLangStore()
  const { user, profile, signOut } = useAuth()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Wishlist count
  const wishlistCount = useWishlistStore((s) => s.items.length)
  const cartCount = useCartStore((s) => s.getCount())

  // Scroll detection — transparent on hero, solid after 60px
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const isHomepage = pathname === '/'

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled || !isHomepage || mobileOpen
          ? 'bg-black/95 backdrop-blur-md border-b border-white/[0.08]'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link
          href="/"
          className="font-heading text-2xl font-bold tracking-[0.18em] text-white hover:text-[#CA8A04] transition-colors flex-shrink-0"
        >
          PERETIK
        </Link>

        {/* Center nav links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/shop"
            className={cn(
              'text-xs font-medium tracking-[0.2em] uppercase transition-colors',
              pathname.startsWith('/shop') ? 'text-white' : 'text-zinc-400 hover:text-white'
            )}
          >
            {t.nav.shop}
          </Link>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-1">
          <LanguageToggle />

          {/* Wishlist icon */}
          {user && (
            <Link
              href="/wishlist"
              className="relative p-2 text-zinc-400 hover:text-white transition-colors hidden md:flex"
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-white/10 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                  {wishlistCount}
                </span>
              )}
            </Link>
          )}

          {/* Cart drawer */}
          <CartDrawer />

          {/* Account */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-2 text-zinc-400 hover:text-white transition-colors"
                  aria-label="Account"
                >
                  <User size={20} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-[#111] border-white/[0.08] text-white w-52"
              >
                <div className="px-3 py-2.5">
                  <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                  {profile?.full_name && (
                    <p className="text-sm text-white font-medium truncate mt-0.5">{profile.full_name}</p>
                  )}
                </div>
                <DropdownMenuSeparator className="bg-white/[0.08]" />
                <DropdownMenuItem asChild>
                  <Link href="/account" className="cursor-pointer gap-2">
                    <User size={14} /> {t.nav.account}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders" className="cursor-pointer gap-2">
                    <ShoppingBag size={14} /> {t.nav.orders}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/wishlist" className="cursor-pointer gap-2">
                    <Heart size={14} /> {t.nav.wishlist}
                  </Link>
                </DropdownMenuItem>
                {profile?.role === 'admin' && (
                  <>
                    <DropdownMenuSeparator className="bg-white/[0.08]" />
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer gap-2 text-[#CA8A04] focus:text-[#CA8A04]">
                        <LayoutDashboard size={14} /> {t.nav.admin}
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator className="bg-white/[0.08]" />
                <DropdownMenuItem
                  onClick={signOut}
                  className="cursor-pointer gap-2 text-red-400 focus:text-red-400 focus:bg-red-400/5"
                >
                  <LogOut size={14} /> {t.nav.logout}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              className="hidden md:flex text-xs px-4 py-1.5 border border-white/20 rounded text-zinc-300 hover:text-white hover:border-white/40 transition-all tracking-widest uppercase"
            >
              {t.nav.login}
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors ml-1"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-black border-t border-white/[0.08] px-6 py-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <Link
            href="/shop"
            className="block text-sm tracking-[0.2em] uppercase py-2 text-zinc-300 hover:text-white transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            {t.nav.shop}
          </Link>
          {user ? (
            <>
              <Link href="/account" onClick={() => setMobileOpen(false)}
                className="block text-sm text-zinc-300 hover:text-white transition-colors py-2">
                {t.nav.account}
              </Link>
              <Link href="/orders" onClick={() => setMobileOpen(false)}
                className="block text-sm text-zinc-300 hover:text-white transition-colors py-2">
                {t.nav.orders}
              </Link>
              <Link href="/wishlist" onClick={() => setMobileOpen(false)}
                className="block text-sm text-zinc-300 hover:text-white transition-colors py-2">
                {t.nav.wishlist}
              </Link>
              {profile?.role === 'admin' && (
                <Link href="/admin" onClick={() => setMobileOpen(false)}
                  className="block text-sm text-[#CA8A04] py-2">
                  {t.nav.admin}
                </Link>
              )}
              <button onClick={() => { signOut(); setMobileOpen(false) }}
                className="block text-sm text-red-400 py-2 w-full text-left">
                {t.nav.logout}
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setMobileOpen(false)}
              className="block text-sm text-zinc-300 hover:text-white transition-colors py-2">
              {t.nav.login}
            </Link>
          )}
          <div className="pt-2">
            <LanguageToggle />
          </div>
        </div>
      )}
    </header>
  )
}
