'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TermsModalProps {
  open: boolean
  onClose: () => void
  onAccept: () => void
}

export function TermsModal({ open, onClose, onAccept }: TermsModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg mx-4 bg-[#0D0D0D] border border-white/10 rounded-xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#CA8A04]/30 shrink-0">
            <Dialog.Title className="font-heading text-lg font-bold text-[#CA8A04] tracking-wide">
              Үйлчилгээний нөхцөл
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                onClick={onClose}
                className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded"
                aria-label="Хаах"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto px-6 py-5 space-y-4 text-sm text-zinc-300 leading-relaxed" style={{ maxHeight: '60vh' }}>
            <p className="text-zinc-500 text-xs">Сүүлд шинэчлэгдсэн: 2026 оны 6-р сар</p>

            <Section title="1. ЕРӨНХИЙ ЗҮЙЛ">
              Peretik (peretik.site) вэбсайтыг ашигласнаар та дараах үйлчилгээний нөхцөлийг зөвшөөрч байна.
            </Section>

            <Section title="2. БҮРТГЭЛ">
              <ul className="list-disc list-inside space-y-1 text-zinc-400">
                <li>Та үнэн зөв мэдээлэл өгөх үүрэгтэй.</li>
                <li>Нэг хэрэглэгч зөвхөн нэг бүртгэлтэй байна.</li>
                <li>Бүртгэлийнхээ нууцлалыг хамгаалах хариуцлага танд байна.</li>
              </ul>
            </Section>

            <Section title="3. ЗАХИАЛГА БА ТӨЛБӨР">
              <ul className="list-disc list-inside space-y-1 text-zinc-400">
                <li>Захиалга хийсний дараа и-мэйлээр баталгаажуулалт ирнэ.</li>
                <li>Төлбөр byl.mn системээр хийгдэнэ.</li>
                <li>Бүтээгдэхүүний үнэ MNT (төгрөг)-өөр тооцогдоно.</li>
              </ul>
            </Section>

            <Section title="4. ХҮРГЭЛТ">
              <ul className="list-disc list-inside space-y-1 text-zinc-400">
                <li>Захиалгыг 3–7 ажлын өдрийн дотор хүргэнэ.</li>
                <li>Хүргэлтийн хаяг буруу бол Peretik хариуцлага хүлээхгүй.</li>
              </ul>
            </Section>

            <Section title="5. БУЦААЛТ">
              <ul className="list-disc list-inside space-y-1 text-zinc-400">
                <li>Бүтээгдэхүүн авснаас хойш 7 хоногийн дотор буцаах хүсэлт гаргаж болно.</li>
                <li>Бүтээгдэхүүн ашиглагдаагүй, анхны савлагаатай байх ёстой.</li>
                <li>Presale захиалгыг буцаах боломжгүй.</li>
              </ul>
            </Section>

            <Section title="6. ХУВИЙН МЭДЭЭЛЭЛ">
              <ul className="list-disc list-inside space-y-1 text-zinc-400">
                <li>Таны мэдээлэл гуравдагч этгээдэд дамжуулахгүй.</li>
                <li>Зөвхөн захиалга боловсруулах, хүргэлт зохион байгуулахад ашиглана.</li>
                <li>Дэлгэрэнгүйг Нууцлалын бодлогоос үзнэ үү.</li>
              </ul>
            </Section>

            <Section title="7. ОЮУНЫ ӨМЧ">
              <ul className="list-disc list-inside space-y-1 text-zinc-400">
                <li>Peretik брэндийн нэр, лого, зураг бүгд хуулиар хамгаалагдсан.</li>
                <li>Зөвшөөрөлгүйгээр ашиглахыг хориглоно.</li>
              </ul>
            </Section>

            <Section title="8. НӨХЦӨЛ ӨӨРЧЛӨЛТ">
              <ul className="list-disc list-inside space-y-1 text-zinc-400">
                <li>Peretik үйлчилгээний нөхцөлийг өөрчлөх эрхтэй.</li>
                <li>Өөрчлөлт орсон тохиолдолд и-мэйлээр мэдэгдэнэ.</li>
              </ul>
            </Section>

            <p className="text-zinc-500 text-xs pt-2">
              Асуух зүйл байвал:{' '}
              <a href="mailto:support@peretik.site" className="text-[#CA8A04] hover:underline">
                support@peretik.site
              </a>
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-white/10 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Хаах
            </button>
            <Button
              type="button"
              onClick={() => { onAccept(); onClose() }}
              className="bg-[#CA8A04] hover:bg-[#D97706] text-black font-semibold px-6"
            >
              Зөвшөөрч байна
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-[#CA8A04] uppercase tracking-widest mb-1.5">{title}</h3>
      <div className="text-zinc-400">{children}</div>
    </div>
  )
}
