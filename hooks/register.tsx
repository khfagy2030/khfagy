import { atom, read, update } from 'claude-code'
import type { Register, ThemeSetArgs } from 'claude-code'

import type { Activity, SessionTotals, Snapshot, TurnSummary } from '../types'
import { exportAudit, loadPolicy, resolveSecretRef, sendAlert, writeAudit } from './effects.js'
import { historyDir, isAllowedPlace } from './fence.js'
import type { AuditEvent, Policy } from './policy.js'
import { POLICY_FILE } from './policy.js'
import { findSecret, isDestructive, isSecretFile, parseList } from './guards.js'
import type { Lang } from './i18n.js'
import { isLang, strings } from './i18n.js'
import { makeColors } from './make-colors.js'
import type { DayStats } from './stats.js'
import { addDay, asDay, dayKey, emptyDay, formatDuration, formatTokens, tokensIn, tokensOut, topTools } from './stats.js'

const PANE = 'khfagy-activity'
const DAY_MS = 24 * 60 * 60 * 1000
const CHANGING_TOOLS = new Set(['Edit', 'Write', 'NotebookEdit', 'Bash', 'PowerShell'])

const activity = atom({ plugin: 'khfagy', key: 'activity' } as const, [], { shape: 'activity-1' })
const turns = atom({ plugin: 'khfagy', key: 'turns' } as const, [], { shape: 'turns-2' })
const totals = atom(
  { plugin: 'khfagy', key: 'totals' } as const,
  { turns: 0, tools: 0, failed: 0, blocked: 0, tokensIn: 0, tokensOut: 0 },
  { shape: 'totals-2' },
)
const isBandHidden = atom({ plugin: 'khfagy', key: 'isBandHidden' } as const, false)
const isLocked = atom({ plugin: 'khfagy', key: 'isLocked' } as const, false)
const history = atom({ plugin: 'khfagy', key: 'history' } as const, [], { shape: 'history-1' })

// Bright navy: sea spray by day, lit harbour by night.
const { theme, problems } = makeColors({
  label: 'khfagy',
  roles: { accent: '#1e88e5', danger: '#e53935', success: '#1fa774', warning: '#f0a020', pro: '#7c5cff' },
  light: {
    gray: {
      anchors: {
        'surface-0': '#eaf3fc',
        'surface-1': '#f2f8fe',
        'surface-2': '#fafdff',
        'text-primary': '#0a1a2b',
        'text-secondary': '#2c4560',
        'text-muted': '#46607a',
      },
    },
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#13253a',
        'surface-1': '#1a2f47',
        'surface-2': '#213954',
        'surface-3': '#26405c',
        'text-primary': '#f2f7fc',
        'text-secondary': '#c6d6e8',
        'text-muted': '#a3b9d0',
      },
    },
  },
})
const LOOK: ThemeSetArgs = { colors: theme }

const ICON: Record<Activity['status'], string> = {
  running: '◌',
  done: '✓',
  failed: '✗',
  blocked: '⛔',
}

const short = (text: string, max = 48) => (text.length > max ? `${text.slice(0, max - 1)}…` : text)

const detailOf = (e: { readonly [key: string]: unknown }): string => {
  for (const key of ['file_path', 'notebook_path', 'command', 'pattern', 'url', 'description', 'query']) {
    const value = e[key]
    if (typeof value === 'string' && value.length > 0) {
      return short(value.replace(/\s+/g, ' '))
    }
  }
  return ''
}

const pathOf = (e: { readonly [key: string]: unknown }): string | undefined => {
  for (const key of ['file_path', 'notebook_path']) {
    const value = e[key]
    if (typeof value === 'string') {
      return value
    }
  }
  return undefined
}

