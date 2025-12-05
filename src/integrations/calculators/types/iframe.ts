// Message types for iFrame communication
export type IFrameMessageType =
  | 'READY'
  | 'RESIZE'
  | 'ERROR'
  | 'RESULT'
  | 'CONFIG'
  | 'PING'
  | 'PONG'

// Base message structure
export interface IFrameMessage<T = unknown> {
  type: IFrameMessageType
  payload: T
  source: 'av-calculator'
  version: string
  timestamp: number
}

// Specific message payloads
export interface ReadyPayload {
  slug: string
  version: string
}

export interface ResizePayload {
  height: number
  width?: number
}

export interface ErrorPayload {
  code: string
  message: string
  recoverable: boolean
}

export interface ConfigPayload {
  theme?: 'light' | 'dark'
  locale?: string
  colors?: {
    bg?: string
    accent?: string
    text?: string
  }
}

export interface PingPayload {
  timestamp: number
}

export interface PongPayload {
  uptime: number
  timestamp: number
}

// Message creators type map
export type MessagePayloadMap = {
  READY: ReadyPayload
  RESIZE: ResizePayload
  ERROR: ErrorPayload
  RESULT: Record<string, unknown>
  CONFIG: ConfigPayload
  PING: PingPayload
  PONG: PongPayload
}

// Allowed origins configuration
export interface OriginConfig {
  allowedOrigins: string[]
  allowAll: boolean
}
