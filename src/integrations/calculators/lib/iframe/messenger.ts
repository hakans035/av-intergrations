import type {
  IFrameMessage,
  IFrameMessageType,
  MessagePayloadMap,
} from '../../types/iframe'
import { MESSAGE_SOURCE, MESSAGE_VERSION } from '../constants'

/**
 * Create a structured iFrame message
 */
export function createMessage<T extends IFrameMessageType>(
  type: T,
  payload: MessagePayloadMap[T]
): IFrameMessage<MessagePayloadMap[T]> {
  return {
    type,
    payload,
    source: MESSAGE_SOURCE,
    version: MESSAGE_VERSION,
    timestamp: Date.now(),
  }
}

/**
 * Send message to parent window
 */
export function sendToParent<T extends IFrameMessageType>(
  type: T,
  payload: MessagePayloadMap[T],
  targetOrigin = '*'
): void {
  if (typeof window === 'undefined') return
  if (window.parent === window) return // Not in iframe

  const message = createMessage(type, payload)

  try {
    window.parent.postMessage(message, targetOrigin)
  } catch (error) {
    console.error('[iFrame] Failed to send message:', error)
  }
}

/**
 * Validate incoming message is from our system
 */
export function isValidMessage(
  event: MessageEvent
): event is MessageEvent<IFrameMessage> {
  const data = event.data

  return (
    typeof data === 'object' &&
    data !== null &&
    data.source === MESSAGE_SOURCE &&
    typeof data.type === 'string' &&
    typeof data.timestamp === 'number'
  )
}

/**
 * Check if running inside an iframe
 */
export function isInIframe(): boolean {
  if (typeof window === 'undefined') return false
  return window.parent !== window
}

/**
 * Send READY message to parent
 */
export function sendReady(slug: string, version: string): void {
  sendToParent('READY', { slug, version })
}

/**
 * Send RESIZE message to parent
 */
export function sendResize(height: number, width?: number): void {
  sendToParent('RESIZE', { height, width })
}

/**
 * Send ERROR message to parent
 */
export function sendError(
  code: string,
  message: string,
  recoverable = true
): void {
  sendToParent('ERROR', { code, message, recoverable })
}

/**
 * Send PONG response to parent
 */
export function sendPong(uptime: number): void {
  sendToParent('PONG', { uptime, timestamp: Date.now() })
}
