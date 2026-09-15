'use client'

import { useEffect } from 'react'

/** True when this document is running inside somebody else's page. */
export function isEmbedded(): boolean {
  try {
    return window.parent !== window
  } catch {
    // Reading window.parent across origins can throw in older browsers. If it
    // does, we are certainly framed.
    return true
  }
}

/**
 * Tells the loader how tall the form is, so the iframe grows and shrinks with
 * it instead of scrolling inside a fixed box.
 *
 * The message goes to '*' because a child cannot know the origin of the page
 * that framed it, and asking would mean trusting whatever it answered. That is
 * safe only as long as the message carries nothing but a number, which is why
 * the loader accepts exactly one field. See public/embed/v1/frame.js.
 */
export function useIframeResize(ref: React.RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const element = ref.current
    if (!element || !isEmbedded()) return

    const post = () => {
      const height = Math.ceil(element.getBoundingClientRect().height)
      window.parent.postMessage({ type: 'tw:resize', height }, '*')
    }

    post()
    const observer = new ResizeObserver(post)
    observer.observe(element)

    // Fonts landing after first paint change the height by a few pixels.
    window.addEventListener('load', post)
    return () => {
      observer.disconnect()
      window.removeEventListener('load', post)
    }
  }, [ref])
}

/**
 * Opens the report. Inside an iframe the parent does it, because a popup opened
 * by a cross origin frame is the kind of thing browsers block; on the hosted
 * page we simply navigate.
 */
export function openReport(url: string): void {
  if (isEmbedded()) {
    window.parent.postMessage({ type: 'tw:redirect', url }, '*')
    return
  }
  window.location.href = url
}
