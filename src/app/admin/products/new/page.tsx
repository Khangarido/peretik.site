import { ProductForm } from '../_form'

export const metadata = { title: 'Admin — New Product' }

export default function NewProductPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <p className="text-xs text-zinc-500 tracking-[0.4em] uppercase mb-1">Admin / Products</p>
        <h1 className="font-heading text-3xl font-bold text-white">Шинэ бүтээгдэхүүн</h1>
      </div>
      <ProductForm />
    </div>
  )
}
