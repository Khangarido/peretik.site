import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const timestamp = new Date().toISOString()

  try {
    const supabase = await createClient()
    const { error } = await supabase.from('products').select('id').limit(1)

    if (error) {
      return NextResponse.json(
        { status: 'degraded', timestamp, supabase: 'error', error: error.message },
        { status: 503 }
      )
    }

    return NextResponse.json({
      status: 'ok',
      timestamp,
      supabase: 'connected',
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
      region: process.env.VERCEL_REGION ?? 'local',
    })
  } catch (err) {
    return NextResponse.json(
      { status: 'error', timestamp, supabase: 'unreachable', error: String(err) },
      { status: 503 }
    )
  }
}
