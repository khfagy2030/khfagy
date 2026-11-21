import { describe, expect, test } from 'claude-code/testing'
import type { On } from 'claude-code'

import { findSecret, isDestructive, isSecretFile, parseList } from './guards.js'
import { addDay, asDay, emptyDay, formatDuration, topTools } from './stats.js'

// Stand in for the engine's clock, store, toasts, status line, theme and audio.
const engine = (on: On) => {
  let now = Date.UTC(2026, 10, 21, 9, 0, 0)
  const store = new Map<string, unknown>()
  on('clock.now', () => ({ value: (now += 1000) }))
  on('store.get', (_, e) => ({ value: store.get(e.key) }))
  on('store.set', (_, e) => {
    store.set(e.key, e.value)
    return { value: undefined }
  })
  on('ui.toast', () => ({ value: undefined }))
  on('ui.status', () => ({ value: undefined }))
  on('audio.play', () => ({ value: undefined }))
  on('theme.set', () => ({ value: { isDrawn: true, requestId: 't' } }))
  on('tool.call', () => ({ result: {} }))
  return store
}

const prompt = (text: string) => ({ text, wait: false, origin: { kind: 'composer' as const } })
const cmd = (args: string) => ({
  command: 'khfagy',
  args,
  origin: { kind: 'composer' as const },
  presentation: { isFullscreen: false, columns: 80 },
})

// Built at run time so no real-looking key sits in the source.
const fakeGithubToken = () => `ghp_${'a1B2'.repeat(9)}`
const fakeAwsKey = () => `AKIA${'Q'.repeat(16)}`

describe('guards', () => {
  test('secret files are recognised', () => {
    for (const p of ['C:/app/.env', '/srv/.env.production', '/home/u/.ssh/id_rsa', 'certs/server.pem', 'credentials.json', '/u/.git-credentials']) {
      expect(isSecretFile(p)).toBe(true)
    }
    for (const p of ['/app/.env.example', '/app/src/env.ts', 'README.md', 'keyboard.tsx']) {
      expect(isSecretFile(p)).toBe(false)
    }
  })

  test('extra protected paths', () => {
    const extra = parseList('secrets/, *.sqlite, config/prod.json')
    expect(isSecretFile('/app/secrets/a.txt', extra)).toBe(true)
    expect(isSecretFile('C:\\data\\shop.sqlite', extra)).toBe(true)
    expect(isSecretFile('/app/config/prod.json', extra)).toBe(true)
    expect(isSecretFile('/app/config/dev.json', extra)).toBe(false)
  })

  test('destructive commands are recognised', () => {
    for (const c of ['rm -rf /', 'sudo rm -rf ~', 'rm -fr *', 'git push --force origin main', 'git push -f', 'Remove-Item -Recurse -Force C:\\', 'mkfs.ext4 /dev/sda1', 'psql -c "DROP DATABASE shop"']) {
      expect(isDestructive(c)).toBe(true)
    }
    for (const c of ['rm -rf node_modules', 'git push --force-with-lease', 'git push origin main', 'ls -la']) {
      expect(isDestructive(c)).toBe(false)
    }
    expect(isDestructive('terraform destroy -auto-approve', ['terraform destroy'])).toBe(true)
  })

  test('secrets in text are found', () => {
    expect(findSecret(`here is my token ${fakeGithubToken()}`)).toBe('GitHub token')
    expect(findSecret(`key ${fakeAwsKey()}`)).toBe('AWS access key')
    expect(findSecret('please fix the login bug')).toBeUndefined()
  })
})

describe('stats', () => {
  test('days add up and bad data is cleaned', () => {
    const a = { ...emptyDay(), turns: 1, tools: 3, byTool: { Bash: 2, Read: 1 } }
    const b = asDay({ turns: 2, tools: 'x', byTool: { Bash: 1 } })
    const sum = addDay(a, b)
    expect(sum.turns).toBe(3)
    expect(sum.tools).toBe(3)
    expect(topTools(sum.byTool)[0]).toEqual(['Bash', 3])
    expect(formatDuration(75)).toBe('1m 15s')
  })
})

test('an edit to .env is blocked', async ($, on) => {
  engine(on)
  const ran = await $.tool.call({ tool: 'Edit', file_path: '/app/.env', old_string: 'a', new_string: 'b' })
  expect(ran.deny).toBeDefined()
})

