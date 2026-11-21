import { describe, expect, test } from 'claude-code/testing'
import type { On } from 'claude-code'

import { isDestructive, isSecretFile } from './guards.js'

// Stand in for the engine's clock, toasts, status line and theme.
const engine = (on: On) => {
  let now = 1000
  on('clock.now', () => ({ value: (now += 250) }))
  on('ui.toast', () => ({ value: undefined }))
  on('ui.status', () => ({ value: undefined }))
  on('theme.set', () => ({ value: { isDrawn: true } }))
  on('tool.call', () => ({ result: {} }))
}

describe('guards', () => {
  test('secret files are recognised', () => {
    for (const p of ['C:/app/.env', '/srv/.env.production', '/home/u/.ssh/id_rsa', 'certs/server.pem', 'credentials.json']) {
      expect(isSecretFile(p)).toBe(true)
    }
    for (const p of ['/app/.env.example', '/app/src/env.ts', 'README.md', 'keyboard.tsx']) {
      expect(isSecretFile(p)).toBe(false)
    }
  })

  test('destructive commands are recognised', () => {
    for (const c of ['rm -rf /', 'sudo rm -rf ~', 'rm -fr *', 'git push --force origin main', 'git push -f', 'Remove-Item -Recurse -Force C:\\']) {
      expect(isDestructive(c)).toBe(true)
    }
    for (const c of ['rm -rf node_modules', 'git push --force-with-lease', 'git push origin main', 'ls -la']) {
      expect(isDestructive(c)).toBe(false)
    }
  })
})

test('an edit to .env is blocked', async ($, on) => {
  engine(on)
  const ran = await $.tool.call({ tool: 'Edit', file_path: '/app/.env', old_string: 'a', new_string: 'b' })
  expect(ran.deny).toBeDefined()
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

const pane = (surface: 'terminal' | 'desktop' | 'vscode' | 'mobile') =>
  ({
    plugin: 'khfagy',
    component: 'Pane',
    requestId: 'khfagy-activity',
    surface,
    props: {
      title: 'Activity',
      isFocused: false,
      bodyColumns: 60,
      placement: 'dock',
      scroll: { offset: 0, bodyRows: 20 },
      view: {},
    },
  }) as const

test('the activity pane lists a call on every surface', async ($, on) => {
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
  expect((await ui.find({ type: 'Text' }))?.text).toBe('لا يوجد نشاط بعد.')
  await ui.unmount()
})
