import { m } from 'framer-motion'
import { HANNYA_MASK_PATH } from './hannyaMaskPath'

interface HannyaMaskProps {
  className?: string
}

// framer-motion interpolates color transitions between literal values, not
// CSS custom properties (it can't resolve var() to compute in-between
// colors), so these are copied from index.css's --color-fg-muted and
// --color-accent rather than referencing them live.
const GREY = '#9a9a9f'
const RED = '#ff4d1c'

/** The hannya mask emblem: an expanding circular clip materializes it in —
 * an iris-wipe reveal, center-out — ash-grey at first, then its fill and
 * outline both burn from grey to red as the reveal finishes, capped with a
 * red glow that blooms in last. Timed to land well inside SplashScreen's
 * fixed 3s-visible window: wipe (0–1.4s) → color (1–2s, overlapping the
 * wipe's tail so the fully-revealed mask visibly catches color) → glow
 * (1.8–2.4s), leaving 600ms of settle before the overlay starts fading.
 *
 * This is deliberately NOT an SVG dasharray/`pathLength` trace like Logo
 * uses: that technique reveals proportionally to *arc length*, and this
 * potrace trace's arc length is dominated by the fine hatching inside the
 * mask and peonies, not by the big structural contours (face outline,
 * horns, eyes). Structural curves are comparatively cheap in arc length,
 * so a length-proportional reveal draws essentially the whole mask within
 * the first ~10% of the animation and spends the remaining 90% filling in
 * hatching too fine to visibly register — it reads as "already finished,"
 * confirmed by isolating the dominant subpath and watching it over several
 * seconds. A clip-path reveal operates in screen space instead, so it's
 * immune to how the path's length happens to be distributed. */
export function HannyaMask({ className }: HannyaMaskProps) {
  return (
    <m.svg
      viewBox="0 0 1254 1254"
      className={className}
      role="img"
      aria-label="Hannya mask with flowers"
      initial={{
        clipPath: 'circle(0% at 50% 50%)',
        filter: 'drop-shadow(0 0 0px rgba(255,77,28,0)) drop-shadow(0 0 0px rgba(255,77,28,0))',
      }}
      animate={{
        clipPath: 'circle(75% at 50% 50%)',
        filter: 'drop-shadow(0 0 14px rgba(255,77,28,0.75)) drop-shadow(0 0 32px rgba(255,77,28,0.45))',
      }}
      transition={{
        clipPath: { duration: 1.4, ease: [0.16, 1, 0.3, 1] },
        filter: { duration: 0.6, delay: 1.8, ease: 'easeOut' },
      }}
    >
      <g transform="translate(0,1254) scale(0.1,-0.1)">
        <m.path
          d={HANNYA_MASK_PATH}
          stroke="none"
          initial={{ fill: GREY }}
          animate={{ fill: RED }}
          transition={{ duration: 1, delay: 1, ease: 'easeOut' }}
        />
        <m.path
          d={HANNYA_MASK_PATH}
          fill="none"
          strokeWidth={30}
          initial={{ stroke: GREY }}
          animate={{ stroke: RED }}
          transition={{ duration: 1, delay: 1, ease: 'easeOut' }}
        />
      </g>
    </m.svg>
  )
}
