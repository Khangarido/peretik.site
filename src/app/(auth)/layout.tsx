import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-black flex flex-col">
      <header className="h-16 flex items-center px-6 border-b border-white/[0.06]">
        <Link
          href="/"
          className="font-heading text-xl font-bold tracking-[0.15em] text-white hover:text-[#CA8A04] transition-colors"
        >
          PERETIK
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>
      <footer className="h-12 flex items-center justify-center border-t border-white/[0.06]">
        <p className="text-xs text-zinc-600">© {new Date().getFullYear()} Peretik. All rights reserved.</p>
      </footer>
    </div>
  )
}
