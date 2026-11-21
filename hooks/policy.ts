// A team policy: khfagy.policy.json at the project root, committed with the code.
// What it turns on cannot be turned off by one developer's own settings.

export const POLICY_FILE = 'khfagy.policy.json'

export type Policy = {
  name: string
  enforce: {
    guardPrompts: boolean
    guardSecrets: boolean
    guardReads: boolean
    guardCommands: boolean
    guardOutputs: boolean
    guardProjectFence: boolean
    timeMachine: boolean
  }
  protectedPaths: string[]
  blockedCommands: string[]
  allowedPaths: string[]
  dailyTokenBudget: number
  budgetLock: boolean
  readOnly: boolean
  auditDir: string
  alertWebhook: string
}

const bool = (v: unknown) => v === true
const strings = (v: unknown) =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim().length > 0).map(x => x.trim()) : []
const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

/** Reads a policy file's JSON; anything malformed is ignored, never thrown. */
export const parsePolicy = (raw: unknown): Policy | undefined => {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return undefined
  }
  const r = raw as Record<string, unknown>
  const enforce = (typeof r.enforce === 'object' && r.enforce !== null ? r.enforce : {}) as Record<string, unknown>
  const audit = (typeof r.audit === 'object' && r.audit !== null ? r.audit : {}) as Record<string, unknown>
  const alerts = (typeof r.alerts === 'object' && r.alerts !== null ? r.alerts : {}) as Record<string, unknown>
  const budget = typeof r.dailyTokenBudget === 'number' && r.dailyTokenBudget > 0 ? r.dailyTokenBudget : 0
  return {
    name: str(r.name) || 'Team policy',
    enforce: {
      guardPrompts: bool(enforce.guardPrompts),
      guardSecrets: bool(enforce.guardSecrets),
      guardReads: bool(enforce.guardReads),
      guardCommands: bool(enforce.guardCommands),
      guardOutputs: bool(enforce.guardOutputs),
      guardProjectFence: bool(enforce.guardProjectFence),
      timeMachine: bool(enforce.timeMachine),
    },
    protectedPaths: strings(r.protectedPaths),
    blockedCommands: strings(r.blockedCommands),
    allowedPaths: strings(r.allowedPaths),
    dailyTokenBudget: budget,
    budgetLock: bool(r.budgetLock),
    readOnly: bool(r.readOnly),
    auditDir: str(audit.dir),
    alertWebhook: str(alerts.webhook),
  }
}

export type AuditEvent = {
  at: string
  user: string
  session: string
  project: string
  kind: string
  tool: string
  target: string
  status: string
  ms: number
  reason: string
}

const CSV_COLUMNS: readonly (keyof AuditEvent)[] = [
  'at',
  'user',
  'session',
  'project',
  'kind',
  'tool',
  'target',
  'status',
  'ms',
  'reason',
]

const cell = (v: unknown) => {
  const s = String(v ?? '')
  // A leading = + - @ would run as a formula in Excel: keep it text.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

export const toCsv = (events: readonly AuditEvent[]) =>
  [CSV_COLUMNS.join(','), ...events.map(ev => CSV_COLUMNS.map(c => cell(ev[c])).join(','))].join('\r\n')

/** Parses the lines of an audit .jsonl file, skipping any broken line. */
export const parseAuditLines = (text: string): AuditEvent[] =>
  text
    .split('\n')
    .filter(line => line.trim().length > 0)
    .flatMap(line => {
      try {
        return [JSON.parse(line) as AuditEvent]
      } catch {
        return []
      }
    })

/** The body a webhook expects: Slack and Teams read text, Discord content, Telegram chat_id + text. */
export const alertRequest = (url: string, text: string, event: string): { url: string; body: string } => {
  if (/api\.telegram\.org/i.test(url)) {
    let chatId = ''
    let target = url
    try {
      const parsed = new URL(url)
      chatId = parsed.searchParams.get('chat_id') ?? ''
      parsed.search = ''
      target = parsed.toString()
    } catch {
      // keep the url as given
    }
    return { url: target, body: JSON.stringify({ chat_id: chatId, text }) }
  }
  return { url, body: JSON.stringify({ text, content: text, event }) }
}