export const register: Register = (on, options) => {
  const lang: Lang = isLang(options.language) ? options.language : 'en'
  const t = strings(lang)
  const useTheme = options.theme !== false
  const soundOnDone = options.soundOnDone !== false
  const slowAfter = typeof options.slowTurnSeconds === 'number' ? options.slowTurnSeconds : 120
  const keepAudit = options.auditLog !== false
  // What a team policy may tighten at session start.
  let guardSecrets = options.guardSecrets !== false
  let guardReads = options.guardReads !== false
  let guardCommands = options.guardCommands !== false
  let guardPrompts = options.guardPrompts !== false
  let guardOutputs = options.guardOutputs !== false
  let guardFence = options.guardProjectFence !== false
  let keepHistory = options.timeMachine !== false
  let extraFiles = parseList(options.protectedPaths)
  let extraCommands = parseList(options.blockedCommands)
  let allowedPlaces = parseList(options.allowedPaths)
  let budget = typeof options.dailyTokenBudget === 'number' ? options.dailyTokenBudget : 0
  let budgetLock = options.budgetLock === true

  // This turn, in memory; written to the store when the turn ends.
  let turn: DayStats = emptyDay()
  let projectRoot: string | undefined
  let histDir = ''
  let budgetWarned = ''
  let policy: Policy | undefined
  let auditDir = ''
  let alertUrl = ''
  let user = ''
  let sessionId = ''
  const pending: AuditEvent[] = []
  const lastAlert = new Map<string, number>()

  const note = (at: number, kind: string, fields: Partial<AuditEvent> = {}) => {
    if (auditDir === '') {
      return
    }
    pending.push({
      at: new Date(at).toISOString(),
      user,
      session: sessionId,
      project: projectRoot ?? '',
      kind,
      tool: '',
      target: '',
      status: '',
      ms: 0,
      reason: '',
      ...fields,
    })
  }

  // Alerts: one per kind every 20 seconds at most.
  const shouldAlert = (kind: string, now: number) => {
    if (alertUrl === '' || now - (lastAlert.get(kind) ?? 0) < 20_000) {
      return false
    }
    lastAlert.set(kind, now)
    return true
  }

  on('session.start', async ($, e, next) => {
    try {
      projectRoot = await $.session.root()
    } catch {
      projectRoot = e.cwd
    }
    const now = await $.clock.now()
    histDir = `${historyDir($.plugin.root, e.cwd)}/${new Date(now).toISOString().replace(/[:.]/g, '-')}`
    try {
      sessionId = await $.session.id()
      user = (await $.env.get('USERNAME')) ?? (await $.env.get('USER')) ?? ''
    } catch {
      // identity is best effort
    }

    policy = projectRoot === undefined ? undefined : await loadPolicy($, projectRoot)
    if (policy !== undefined) {
      const p = policy
      guardPrompts ||= p.enforce.guardPrompts
      guardSecrets ||= p.enforce.guardSecrets
      guardReads ||= p.enforce.guardReads
      guardCommands ||= p.enforce.guardCommands
      guardOutputs ||= p.enforce.guardOutputs
      guardFence ||= p.enforce.guardProjectFence
      keepHistory ||= p.enforce.timeMachine
      extraFiles = [...extraFiles, ...p.protectedPaths]
      extraCommands = [...extraCommands, ...p.blockedCommands]
      allowedPlaces = [...allowedPlaces, ...p.allowedPaths]
      if (p.dailyTokenBudget > 0) {
        budget = p.dailyTokenBudget
        budgetLock = p.budgetLock
      }
      if (p.readOnly) {
        await update($, isLocked, () => true)
      }
    }

    const base = historyDir($.plugin.root, e.cwd).replace(/\/history$/, '')
    auditDir =
      policy !== undefined && policy.auditDir !== '' && projectRoot !== undefined
        ? `${projectRoot.replace(/[\\/]+$/, '')}/${policy.auditDir}`
        : keepAudit
          ? `${base}/audit`
          : ''
    const hook = policy !== undefined && policy.alertWebhook !== '' ? policy.alertWebhook : String(options.alertWebhook ?? '')
    alertUrl = hook === '' ? '' : await resolveSecretRef($, hook)

    if (useTheme && problems.every(line => !line.startsWith("Desktop won't paint"))) {
      await $.theme.set(LOOK)
    }
    await $.command.register({ name: 'khfagy', description: t.commandDesc })
    $.ui.toast(policy !== undefined ? t.readyPolicy(policy.name) : t.ready)
    note(now, 'session.start', { reason: policy !== undefined ? `policy: ${policy.name}` : '' })

    return next(e)
  })

  // ---- Commands ----
  on('command.run', { command: 'khfagy' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()

    if (arg === 'report') {
      const s = await read($, totals)
      const now = await $.clock.now()
      const today = addDay(asDay(await $.store.get(dayKey(now))), turn)
      const top = topTools(today.byTool)
      return {
        text: [
          `${t.report}`,
          '',
          `${t.thisSession}`,
          `  ${t.rowTurns}: ${s.turns}`,
          `  ${t.rowTools}: ${s.tools}`,
          `  ${t.rowFailed}: ${s.failed}`,
          `  ${t.rowBlocked}: ${s.blocked}`,
          `  ${t.rowTokens}: ${formatTokens(s.tokensIn)} / ${formatTokens(s.tokensOut)}`,
          '',
          `${t.today}`,
          `  ${t.rowTurns}: ${today.turns}`,
          `  ${t.rowTools}: ${today.tools}`,
          `  ${t.rowFailed}: ${today.failed}`,
          `  ${t.rowBlocked}: ${today.blocked}`,
          `  ${t.rowTime}: ${formatDuration(today.seconds)}`,
          `  ${t.rowTokens}: ${formatTokens(today.tokensIn)} / ${formatTokens(today.tokensOut)}`,
          `  ${t.topTools}: ${top.length > 0 ? top.map(([k, v]) => `${k} ${v}`).join(', ') : t.none}`,
        ].join('\n'),
      }
    }
    if (arg === 'help') {
      return { text: t.help }
    }
    if (arg === 'policy') {
      if (policy === undefined) {
        return { text: t.policyNone(POLICY_FILE) }
      }
      const enforced = Object.entries(policy.enforce)
        .filter(([, v]) => v)
        .map(([k]) => k)
      return {
        text: [
          t.policyTitle(policy.name),
          `  ${t.policyEnforced}: ${enforced.length > 0 ? enforced.join(', ') : t.none}`,
          `  ${t.policyProtected}: ${policy.protectedPaths.join(', ') || t.none}`,
          `  ${t.policyBlocked}: ${policy.blockedCommands.join(', ') || t.none}`,
          `  ${t.policyBudget}: ${policy.dailyTokenBudget > 0 ? formatTokens(policy.dailyTokenBudget) : t.none}`,
          `  ${t.policyReadOnly}: ${policy.readOnly ? '✓' : '—'}`,
          `  ${t.policyAudit}: ${auditDir || t.none}`,
          `  ${t.policyAlerts}: ${alertUrl !== '' ? '✓' : '—'}`,
        ].join('\n'),
      }
    }
    if (arg === 'audit') {
      if (auditDir === '') {
        return { text: t.auditOff }
      }
      if (pending.length > 0) {
        await writeAudit($, auditDir, pending.splice(0))
      }
      const now = await $.clock.now()
      const days = [6, 5, 4, 3, 2, 1, 0].map(i => new Date(now - i * DAY_MS).toISOString().slice(0, 10))
      const out = await exportAudit($, auditDir, days)
      return { text: t.auditExported(out.count, out.file) }
    }
    if (arg === 'history') {
      const list = await read($, history)
      if (list.length === 0) {
        return { text: t.historyEmpty }
      }
      return {
        text: [
          t.historyTitle,
          ...list
            .slice(-30)
            .reverse()
            .map(x => `  #${x.seq}  ${x.tool}  ${x.path}${x.existed ? '' : `  (${t.created})`}${x.isRestored ? `  ✓ ${t.restored}` : ''}`),
          '',
          t.historyHint,
        ].join('\n'),
      }
    }
    if (arg === 'undo' || arg.startsWith('undo ')) {
      const list = await read($, history)
      const wanted = Number(arg.slice(4).trim())
      const snap =
        arg === 'undo'
          ? [...list].reverse().find(x => !x.isRestored)
          : list.find(x => x.seq === wanted)
      if (snap === undefined) {
        return { text: t.undoNothing }
      }
      if (!snap.existed) {
        return { text: t.undoCreated(snap.path) }
      }
      await $.fs.write(snap.path, await $.fs.read(snap.file))
      await update($, history, all => all.map(x => (x.seq === snap.seq ? { ...x, isRestored: true } : x)))
      note(await $.clock.now(), 'undo', { target: snap.path, reason: `restored #${snap.seq}` })
      $.ui.toast(t.undone(snap.path))
      return { text: t.undone(snap.path) }
    }
    if (arg === 'budget') {
      const now = await $.clock.now()
      const today = addDay(asDay(await $.store.get(dayKey(now))), turn)
      const used = today.tokensIn + today.tokensOut
      return {
        text:
          budget > 0
            ? t.budgetStatus(formatTokens(used), formatTokens(budget), Math.round((used / budget) * 100))
            : t.budgetOff(formatTokens(used)),
      }
    }
    if (arg === 'lock') {
      await update($, isLocked, () => true)
      note(await $.clock.now(), 'lock')
      $.ui.toast(t.locked)
      return { text: t.locked }
    }
    if (arg === 'unlock') {
      if (policy?.readOnly === true) {
        return { text: t.unlockPolicy(policy.name) }
      }
      await update($, isLocked, () => false)
      note(await $.clock.now(), 'unlock')
      return { text: t.unlocked }
    }
    if (arg === 'stats') {
      const now = await $.clock.now()
      let week = emptyDay()
      const lines: string[] = []
      for (let i = 6; i >= 0; i--) {
        const key = dayKey(now - i * DAY_MS)
        const day = i === 0 ? addDay(asDay(await $.store.get(key)), turn) : asDay(await $.store.get(key))
        week = addDay(week, day)
        lines.push(
          `  ${key.slice(4)}  ${day.turns} · ${day.tools} · ${formatDuration(day.seconds)} · ${formatTokens(day.tokensIn + day.tokensOut)}`,
        )
      }
      const top = topTools(week.byTool)
      return {
        text: [
          `${t.report} · ${t.week}`,
          `  ${t.rowTurns} · ${t.rowTools} · ${t.rowTime} · ${t.rowTokens}`,
          ...lines,
          '',
          `${t.rowTurns}: ${week.turns}  ${t.rowTools}: ${week.tools}  ${t.rowFailed}: ${week.failed}  ${t.rowBlocked}: ${week.blocked}`,
          `${t.rowTime}: ${formatDuration(week.seconds)}`,
          `${t.rowTokens}: ${formatTokens(week.tokensIn)} / ${formatTokens(week.tokensOut)}`,
          `${t.topTools}: ${top.length > 0 ? top.map(([k, v]) => `${k} ${v}`).join(', ') : t.none}`,
        ].join('\n'),
      }
    }

    const opened = await $.ui.open({ id: PANE, title: t.paneTitle })
    return { text: opened.isPlaced ? t.opened : t.noPane }
  })

  // ---- Prompt shield (never send a key to the model) and turn start ----
  on('prompt.submit', async ($, e, next) => {
    if (guardPrompts && e.command === undefined) {
      const kind = findSecret(e.text)
      if (kind !== undefined) {
        const now = await $.clock.now()
        $.ui.toast(t.blockedPrompt(kind))
        note(now, 'blocked.prompt', { status: 'blocked', reason: kind })
        if (shouldAlert('prompt', now)) {
          void sendAlert($, alertUrl, t.alert(user, projectRoot ?? '', t.alertPrompt(kind)), 'blocked.prompt')
        }
        if (auditDir !== '' && pending.length > 0) {
          await writeAudit($, auditDir, pending.splice(0)).catch(() => undefined)
        }
        return { drop: t.blockedPrompt(kind) }
      }
    }
    if (budgetLock && budget > 0 && e.command === undefined && e.turnId === undefined) {
      const today = asDay(await $.store.get(dayKey(await $.clock.now())))
      if (today.tokensIn + today.tokensOut >= budget) {
        $.ui.toast(t.budgetLocked(formatTokens(budget)))
        return { drop: t.budgetLocked(formatTokens(budget)) }
      }
    }
    const ran = await next(e)
    if (ran.drop === undefined && e.turnId === undefined) {
      turn = emptyDay()
    }
    return ran
  }).catch(($, e, next) => (next.called ? next(e) : { drop: t.guardFailed }))

  // ---- Guardrails on tool calls ----
  on('tool.call', async ($, e, next) => {
    const path = pathOf(e)

    let reason: string | undefined
    if ((await read($, isLocked)) && CHANGING_TOOLS.has(e.tool)) {
      reason = t.blockedLocked(e.tool)
    } else if (path !== undefined && isSecretFile(path, extraFiles)) {
      if (guardSecrets && (e.tool === 'Edit' || e.tool === 'Write' || e.tool === 'NotebookEdit')) {
        reason = t.blockedFile(path)
      } else if (guardReads && e.tool === 'Read') {
        reason = t.blockedRead(path)
      }
    } else if (guardCommands && (e.tool === 'Bash' || e.tool === 'PowerShell')) {
      const command = (e as { readonly command?: unknown }).command
      if (typeof command === 'string' && isDestructive(command, extraCommands)) {
        reason = t.blockedCmd(short(command))
      }
    }
    const isChange = e.tool === 'Edit' || e.tool === 'Write' || e.tool === 'NotebookEdit'
    if (reason === undefined && isChange && path !== undefined && policy !== undefined) {
      if (path.replace(/\\/g, '/').toLowerCase().endsWith(`/${POLICY_FILE}`)) {
        reason = t.blockedPolicyFile
      }
    }
    if (reason === undefined && guardFence && isChange && path !== undefined) {
      if (!isAllowedPlace(path, projectRoot, allowedPlaces)) {
        reason = t.blockedFence(path)
      }
    }
    const denied = reason === undefined ? undefined : { deny: `khfagy: ${reason}` }
    if (reason !== undefined) {
      $.ui.toast(reason)
    }

    // Time machine: keep the file as it was before Claude changes it.
    if (denied === undefined && keepHistory && isChange && path !== undefined && histDir !== '') {
      try {
        const existed = await $.fs.exists(path)
        const size = existed ? (await $.fs.stat(path)).size : 0
        if (size <= 2 * 1024 * 1024) {
          const seq = (await read($, history)).reduce((m, x) => Math.max(m, x.seq), 0) + 1
          const file = `${histDir}/${seq}.snap`
          await $.fs.write(file, existed ? await $.fs.read(path) : '')
          const snap: Snapshot = { seq, path, tool: e.tool, existed, file, at: await $.clock.now(), isRestored: false }
          await update($, history, list => [...list, snap].slice(-200))
        }
      } catch {
        // a snapshot that cannot be taken never blocks the change
      }
    }

    // Activity log: a logging failure never blocks or breaks the call.
    const item: Activity = { id: e.tool_use_id, tool: e.tool, detail: detailOf(e), status: 'running', ms: 0 }
    let started = 0
    try {
      started = await $.clock.now()
      await update($, activity, list => [...list, item].slice(-300))
    } catch {
      // keep going
    }

    let ran = denied ?? (await next(e))

    // Output shield: a key printed by a command or found in a file never reaches the model.
    if (guardOutputs && ran.deny === undefined && typeof ran.text === 'string') {
      const kind = findSecret(ran.text)
      if (kind !== undefined) {
        $.ui.toast(t.withheldOutput(e.tool, kind))
        ran = { deny: `khfagy: ${t.withheldOutput(e.tool, kind)}` }
      }
    }

    const status: Activity['status'] =
      ran.deny !== undefined ? 'blocked' : 'isError' in ran && ran.isError === true ? 'failed' : 'done'

    try {
    const ended = await $.clock.now()
    const ms = started > 0 ? ended - started : 0

    // Audit trail and alerts. A key in the target never goes into the log.
    const rawTarget = detailOf(e)
    const target = findSecret(rawTarget) === undefined ? rawTarget : '[redacted]'
    const why = ran.deny !== undefined ? ran.deny.replace(/^khfagy: /, '') : ''
    note(ended, status === 'blocked' ? 'blocked.tool' : 'tool', { tool: e.tool, target, status, ms, reason: why })
    if (status === 'blocked' && why !== '' && shouldAlert(`tool:${e.tool}`, ended)) {
      void sendAlert($, alertUrl, t.alert(user, projectRoot ?? '', why), 'blocked.tool')
    }
    if (status === 'blocked' && auditDir !== '') {
      await writeAudit($, auditDir, pending.splice(0))
    }

    turn = {
      ...turn,
      tools: turn.tools + 1,
      failed: turn.failed + (status === 'failed' ? 1 : 0),
      blocked: turn.blocked + (status === 'blocked' ? 1 : 0),
      byTool: { ...turn.byTool, [e.tool]: (turn.byTool[e.tool] ?? 0) + 1 },
    }
    const s = await update($, totals, x => ({
      ...x,
      tools: x.tools + 1,
      failed: x.failed + (status === 'failed' ? 1 : 0),
      blocked: x.blocked + (status === 'blocked' ? 1 : 0),
    }))
    await update($, activity, list => list.map(one => (one.id === item.id ? { ...one, status, ms } : one)))
    $.ui.status(t.status(s.tools, s.failed + s.blocked))
    } catch {
      // keep going
    }

    return ran
  }).catch(($, e, next) => (next.called ? next(e) : { deny: t.guardFailed }))

  on('turn.complete', async ($, e, next) => {
    // A subagent's run ends too; count only the main conversation's turns.
    if (e.agentId !== undefined) {
      return next(e)
    }
    const now = await $.clock.now()
    const seconds = Math.round(e.durationMs / 1000)
    const inTok = tokensIn(e.usage)
    const outTok = tokensOut(e.usage)
    const s = await update($, totals, x => ({
      ...x,
      turns: x.turns + 1,
      tokensIn: x.tokensIn + inTok,
      tokensOut: x.tokensOut + outTok,
    }))
    const summary: TurnSummary = { n: s.turns, seconds, tools: turn.tools, failed: turn.failed, tokens: inTok + outTok }
    await update($, turns, list => [...list, summary].slice(-20))

    const key = dayKey(now)
    await $.store.set(
      key,
      addDay(asDay(await $.store.get(key)), { ...turn, turns: 1, seconds, tokensIn: inTok, tokensOut: outTok }),
    )
    turn = emptyDay()

    if (budget > 0) {
      const today = asDay(await $.store.get(key))
      const used = today.tokensIn + today.tokensOut
      if (used >= budget && budgetWarned !== `${key}:100`) {
        budgetWarned = `${key}:100`
        $.ui.toast(t.budgetOver(formatTokens(used), formatTokens(budget)))
        note(now, 'budget.over', { reason: `${used} of ${budget}` })
        if (shouldAlert('budget', now)) {
          void sendAlert($, alertUrl, t.alert(user, projectRoot ?? '', t.budgetOver(formatTokens(used), formatTokens(budget))), 'budget.over')
        }
      } else if (used >= budget * 0.8 && used < budget && budgetWarned === '') {
        budgetWarned = `${key}:80`
        $.ui.toast(t.budgetNear(formatTokens(used), formatTokens(budget)))
      }
    }

    if (slowAfter > 0 && seconds > slowAfter) {
      $.ui.toast(t.slow(formatDuration(seconds)))
    }
    if (soundOnDone && seconds >= 15) {
      void $.audio.play({ asset: 'sounds/done.wav' }).catch(() => undefined)
    }
    note(now, 'turn', { ms: e.durationMs, reason: `${inTok + outTok} tokens` })
    if (auditDir !== '' && pending.length > 0) {
      await writeAudit($, auditDir, pending.splice(0)).catch(() => undefined)
    }
    return next(e)
  })

  // ---- Band above the prompt ----
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) {
      return next(e)
    }
    const { Box, Button, Text } = $.ui.resolve(e)

    if (await read($, isLocked)) {
      return (
        <Box>
          <Text color="yellow">{t.lockedBand} </Text>
          <Button key="khfagy-unlock" label={t.unlock} onPress={() => update($, isLocked, () => false)} />
        </Box>
      )
    }

    const list = await read($, turns)
    const last = list[list.length - 1]
    if (last === undefined || (await read($, isBandHidden))) {
      return next(e)
    }
    return (
      <Box>
        <Text dimColor>{t.lastTurn(formatDuration(last.seconds), last.tools, last.failed)} </Text>
        <Button key="khfagy-hide" label={t.hide} onPress={() => update($, isBandHidden, () => true)} />
      </Box>
    )
  })

  // ---- Pane ----
  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const list = await read($, activity)
    const history = await read($, turns)
    const s: SessionTotals = await read($, totals)
    const locked = await read($, isLocked)
    const rows = e.viewport?.rows ?? 24
    const turnRows = history.slice(-5).reverse()
    const room = Math.max(1, rows - 8 - turnRows.length)

    return (
      <Box flexDirection="column">
        <Text bold>
          {t.sessionLine(s.turns, s.tools, s.failed, s.blocked, formatTokens(s.tokensIn + s.tokensOut))}
        </Text>
        {locked && <Text color="yellow">{t.lockedBand}</Text>}
        <Text> </Text>
        <Text bold>{t.sectionActivity}</Text>
        {list.length === 0 && <Text dimColor>{t.paneEmpty}</Text>}
        {list.slice(-room).map(item => (
          <Text
            dimColor={item.status === 'done'}
            color={item.status === 'done' || item.status === 'running' ? undefined : 'red'}
          >
            {ICON[item.status]} {item.tool}
            {item.detail ? ` · ${item.detail}` : ''}
            {item.status === 'running' ? '' : ` · ${(item.ms / 1000).toFixed(1)}s`}
          </Text>
        ))}
        {turnRows.length > 0 && <Text> </Text>}
        {turnRows.length > 0 && <Text bold>{t.sectionTurns}</Text>}
        {turnRows.map(x => (
          <Text dimColor>{t.turnLine(x.n, formatDuration(x.seconds), x.tools, x.failed, formatTokens(x.tokens))}</Text>
        ))}
      </Box>
    )
  })
}
