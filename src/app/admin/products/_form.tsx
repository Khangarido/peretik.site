'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, GripVertical, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import { uploadProductImage } from '@/lib/supabase/storage'
import { toast } from 'sonner'
import type { Product } from '@/types'
import type { Resolver } from 'react-hook-form'

const schema = z.object({
  name_mn: z.string().min(1, 'Монгол нэр оруулна уу'),
  name_en: z.string().min(1, 'English name required'),
  description_mn: z.string().optional(),
  description_en: z.string().optional(),
  price: z.preprocess((v) => Number(v), z.number().positive('Үнэ оруулна уу')),
  presale_price: z.preprocess((v) => (v ? Number(v) : null), z.number().nullable().optional()),
  presale_end_at: z.string().optional(),
  category_id: z.string().optional(),
  status: z.enum(['active', 'draft', 'archived']),
  is_featured: z.boolean().default(false),
  is_presale: z.boolean().default(false),
})
type FormData = z.infer<typeof schema>

interface VariantRow {
  id: string
  size: string
  color: string
  sex: string
  stock: number
  sku: string
}

interface ImageFile {
  id: string
  file?: File
  url: string
  isNew: boolean
}

interface Props {
  product?: Product
}

export function ProductForm({ product }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const isEdit = !!product
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [images, setImages] = useState<ImageFile[]>(
    (product as Product & { images?: { id: string; url: string }[] })?.images?.map((img) => ({
      id: img.id,
      url: img.url,
      isNew: false,
    })) ?? []
  )

  const [variants, setVariants] = useState<VariantRow[]>(
    (product as Product & { variants?: VariantRow[] })?.variants?.map((v) => ({
      id: v.id,
      size: v.size,
      color: v.color,
      sex: v.sex,
      stock: v.stock,
      sku: v.sku ?? '',
    })) ?? []
  )

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: {
      name_mn: product?.name_mn ?? '',
      name_en: product?.name_en ?? '',
      description_mn: product?.description_mn ?? '',
      description_en: product?.description_en ?? '',
      price: product?.price ?? 0,
      presale_price: product?.presale_price ?? undefined,
      presale_end_at: product?.presale_end_at ?? '',
      category_id: product?.category_id ?? '',
      status: (product?.status ?? 'draft') as 'active' | 'draft' | 'archived',
      is_featured: product?.is_featured ?? false,
      is_presale: product?.is_presale ?? false,
    },
  })

  const isPresale = watch('is_presale')

  // ── Image Handlers ──────────────────────────────────────────────────────────
  const addFiles = useCallback((files: FileList | File[]) => {
    const newImgs: ImageFile[] = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((file) => ({
        id: `new-${Date.now()}-${Math.random()}`,
        file,
        url: URL.createObjectURL(file),
        isNew: true,
      }))
    setImages((prev) => [...prev, ...newImgs])
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files)
  }, [addFiles])

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
  }

  // ── Variant Handlers ────────────────────────────────────────────────────────
  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { id: `v-${Date.now()}`, size: 'M', color: '#ffffff', sex: 'unisex', stock: 0, sku: '' },
    ])
  }

  const updateVariant = (id: string, key: keyof VariantRow, value: string | number) => {
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, [key]: value } : v)))
  }

  const removeVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id))
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  const onSubmit = async (data: FormData) => {
    if (variants.length === 0) {
      toast.error('Хамгийн багадаа нэг вариант шаардлагатай')
      return
    }

    setSaving(true)
    const supabase = createClient()

    try {
      const slug = isEdit ? product!.slug : slugify(data.name_en || data.name_mn)
      const { name_mn } = data

      // 1. Upload new images
      const uploadedImages: { url: string; isNew: boolean; id: string }[] = []
      for (const img of images) {
        if (img.isNew && img.file) {
          const url = await uploadProductImage(img.file, slug)
          uploadedImages.push({ url, isNew: true, id: img.id })
        } else {
          uploadedImages.push(img)
        }
      }

      // 2. Upsert product
      let productId = product?.id
      if (isEdit && productId) {
        const { error } = await supabase.from('products').update({ ...data, slug }).eq('id', productId)
        if (error) throw error
      } else {
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert({ ...data, slug })
          .select()
          .single()
        if (error || !newProduct) throw error
        productId = newProduct.id
      }

      // 3. Insert product_images
      if (uploadedImages.some((img) => img.isNew)) {
        await supabase.from('product_images').delete().eq('product_id', productId)
        await supabase.from('product_images').insert(
          uploadedImages.map((img, i) => ({
            product_id: productId,
            url: img.url,
            sort_order: i,
          }))
        )
      }

      // 4. Upsert variants
      await supabase.from('variants').delete().eq('product_id', productId)
      await supabase.from('variants').insert(
        variants.map((v) => ({
          product_id: productId,
          size: v.size,
          color: v.color,
          sex: v.sex,
          stock: Number(v.stock),
          sku: v.sku || null,
        }))
      )

      toast.success(isEdit ? 'Хадгалагдлаа' : 'Бүтээгдэхүүн нэмэгдлээ')
      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      toast.error(String(err))
    } finally {
      setSaving(false)
    }
  }

  const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'One Size']
  const SEXES = [{ v: 'male', l: 'Эрэгтэй' }, { v: 'female', l: 'Эмэгтэй' }, { v: 'unisex', l: 'Унисекс' }]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* ── Basic Info ── */}
      <div className="p-6 bg-[#0D0D0D] rounded border border-white/[0.06] space-y-5">
        <h2 className="text-[10px] text-zinc-600 uppercase tracking-[0.3em]">Үндсэн мэдээлэл</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-[10px] text-zinc-500 uppercase tracking-widest">Нэр (Монгол)</Label>
            <Input {...register('name_mn')} className="mt-1.5 bg-black border-white/10 text-white focus:border-[#CA8A04]/40" />
            {errors.name_mn && <p className="text-xs text-red-400 mt-1">{errors.name_mn.message}</p>}
          </div>
          <div>
            <Label className="text-[10px] text-zinc-500 uppercase tracking-widest">Name (English)</Label>
            <Input {...register('name_en')} className="mt-1.5 bg-black border-white/10 text-white focus:border-[#CA8A04]/40" />
            {errors.name_en && <p className="text-xs text-red-400 mt-1">{errors.name_en.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-[10px] text-zinc-500 uppercase tracking-widest">Тайлбар (МН)</Label>
            <Textarea {...register('description_mn')} rows={3} className="mt-1.5 bg-black border-white/10 text-white focus:border-[#CA8A04]/40 resize-none" />
          </div>
          <div>
            <Label className="text-[10px] text-zinc-500 uppercase tracking-widest">Description (EN)</Label>
            <Textarea {...register('description_en')} rows={3} className="mt-1.5 bg-black border-white/10 text-white focus:border-[#CA8A04]/40 resize-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <Label className="text-[10px] text-zinc-500 uppercase tracking-widest">Үнэ (₮)</Label>
            <Input {...register('price')} type="number" min={0} className="mt-1.5 bg-black border-white/10 text-white focus:border-[#CA8A04]/40" />
            {errors.price && <p className="text-xs text-red-400 mt-1">{errors.price.message}</p>}
          </div>
          <div>
            <Label className="text-[10px] text-zinc-500 uppercase tracking-widest">Ангилал ID</Label>
            <Input {...register('category_id')} className="mt-1.5 bg-black border-white/10 text-white focus:border-[#CA8A04]/40" />
          </div>
          <div>
            <Label className="text-[10px] text-zinc-500 uppercase tracking-widest">Төлөв</Label>
            <Select defaultValue={product?.status ?? 'draft'} onValueChange={(v) => setValue('status', v as 'active' | 'draft' | 'archived')}>
              <SelectTrigger className="mt-1.5 bg-black border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#111] border-white/10 text-white">
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch checked={watch('is_featured')} onCheckedChange={(v) => setValue('is_featured', v)} className="data-[state=checked]:bg-[#CA8A04]" />
            <Label className="text-sm text-zinc-400 cursor-pointer">Онцлох</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={watch('is_presale')} onCheckedChange={(v) => setValue('is_presale', v)} className="data-[state=checked]:bg-[#CA8A04]" />
            <Label className="text-sm text-zinc-400 cursor-pointer">Pre-Sale</Label>
          </div>
        </div>

        {isPresale && (
          <div className="grid grid-cols-2 gap-4 border-t border-white/[0.06] pt-4">
            <div>
              <Label className="text-[10px] text-zinc-500 uppercase tracking-widest">Pre-Sale үнэ (₮)</Label>
              <Input {...register('presale_price')} type="number" min={0} className="mt-1.5 bg-black border-white/10 text-white focus:border-[#CA8A04]/40" />
            </div>
            <div>
              <Label className="text-[10px] text-zinc-500 uppercase tracking-widest">Pre-Sale дуусах огноо</Label>
              <Input {...register('presale_end_at')} type="datetime-local" className="mt-1.5 bg-black border-white/10 text-white focus:border-[#CA8A04]/40" />
            </div>
          </div>
        )}
      </div>

      {/* ── Images ── */}
      <div className="p-6 bg-[#0D0D0D] rounded border border-white/[0.06] space-y-4">
        <h2 className="text-[10px] text-zinc-600 uppercase tracking-[0.3em]">Зургууд</h2>

        {/* Drop zone */}
        <div
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            dragging ? 'border-[#CA8A04]/60 bg-[#CA8A04]/5' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
          }`}
        >
          <Upload size={24} className="mx-auto mb-2 text-zinc-600" />
          <p className="text-sm text-zinc-500">Зураг чирж оруулах эсвэл дарах</p>
          <p className="text-[10px] text-zinc-700 mt-1">PNG, JPG, WEBP</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
        </div>

        {/* Preview grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {images.map((img, idx) => (
              <div key={img.id} className="relative group aspect-square bg-[#111] rounded overflow-hidden border border-white/[0.06]">
                <Image src={img.url} alt={`Image ${idx + 1}`} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="w-7 h-7 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X size={13} />
                  </button>
                </div>
                {idx === 0 && (
                  <div className="absolute bottom-1 left-1 bg-[#CA8A04] text-black text-[8px] font-bold px-1.5 py-0.5 rounded">MAIN</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Variants ── */}
      <div className="p-6 bg-[#0D0D0D] rounded border border-white/[0.06] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] text-zinc-600 uppercase tracking-[0.3em]">Вариантууд</h2>
          <Button type="button" onClick={addVariant} size="sm" variant="outline" className="border-white/10 text-zinc-300 hover:text-white text-xs">
            <Plus size={12} className="mr-1" /> Вариант нэмэх
          </Button>
        </div>

        {variants.length === 0 && (
          <p className="text-sm text-zinc-600 text-center py-6">Вариант нэмэгдээгүй байна. Дор хаяж нэг вариант шаардлагатай.</p>
        )}

        <div className="space-y-2">
          {variants.map((v, idx) => (
            <div key={v.id} className="grid grid-cols-6 gap-2 items-center p-3 bg-black/40 rounded border border-white/[0.04]">
              <div>
                <Label className="text-[8px] text-zinc-600 uppercase tracking-widest">Хэмжээ</Label>
                <select
                  value={v.size}
                  onChange={(e) => updateVariant(v.id, 'size', e.target.value)}
                  className="w-full mt-1 bg-[#0D0D0D] border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:border-[#CA8A04]/40 focus:outline-none"
                >
                  {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-[8px] text-zinc-600 uppercase tracking-widest">Хүйс</Label>
                <select
                  value={v.sex}
                  onChange={(e) => updateVariant(v.id, 'sex', e.target.value)}
                  className="w-full mt-1 bg-[#0D0D0D] border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:border-[#CA8A04]/40 focus:outline-none"
                >
                  {SEXES.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-[8px] text-zinc-600 uppercase tracking-widest">Өнгө</Label>
                <div className="flex items-center gap-1 mt-1">
                  <input
                    type="color"
                    value={v.color}
                    onChange={(e) => updateVariant(v.id, 'color', e.target.value)}
                    className="w-8 h-7 rounded cursor-pointer bg-transparent border border-white/10 p-0"
                    title="Өнгө сонгох"
                  />
                  <Input
                    value={v.color}
                    onChange={(e) => updateVariant(v.id, 'color', e.target.value)}
                    className="flex-1 bg-[#0D0D0D] border-white/10 text-white text-xs h-7 focus:border-[#CA8A04]/40"
                    placeholder="#000000"
                  />
                </div>
              </div>
              <div>
                <Label className="text-[8px] text-zinc-600 uppercase tracking-widest">Нөөц</Label>
                <Input
                  type="number"
                  min={0}
                  value={v.stock}
                  onChange={(e) => updateVariant(v.id, 'stock', Number(e.target.value))}
                  className="mt-1 bg-[#0D0D0D] border-white/10 text-white text-xs h-7 focus:border-[#CA8A04]/40"
                />
              </div>
              <div>
                <Label className="text-[8px] text-zinc-600 uppercase tracking-widest">SKU</Label>
                <Input
                  value={v.sku}
                  onChange={(e) => updateVariant(v.id, 'sku', e.target.value)}
                  className="mt-1 bg-[#0D0D0D] border-white/10 text-white text-xs h-7 focus:border-[#CA8A04]/40"
                  placeholder="SKU-001"
                />
              </div>
              <div className="flex justify-end pt-4">
                <button type="button" onClick={() => removeVariant(v.id)} className="text-zinc-700 hover:text-red-400 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Submit ── */}
      <div className="flex gap-3">
        <Button type="submit" disabled={saving} className="bg-[#CA8A04] hover:bg-[#D97706] text-black font-bold disabled:opacity-50">
          {saving ? 'Хадгалж байна...' : isEdit ? 'Хадгалах' : 'Бүтээгдэхүүн нэмэх'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} className="border-white/10 text-zinc-300 hover:text-white">
          Буцах
        </Button>
      </div>
    </form>
  )
}
