import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { navItems } from '../../data/site'
import { useSound } from '../../context/SoundContext'
import { useQuoteToast } from '../../context/QuoteToastContext'
import { useRageClick } from '../../hooks/useRageClick'
import { Meta, Body } from '../typography'
import { MicIcon } from '../ui/icons'
import { cn } from '../../lib/cn'

/** Minimal shape of the parts of the Web Speech API this component uses —
 * not in the standard DOM lib types, and vendor-prefixed on the
 * `window` object. */
interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
}

interface SpeechRecognitionWindow {
  SpeechRecognition?: new () => SpeechRecognitionLike
  webkitSpeechRecognition?: new () => SpeechRecognitionLike
}

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null
  const w = window as typeof window & SpeechRecognitionWindow
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

interface VoiceCommand {
  match: string
  path: string
}

// Commands are the site's own real nav destinations (site.ts's navItems),
// not an invented command list — "home" is the one addition, since it has
// no navItems entry of its own.
const COMMANDS: VoiceCommand[] = [
  { match: 'home', path: '/' },
  ...navItems.map((item) => ({ match: item.label.toLowerCase(), path: item.to })),
]

function matchCommand(transcript: string): VoiceCommand | null {
  const lower = transcript.toLowerCase()
  return COMMANDS.find((command) => lower.includes(command.match)) ?? null
}

/** "Query the System" — voice interaction scoped to direct nav commands
 * only, no LLM round-trip (open-ended Q&A would need a new backend + a
 * real, cost-bearing API key — out of scope for this pass). A confirmed
 * recognition result (never a partial one, since `interimResults` stays
 * false) plays a distinct tone and resolves instantly via `useNavigate()`
 * to a real route — no invented "understanding" beyond simple keyword
 * matching. Falls back to a visible text input where `SpeechRecognition`
 * is unavailable (notably iOS Safari), per spec. The mic button is also
 * where the rage-click easter egg lives, per the spec's own suggested
 * pairing ("the mic button before permissions load"). */
export function VoiceQuery() {
  const navigate = useNavigate()
  const { playVoiceConfirm } = useSound()
  const { showQuote } = useQuoteToast()
  const { handleClick: registerRageClick, rageDetected } = useRageClick()
  const [supported] = useState(() => getSpeechRecognitionCtor() !== null)
  const [listening, setListening] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [textInput, setTextInput] = useState('')
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

  useEffect(() => {
    if (rageDetected) showQuote('rage-click')
  }, [rageDetected, showQuote])

  function runCommand(transcript: string) {
    const command = matchCommand(transcript)
    if (command) {
      playVoiceConfirm()
      showQuote('voice-confirm')
      setFeedback(`Heard "${transcript}" — heading there.`)
      navigate(command.path)
    } else {
      setFeedback(
        `Didn't catch a command in "${transcript}". Try: products, lab, system, build log, about, contact.`,
      )
    }
  }

  function handleMicClick() {
    registerRageClick()
    if (!supported) return

    const SpeechRecognitionCtor = getSpeechRecognitionCtor()
    if (!SpeechRecognitionCtor) return

    const recognition = new SpeechRecognitionCtor()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      runCommand(transcript)
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)

    recognitionRef.current = recognition
    setFeedback(null)
    setListening(true)
    recognition.start()
  }

  function handleTextSubmit(event: FormEvent) {
    event.preventDefault()
    if (!textInput.trim()) return
    runCommand(textInput)
    setTextInput('')
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-4 border border-border bg-bg-elevated px-6 py-8 text-center">
      <Meta as="p">QUERY THE SYSTEM</Meta>

      {supported ? (
        <button
          type="button"
          onClick={handleMicClick}
          aria-label="Ask by voice"
          aria-pressed={listening}
          data-cursor="node"
          className={cn(
            'flex size-14 items-center justify-center rounded-full border transition-colors',
            listening ? 'border-accent text-accent' : 'border-border text-fg hover:border-fg',
          )}
        >
          <MicIcon className="size-6" />
        </button>
      ) : (
        <form onSubmit={handleTextSubmit} className="flex w-full max-w-sm gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(event) => setTextInput(event.target.value)}
            placeholder="Try: contact, products, system…"
            aria-label="Type a command"
            className="flex-1 border-b border-border bg-transparent py-2 text-fg outline-none placeholder:text-fg-muted focus:border-accent"
          />
          <button
            type="submit"
            onClick={registerRageClick}
            className="border border-border px-3 py-2 text-fg transition-colors hover:border-fg"
          >
            <Meta as="span">GO</Meta>
          </button>
        </form>
      )}

      <Body className="max-w-sm text-fg-muted">
        {feedback ??
          (supported
            ? 'Say a page name — "products," "contact," "system"…'
            : "Voice input isn't supported here — type a command instead.")}
      </Body>
    </div>
  )
}
