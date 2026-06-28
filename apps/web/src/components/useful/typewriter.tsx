"use client"

import { useEffect, useState } from "react"

type TypewriterProps = {
  prefix: string
  phrases: string[]
  className?: string
}

export function Typewriter({ prefix, phrases, className }: TypewriterProps) {
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [text, setText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const current = phrases[phraseIndex % phrases.length]

    // Speeds: slower while writing, quicker while removing.
    const typeSpeed = isDeleting ? 45 : 85
    // Pause when the full phrase is written, then start removing.
    const pauseAtEnd = 1600

    let delay = typeSpeed

    if (!isDeleting && text === current) {
      delay = pauseAtEnd
    }

    const timeout = setTimeout(() => {
      if (!isDeleting && text === current) {
        setIsDeleting(true)
        return
      }

      if (isDeleting && text === "") {
        setIsDeleting(false)
        setPhraseIndex((i) => (i + 1) % phrases.length)
        return
      }

      const nextLength = isDeleting ? text.length - 1 : text.length + 1
      setText(current.slice(0, nextLength))
    }, delay)

    return () => clearTimeout(timeout)
  }, [text, isDeleting, phraseIndex, phrases])

  return (
    <span className={className}>
      {prefix}
      <span className="text-brand">{text}</span>
      <span
        aria-hidden="true"
        className="ml-0.5 inline-block w-[3px] animate-caret-blink self-stretch bg-brand align-middle"
        style={{ height: "0.9em" }}
      />
      <span className="sr-only">
        {prefix}
        {phrases.join(", ")}
      </span>
    </span>
  )
}


