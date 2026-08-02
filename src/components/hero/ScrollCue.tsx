import { Meta } from '../typography'
import { ArrowIcon } from '../ui/icons'

export function ScrollCue() {
  return (
    <div className="flex justify-center pb-10">
      <a
        href="#intro"
        className="flex flex-col items-center gap-2 text-fg-muted transition-colors hover:text-fg"
      >
        <Meta as="span">SCROLL</Meta>
        <ArrowIcon className="size-4 rotate-90 animate-bounce motion-reduce:animate-none" />
      </a>
    </div>
  )
}
