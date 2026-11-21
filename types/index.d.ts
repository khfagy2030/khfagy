export type Activity = {
  id: string
  tool: string
  detail: string
  status: 'running' | 'done' | 'failed' | 'blocked'
  ms: number
}

export type TurnSummary = { n: number; seconds: number; tools: number; failed: number; tokens: number }

export type SessionTotals = {
  turns: number
  tools: number
  failed: number
  blocked: number
  tokensIn: number
  tokensOut: number
}

export type Snapshot = {
  seq: number
  path: string
  tool: string
  existed: boolean
  file: string
  at: number
  isRestored: boolean
  /** The turn of the session the change belongs to (for /khfagy rewind). */
  turn?: number
}

declare module 'claude-code' {
  interface PluginState {
    khfagy: {
      activity: Shaped<Activity[]>
      turns: Shaped<TurnSummary[]>
      totals: Shaped<SessionTotals>
      isBandHidden: boolean
      isLocked: boolean
      history: Shaped<Snapshot[]>
    }
  }
}
