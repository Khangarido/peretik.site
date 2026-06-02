import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { CookieOptions } from '@supabase/ssr'

const ADMIN_ROUTES = ['/admin']

// Routes that require a logged-in user.
// Note: /checkout/success and /checkout/cancel are intentionally excluded —
// byl.mn redirects back to these URLs without a session cookie.
const AUTH_REQUIRED_ROUTES = ['/orders', '/account', '/wishlist', '/checkout']

// Checkout callback pages must remain publicly accessible for byl.mn redirects
const CHECKOUT_PUBLIC_PATHS = ['/checkout/success', '/checkout/cancel']

function isAdminRoute(pathname: string) {
  return ADMIN_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))
}

function isAuthRequiredRoute(pathname: string) {
  // Never block the payment callback pages
  if (CHECKOUT_PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return false
  return AUTH_REQUIRED_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))
}

function isApiRoute(pathname: string) {
  return pathname.startsWith('/api/')
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({ request })

  // ── CORS headers for all /api/* routes ──────────────────────────────────────
  if (isApiRoute(pathname)) {
    const origin = request.headers.get('origin') ?? ''
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://peretik.site'

    // Handle OPTIONS preflight
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

    // Allow from same-origin and the production domain
    const allowedOrigins = [siteUrl, 'http://localhost:3000']
    if (!origin || allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin || siteUrl)
      response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    }

    // TODO: Rate-limit /api/analytics/track with Vercel KV to ~60 req/min/IP:
    //   import { kv } from '@vercel/kv'
    //   const key = `rl:${request.ip}:analytics`
    //   const count = await kv.incr(key)
    //   if (count === 1) await kv.expire(key, 60)
    //   if (count > 60) return new NextResponse('Too Many Requests', { status: 429 })

    return response
  }

  // Build a Supabase client that can read/write cookies in middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  )

  // Refresh the session token if it has expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ── Admin routes ─────────────────────────────────────────────────────────────
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

  // ── Auth-required routes ──────────────────────────────────────────────────────
  if (isAuthRequiredRoute(pathname) && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── Redirect logged-in users away from /login and /register ─────────────────
  if (user && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match every path EXCEPT:
     *   - Next.js internals (_next/static, _next/image)
     *   - Public static assets (svg, png, jpg, etc.)
     *   - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