test('reading a private key is blocked, reading code is not', async ($, on) => {
  engine(on)
  expect((await $.tool.call({ tool: 'Read', file_path: '/home/u/.ssh/id_rsa' })).deny).toBeDefined()
  expect((await $.tool.call({ tool: 'Read', file_path: '/app/src/index.ts' })).deny).toBeUndefined()
})

test('a force push is blocked, a normal push is not', async ($, on) => {
  engine(on)
  expect((await $.tool.call({ tool: 'Bash', command: 'git push --force' })).deny).toBeDefined()
  expect((await $.tool.call({ tool: 'Bash', command: 'git push' })).deny).toBeUndefined()
})

test('guards can be turned off', { options: { guardSecrets: false } }, async ($, on) => {
  engine(on)
  const ran = await $.tool.call({ tool: 'Edit', file_path: '/app/.env', old_string: 'a', new_string: 'b' })
  expect(ran.deny).toBeUndefined()
})

test('a prompt holding a token is not sent', async ($, on) => {
  engine(on)
  on('prompt.submit', (_, e) => ({ text: e.text }))
  const ran = await $.prompt.submit(prompt(`deploy with ${fakeGithubToken()}`))
  expect(ran.drop).toBeDefined()
  const ok = await $.prompt.submit(prompt('deploy the app'))
  expect(ok.drop).toBeUndefined()
})

test('review mode blocks changes until unlocked', async ($, on) => {
  engine(on)
  on('command.register', () => ({ value: { command: 'khfagy' } }))
  await $.command.run(cmd('lock'))
  expect((await $.tool.call({ tool: 'Write', file_path: '/app/a.ts', content: 'x' })).deny).toBeDefined()
  expect((await $.tool.call({ tool: 'Read', file_path: '/app/a.ts' })).deny).toBeUndefined()
  await $.command.run(cmd('unlock'))
  expect((await $.tool.call({ tool: 'Write', file_path: '/app/a.ts', content: 'x' })).deny).toBeUndefined()
})

test('a finished turn is saved to the daily stats and the report', async ($, on) => {
  const store = engine(on)
  on('prompt.submit', (_, e) => ({ text: e.text }))
  on('turn.complete', (_, e) => ({ text: e.answer }))
  await $.prompt.submit(prompt('hi'))
  await $.tool.call({ tool: 'Bash', command: 'ls' })
  await $.tool.call({ tool: 'Read', file_path: '/app/a.ts' })
  await $.turn.complete({
    answer: 'done',
    durationMs: 20000,
    isAborted: false,
    turnId: 't1',
    reason: 'answer',
    usage: { input_tokens: 100, output_tokens: 50, cache_read_input_tokens: 1000, cache_creation_input_tokens: 0, model: 'm' },
  })

  const day = asDay(store.get('day:2026-11-21'))
  expect(day.turns).toBe(1)
  expect(day.tools).toBe(2)
  expect(day.seconds).toBe(20)
  expect(day.tokensIn).toBe(1100)
  expect(day.tokensOut).toBe(50)

  const report = await $.command.run(cmd('report'))
  expect(report.text).toMatch(/Tool calls: 2/)
})

const pane = (surface: 'terminal' | 'desktop' | 'vscode' | 'mobile') =>
  ({
    plugin: 'khfagy',
    component: 'Pane',
    requestId: 'khfagy-activity',
    surface,
    props: {
      title: 'khfagy',
      isFocused: false,
      bodyColumns: 60,
      placement: 'dock',
      scroll: { offset: 0, bodyRows: 20 },
      view: {},
    },
  }) as const

test('the pane lists a call on every surface', async ($, on) => {
  on('command.register', () => ({ value: { command: 'khfagy' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  engine(on)

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  await $.tool.call({ tool: 'Bash', command: 'ls' })

  for (const surface of ['terminal', 'desktop', 'vscode', 'mobile'] as const) {
    const ui = await $.ui.mount(pane(surface))
    const row = await ui.find({ type: 'Text', text: /Bash/ })
    expect(row?.text).toMatch(/^✓ Bash · ls · \d+\.\ds$/)
    await ui.unmount()
  }
})

test('Arabic interface', { options: { language: 'ar' } }, async $ => {
  const ui = await $.ui.mount(pane('desktop'))
  expect((await ui.find({ type: 'Text', text: /لا يوجد/ }))?.text).toBe('لا يوجد نشاط بعد.')
  await ui.unmount()
})
