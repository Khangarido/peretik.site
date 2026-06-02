import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { CookieOptions } from '@supabase/ssr'

const ADMIN_ROUTES = ['/admin']
const AUTH_REQUIRED_ROUTES = ['/orders', '/account', '/wishlist', '/checkout']
const CHECKOUT_PUBLIC_PATHS = ['/checkout/success', '/checkout/cancel']

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const SUPABASE_READY = SUPABASE_URL.startsWith('https://') && SUPABASE_ANON_KEY.length > 10

function isAdminRoute(pathname: string) {
  return ADMIN_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))
}

function isAuthRequiredRoute(pathname: string) {
  if (CHECKOUT_PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return false
  return AUTH_REQUIRED_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))
}

function isApiRoute(pathname: string) {
  return pathname.startsWith('/api/')
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({ request })

  // ── CORS for /api/* ──────────────────────────────────────────────────────────
  if (isApiRoute(pathname)) {
    const origin = request.headers.get('origin') ?? ''
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://peretik.site'

    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': siteUrl,
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      })
    }

    const allowedOrigins = [siteUrl, 'http://localhost:3000', 'http://localhost:3001']
    if (!origin || allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin || siteUrl)
      response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    }

    return response
  }

  // ── Skip auth logic if Supabase is not configured yet ───────────────────────
  if (!SUPABASE_READY) {
    return response
  }

  // ── Build Supabase client ────────────────────────────────────────────────────
  let user = null

  try {
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          response = NextResponse.next({ request })
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options)
          }
        },
      },
    })

    const { data } = await supabase.auth.getUser()
    user = data.user

    // ── Admin routes ───────────────────────────────────────────────────────────
    if (isAdminRoute(pathname)) {
      if (!user) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    // ── Auth-required routes ───────────────────────────────────────────────────
    if (isAuthRequiredRoute(pathname) && !user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // ── Redirect logged-in users away from /login and /register ───────────────
    if (user && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  } catch {
    // Supabase unreachable — allow the request through so the page can render
    // its own error state rather than crashing here.
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
