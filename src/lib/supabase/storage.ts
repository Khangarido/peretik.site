import { createClient } from '@/lib/supabase/client'

const PRODUCT_IMAGES_BUCKET = 'product-images'
const AVATARS_BUCKET = 'avatars'

function getExt(file: File): string {
  return file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
}

/**
 * Upload a product image to the 'product-images' bucket.
 * Path: products/{productId}/{uuid}.{ext}
 * Returns the public URL.
 */
export async function uploadProductImage(file: File, productId: string): Promise<string> {
  const supabase = createClient()
  const ext = getExt(file)
  const path = `products/${productId}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Upload a user avatar to the 'avatars' bucket.
 * Path: avatars/{userId}/{uuid}.{ext}
 * Returns the public URL.
 */
export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const supabase = createClient()
  const ext = getExt(file)
  const path = `avatars/${userId}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: true })

  if (error) throw new Error(`Avatar upload failed: ${error.message}`)

  const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Delete a file from a Supabase Storage bucket.
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw new Error(`Delete failed: ${error.message}`)
}

/**
 * Extract the storage path from a full Supabase public URL.
 * Useful before calling deleteFile.
 */
export function extractStoragePath(publicUrl: string): { bucket: string; path: string } | null {
  try {
    const url = new URL(publicUrl)
    // Format: /storage/v1/object/public/{bucket}/{path}
    const segments = url.pathname.split('/storage/v1/object/public/')[1]?.split('/')
    if (!segments || segments.length < 2) return null
    const bucket = segments[0]
    const path = segments.slice(1).join('/')
    return { bucket, path }
  } catch {
    return null
  }
}
