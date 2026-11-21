export type DayStats = {
  turns: number
  tools: number
  failed: number
  blocked: number
  seconds: number
  tokensIn: number
  tokensOut: number
  byTool: Record<string, number>
}

export const emptyDay = (): DayStats => ({
  turns: 0,
  tools: 0,
  failed: 0,
  blocked: 0,
  seconds: 0,
  tokensIn: 0,
  tokensOut: 0,
  byTool: {},
})

export const dayKey = (ms: number) => `day:${new Date(ms).toISOString().slice(0, 10)}`

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0)

export const asDay = (raw: unknown): DayStats => {
  if (typeof raw !== 'object' || raw === null) {
    return emptyDay()
  }
  const r = raw as Partial<Record<keyof DayStats, unknown>>
  const byTool: Record<string, number> = {}
  if (typeof r.byTool === 'object' && r.byTool !== null) {
    for (const [k, v] of Object.entries(r.byTool)) {
      byTool[k] = num(v)
    }
  }
  return {
    turns: num(r.turns),
    tools: num(r.tools),
    failed: num(r.failed),
    blocked: num(r.blocked),
    seconds: num(r.seconds),
    tokensIn: num(r.tokensIn),
    tokensOut: num(r.tokensOut),
    byTool,
  }
}

export const addDay = (a: DayStats, b: DayStats): DayStats => {
  const byTool = { ...a.byTool }
  for (const [k, v] of Object.entries(b.byTool)) {
    byTool[k] = (byTool[k] ?? 0) + v
  }
  return {
    turns: a.turns + b.turns,
    tools: a.tools + b.tools,
    failed: a.failed + b.failed,
    blocked: a.blocked + b.blocked,
    seconds: a.seconds + b.seconds,
    tokensIn: a.tokensIn + b.tokensIn,
    tokensOut: a.tokensOut + b.tokensOut,
    byTool,
  }
}

/** Input tokens of every kind (uncached, cache reads and cache writes). */
export const tokensIn = (usage: unknown): number => {
  if (typeof usage !== 'object' || usage === null) {
    return 0
  }
  const u = usage as Record<string, unknown>
  return num(u.input_tokens) + num(u.cache_read_input_tokens) + num(u.cache_creation_input_tokens)
}

export const tokensOut = (usage: unknown): number =>
  typeof usage === 'object' && usage !== null ? num((usage as Record<string, unknown>).output_tokens) : 0

export const topTools = (byTool: Record<string, number>, n = 5) =>
  Object.entries(byTool)
    .sort((x, y) => y[1] - x[1])
    .slice(0, n)

export const formatDuration = (seconds: number) => {
  const s = Math.round(seconds)
  if (s < 60) {
    return `${s}s`
  }
  const m = Math.floor(s / 60)
  if (m < 60) {
    return `${m}m ${s % 60}s`
  }
  return `${Math.floor(m / 60)}h ${m % 60}m`
}

export const formatTokens = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`
