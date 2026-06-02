import { cn } from '@/lib/utils'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-[3px]',
}

export function LoadingSpinner({ size = 'md', className }: Props) {
  return (
    <div
      className={cn(
        'rounded-full border-t-[#CA8A04] border-r-[#CA8A04]/30 border-b-[#CA8A04]/10 border-l-[#CA8A04]/30 animate-spin',
        sizes[size],
        className
      )}
    />
  )
}
