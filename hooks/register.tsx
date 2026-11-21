import { atom, read, update } from 'claude-code'
import type { Register, ThemeSetArgs } from 'claude-code'

import type { Activity, TurnSummary } from '../types'
import { isDestructive, isSecretFile } from './guards.js'
import type { Lang } from './i18n.js'
import { strings } from './i18n.js'
import { makeColors } from './make-colors.js'

const PANE = 'khfagy-activity'

const activity = atom({ plugin: 'khfagy', key: 'activity' } as const, [], { shape: 'activity-1' })
const lastTurn = atom({ plugin: 'khfagy', key: 'lastTurn' } as const, null)
const isBandHidden = atom({ plugin: 'khfagy', key: 'isBandHidden' } as const, false)

// Bright navy: sea spray by day, lit harbour by night.
const { theme, problems } = makeColors({
  label: 'Khfagy',
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
  for (const key of ['file_path', 'command', 'pattern', 'url', 'description', 'query']) {
    const value = e[key]
    if (typeof value === 'string' && value.length > 0) {
      return short(value.replace(/\s+/g, ' '))
    }
  }
  return ''
}

export const register: Register = (on, options) => {
  const lang: Lang = options.language === 'ar' ? 'ar' : 'en'
  const t = strings(lang)
  const useTheme = options.theme !== false
  const guardSecrets = options.guardSecrets !== false
  const guardCommands = options.guardCommands !== false
  const slowAfter = typeof options.slowTurnSeconds === 'number' ? options.slowTurnSeconds : 120

  let total = 0
  let failed = 0
  let turnStart = 0
  let turnTools = 0
  let turnFailed = 0

  on('session.start', async ($, e, next) => {
    if (useTheme) {
      const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))
      if (unpainted === undefined) {
        await $.theme.set(LOOK)
      }
    }
    await $.command.register({ name: 'khfagy', description: t.commandDesc })
    $.ui.toast(t.ready)

    return next(e)
  })

  on('command.run', { command: 'khfagy' }, async $ => {
    const opened = await $.ui.open({ id: PANE, title: t.paneTitle })
    return { text: opened.isPlaced ? t.opened : t.noPane }
  })

  // ---- Guardrails ----
  on('tool.call', { tool: 'Edit' }, ($, e, next) => {
    if (guardSecrets && isSecretFile(e.file_path)) {
      $.ui.toast(t.blockedFile(e.file_path))
      return { deny: `khfagy: ${e.file_path} is a protected secret file.` }
    }
    return next(e)
  }).catch(($, e, next) => (next.called ? next(e) : { deny: t.guardFailed }))

  on('tool.call', { tool: 'Write' }, ($, e, next) => {
    if (guardSecrets && isSecretFile(e.file_path)) {
      $.ui.toast(t.blockedFile(e.file_path))
      return { deny: `khfagy: ${e.file_path} is a protected secret file.` }
    }
    return next(e)
  }).catch(($, e, next) => (next.called ? next(e) : { deny: t.guardFailed }))

  on('tool.call', { tool: 'Bash' }, ($, e, next) => {
    if (guardCommands && isDestructive(e.command)) {
      $.ui.toast(t.blockedCmd(short(e.command)))
      return { deny: `khfagy: blocked a destructive command: ${e.command}` }
    }
    return next(e)
  }).catch(($, e, next) => (next.called ? next(e) : { deny: t.guardFailed }))

  on('tool.call', { tool: 'PowerShell' }, ($, e, next) => {
    if (guardCommands && isDestructive(e.command)) {
      $.ui.toast(t.blockedCmd(short(e.command)))
      return { deny: `khfagy: blocked a destructive command: ${e.command}` }
    }
    return next(e)
  }).catch(($, e, next) => (next.called ? next(e) : { deny: t.guardFailed }))

  // ---- Activity log ----
  on('tool.call', async ($, e, next) => {
    const started = await $.clock.now()
    const item: Activity = { id: e.tool_use_id, tool: e.tool, detail: detailOf(e), status: 'running', ms: 0 }
    await update($, activity, list => [...list, item].slice(-300))

    const ran = await next(e)
    const status: Activity['status'] =
      ran.deny !== undefined ? 'blocked' : ran.isError === true ? 'failed' : 'done'
    const ms = (await $.clock.now()) - started

    total += 1
    turnTools += 1
    if (status === 'failed' || status === 'blocked') {
      failed += 1
      turnFailed += 1
    }
    await update($, activity, list => list.map(one => (one.id === item.id ? { ...one, status, ms } : one)))
    $.ui.status(t.status(total, failed))

    return ran
  })

  // ---- Turn summary ----
  on('prompt.submit', async ($, e, next) => {
    turnStart = await $.clock.now()
    turnTools = 0
    turnFailed = 0
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const seconds = Math.round(((await $.clock.now()) - turnStart) / 1000)
    const summary: TurnSummary = { seconds, tools: turnTools, failed: turnFailed }
    await update($, lastTurn, () => summary)
    if (slowAfter > 0 && seconds > slowAfter) {
      $.ui.toast(t.slow(seconds))
    }
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const turn = await read($, lastTurn)
    if (e.props.hasSurvey || turn === null || (await read($, isBandHidden))) {
      return next(e)
    }
    const { Box, Button, Text } = $.ui.resolve(e)

    return (
      <Box>
        <Text dimColor>{t.lastTurn(turn.seconds, turn.tools, turn.failed)} </Text>
        <Button key="khfagy-hide" label={t.hide} onPress={() => update($, isBandHidden, () => true)} />
      </Box>
    )
  })

  // ---- Activity pane ----
  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const list = await read($, activity)
    const room = Math.max(1, (e.viewport?.rows ?? 24) - 4)

    return (
      <Box flexDirection="column">
        {list.length === 0 && <Text dimColor>{t.paneEmpty}</Text>}
        {list.slice(-room).map(item => (
          <Text dimColor={item.status === 'done'} color={item.status === 'done' || item.status === 'running' ? undefined : 'red'}>
            {ICON[item.status]} {item.tool}
            {item.detail ? ` · ${item.detail}` : ''}
            {item.status === 'running' ? '' : ` · ${(item.ms / 1000).toFixed(1)}s`}
          </Text>
        ))}
      </Box>
    )
  })
}
