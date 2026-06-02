import Link from 'next/link'

const SHOP_LINKS = [
  { href: '/shop', label: 'Бүх бүтээгдэхүүн' },
  { href: '/shop?presale=true', label: 'Pre-Sale' },
  { href: '/shop?sort=newest', label: 'Шинэ ирэлт' },
]

const ACCOUNT_LINKS = [
  { href: '/orders', label: 'Захиалга хянах' },
  { href: '/wishlist', label: 'Хүсэлтийн жагсаалт' },
  { href: '/account', label: 'Бүртгэл' },
]

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-black mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand column */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="font-heading text-2xl font-bold tracking-[0.18em] text-white hover:text-[#CA8A04] transition-colors"
            >
              PERETIK
            </Link>
            <p className="mt-4 text-sm text-zinc-500 leading-relaxed max-w-xs">
              Монгол залуусын өмсгөл. Гудамжны соёлыг уламжлалтай нэгтгэнэ.
            </p>
            <div className="flex gap-5 mt-6">
              <a
                href="https://instagram.com/peretik"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold tracking-[0.2em] text-zinc-600 hover:text-[#CA8A04] transition-colors uppercase"
              >
                Instagram
              </a>
              <a
                href="https://facebook.com/peretik"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold tracking-[0.2em] text-zinc-600 hover:text-[#CA8A04] transition-colors uppercase"
              >
                Facebook
              </a>
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-500 mb-5">
              Дэлгүүр
            </h4>
            <ul className="space-y-3">
              {SHOP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account links */}
          <div>
            <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-500 mb-5">
              Миний бүртгэл
            </h4>
            <ul className="space-y-3">
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-zinc-700">
            © {new Date().getFullYear()} Peretik. Бүх эрх хуулиар хамгаалагдсан.
          </p>
          <p className="text-xs text-zinc-700 tracking-widest">peretik.site</p>
        </div>
      </div>
    </footer>
  )
}
