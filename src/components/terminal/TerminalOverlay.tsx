import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router'
import { runCommand } from '../../lib/terminal-commands'
import { Meta } from '../typography'
import { CloseIcon } from '../ui/icons'

interface TerminalOverlayProps {
  open: boolean
  onClose: () => void
}

interface LogEntry {
  prompt: string
  command: string
  output: string[]
}

export function TerminalOverlay({ open, onClose }: TerminalOverlayProps) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const [currentPath, setCurrentPath] = useState<string[]>([])
  const [log, setLog] = useState<LogEntry[]>([])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number | null>(null)

  const prompt = `anbu@portfolio ${currentPath.length ? '~/' + currentPath.join('/') : '~'} $`

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onClose])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [log])

  if (!open) return null

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const command = input
    const result = runCommand(command, currentPath)

    if (result.clear) {
      setLog([])
    } else {
      setLog((prev) => [...prev, { prompt, command, output: result.output }])
    }

    if (result.newPath) setCurrentPath(result.newPath)

    if (result.navigateTo) {
      navigate(result.navigateTo)
      onClose()
    }

    if (command.trim()) setHistory((prev) => [...prev, command])
    setHistoryIndex(null)
    setInput('')
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (history.length === 0) return
      const nextIndex = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1)
      setHistoryIndex(nextIndex)
      setInput(history[nextIndex])
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (historyIndex === null) return
      const nextIndex = historyIndex + 1
      if (nextIndex >= history.length) {
        setHistoryIndex(null)
        setInput('')
      } else {
        setHistoryIndex(nextIndex)
        setInput(history[nextIndex])
      }
    }
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Terminal"
      className="fixed inset-0 z-50 flex flex-col bg-bg font-mono"
    >
      <div className="flex h-16 flex-none items-center justify-between border-b border-border px-gutter">
        <Meta as="span">TERMINAL</Meta>
        <button type="button" aria-label="Close terminal" onClick={onClose}>
          <CloseIcon className="size-6 text-fg" />
        </button>
      </div>

      <div data-lenis-prevent className="flex-1 overflow-y-auto px-gutter py-6">
        <p className="text-meta text-fg-muted">
          Type &apos;help&apos; to see available commands.
        </p>

        <div aria-live="polite">
          {log.map((entry, index) => (
            <div key={index} className="mt-4">
              <p className="text-meta text-fg">
                <span className="text-fg-muted">{entry.prompt}</span> {entry.command}
              </p>
              {entry.output.map((line, lineIndex) => (
                <p key={lineIndex} className="text-meta text-fg-muted">
                  {line || ' '}
                </p>
              ))}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
          <span className="text-meta text-fg-muted">{prompt}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Terminal command"
            className="text-meta flex-1 bg-transparent text-fg outline-none"
          />
          <span
            aria-hidden="true"
            className="h-4 w-2 animate-pulse bg-accent motion-reduce:animate-none"
          />
        </form>

        <div ref={bottomRef} />
      </div>
    </div>,
    document.body,
  )
}
