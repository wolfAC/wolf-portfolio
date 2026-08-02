import { Meta } from '../typography'
import { cn } from '../../lib/cn'

interface ProjectMediaPlaceholderProps {
  label?: string
  className?: string
}

export function ProjectMediaPlaceholder({
  label = 'PRODUCT PREVIEW',
  className,
}: ProjectMediaPlaceholderProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex aspect-video w-full items-center justify-center border border-dashed border-border bg-bg-elevated',
        className,
      )}
    >
      <Meta as="span">{label}</Meta>
    </div>
  )
}
