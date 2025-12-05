import { sendResize } from './messenger'
import { RESIZE_DEBOUNCE_MS } from '../constants'

let lastHeight = 0
let resizeTimeout: ReturnType<typeof setTimeout> | null = null
let isResizing = false

/**
 * Calculate current content height
 */
export function getContentHeight(): number {
  if (typeof document === 'undefined') return 0

  // Get the first child of body (our app container)
  const content = document.body.firstElementChild as HTMLElement
  if (content) {
    return content.offsetHeight
  }

  // Fallback to body height
  return document.body.offsetHeight
}

/**
 * Send height update to parent (debounced)
 */
function reportHeight(): void {
  // Prevent re-entry during resize
  if (isResizing) return

  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }

  resizeTimeout = setTimeout(() => {
    isResizing = true

    const newHeight = getContentHeight()

    // Only send if height changed and is reasonable
    if (newHeight > 0 && newHeight !== lastHeight && newHeight < 5000) {
      lastHeight = newHeight
      sendResize(newHeight)
    }

    // Allow new resize after a short delay
    setTimeout(() => {
      isResizing = false
    }, 50)
  }, RESIZE_DEBOUNCE_MS)
}

/**
 * Initialize auto-resize observer
 */
export function initAutoResize(): () => void {
  if (typeof window === 'undefined') return () => {}

  // Initial height report after render
  setTimeout(reportHeight, 100)

  // Observe content changes only (not attributes to avoid loops)
  const mutationObserver = new MutationObserver(() => {
    reportHeight()
  })

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
    // Don't watch attributes - causes infinite loops
  })

  // Return cleanup function
  return () => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout)
    }
    mutationObserver.disconnect()
  }
}

/**
 * Force height recalculation
 */
export function forceHeightUpdate(): void {
  lastHeight = 0
  isResizing = false
  reportHeight()
}
