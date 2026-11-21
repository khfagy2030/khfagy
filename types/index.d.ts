export type Activity = {
  id: string
  tool: string
  detail: string
  status: 'running' | 'done' | 'failed' | 'blocked'
  ms: number
}

export type TurnSummary = { seconds: number; tools: number; failed: number }

declare module 'claude-code' {
  interface PluginState {
    khfagy: {
      activity: Shaped<Activity[]>
      lastTurn: TurnSummary | null
      isBandHidden: boolean
    }
  }
}
