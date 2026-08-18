/** Sparse UI sound cues, synthesized entirely in code via the Web Audio
 * API — no `.mp3`/`.ogg` asset files. There's no way to source or license
 * real sound-effect recordings here, and this project's norm is to never
 * fabricate content; a synthesized "system beep" is also a more honest fit
 * for the blueprint/schematic aesthetic than a sourced mechanical-relay
 * sample would be. Nothing runs until the first successful `play*()` call
 * (itself only ever invoked from an event handler), so this never risks
 * the browser's autoplay-before-gesture restriction. */

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null

  if (!audioContext) {
    const AudioContextCtor =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!AudioContextCtor) return null
    audioContext = new AudioContextCtor()
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {
      // Autoplay policy declined to resume — the cue is silently skipped
      // rather than throwing; sound is a bonus, never load-bearing.
    })
  }

  return audioContext
}

interface ToneOptions {
  frequency: number
  duration: number
  type: OscillatorType
  peakGain: number
  /** Seconds from now to start this tone — lets `playVoiceConfirm` schedule
   * a precise back-to-back double-beep on one shared clock, rather than
   * chaining `setTimeout` calls (which drift relative to the audio clock). */
  startDelay?: number
}

function playTone({ frequency, duration, type, peakGain, startDelay = 0 }: ToneOptions) {
  const ctx = getAudioContext()
  if (!ctx) return

  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()

  oscillator.type = type
  oscillator.frequency.value = frequency

  const start = ctx.currentTime + startDelay
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.linearRampToValueAtTime(peakGain, start + 0.005)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

  oscillator.connect(gain)
  gain.connect(ctx.destination)
  oscillator.start(start)
  oscillator.stop(start + duration + 0.02)
}

/** A soft blip for the Living Diagram lighting up a tier while scrolling. */
export function playRelayClick() {
  playTone({ frequency: 700, duration: 0.08, type: 'sine', peakGain: 0.12 })
}

/** A short, dry click for the Debug Mode toggle. */
export function playSwitchToggle() {
  playTone({ frequency: 260, duration: 0.03, type: 'square', peakGain: 0.06 })
}

/** A short ascending double-beep — "multimeter confirm" per spec — for a
 * confirmed (not partial) voice recognition result. Two tones scheduled on
 * one AudioContext clock, not two separate calls, so the gap between them
 * is exact regardless of any JS timer jitter. */
export function playVoiceConfirm() {
  playTone({ frequency: 520, duration: 0.06, type: 'sine', peakGain: 0.1 })
  playTone({ frequency: 780, duration: 0.08, type: 'sine', peakGain: 0.1, startDelay: 0.07 })
}
