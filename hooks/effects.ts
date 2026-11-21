import type { EngineInterface } from 'claude-code'

import type { AuditEvent, Policy } from './policy.js'
import { alertRequest, parseAuditLines, parsePolicy, POLICY_FILE, toCsv } from './policy.js'
import { findSecret, isSecretFile } from './guards.js'
import type { GitAction } from './shields.js'
import { addedLines } from './shields.js'

/** The project's team policy, or undefined when there is none or it is broken. */
export async function loadPolicy($: EngineInterface, root: string): Promise<Policy | undefined> {
  const path = `${root.replace(/[\\/]+$/, '')}/${POLICY_FILE}`
  try {
    if (!(await $.fs.exists(path))) {
      return undefined
    }
    return parsePolicy(JSON.parse(await $.fs.read(path)))
  } catch {
    return undefined
  }
}

/**
 * "env" (or "env:KHFAGY_ALERT_WEBHOOK") reads the KHFAGY_ALERT_WEBHOOK environment
 * variable, so a webhook never has to sit in the repository.
 */
export async function resolveSecretRef($: EngineInterface, value: string): Promise<string> {
  if (value === 'env' || value.startsWith('env:')) {
    return (await $.env.get('KHFAGY_ALERT_WEBHOOK')) ?? ''
  }
  return value
}

/** Appends events to one .jsonl file per day. */
export async function writeAudit($: EngineInterface, dir: string, events: readonly AuditEvent[]): Promise<void> {
  const byDay = new Map<string, AuditEvent[]>()
  for (const ev of events) {
    const day = ev.at.slice(0, 10)
    byDay.set(day, [...(byDay.get(day) ?? []), ev])
  }
  for (const [day, list] of byDay) {
    const file = `${dir}/audit-${day}.jsonl`
    const before = (await $.fs.exists(file)) ? await $.fs.read(file) : ''
    const lines = list.map(ev => JSON.stringify(ev)).join('\n')
    await $.fs.write(file, before.length > 0 && !before.endsWith('\n') ? `${before}\n${lines}\n` : `${before}${lines}\n`)
  }
}

/** Writes the last `days` days of the audit log as one CSV file and says where. */
export async function exportAudit(
  $: EngineInterface,
  dir: string,
  dayKeys: readonly string[],
): Promise<{ file: string; count: number }> {
  const events: AuditEvent[] = []
  for (const day of dayKeys) {
    const file = `${dir}/audit-${day}.jsonl`
    if (await $.fs.exists(file)) {
      events.push(...parseAuditLines(await $.fs.read(file)))
    }
  }
  const file = `${dir}/khfagy-audit-${dayKeys[0]}_${dayKeys[dayKeys.length - 1]}.csv`
  await $.fs.write(file, `﻿${toCsv(events)}`)
  return { file, count: events.length }
}

/** Posts an alert to Slack, Teams, Discord, Telegram or any JSON webhook. Never throws. */
export async function sendAlert($: EngineInterface, url: string, text: string, event: string): Promise<boolean> {
  if (!/^https:\/\//i.test(url)) {
    return false
  }
  try {
    const request = alertRequest(url, text, event)
    const res = await $.http.fetch(request.url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: request.body,
    })
    return res.ok
  } catch {
    return false
  }
}

/** What a git commit or push is about to send that it should not: a secret file, or a key in an added line. */
export async function scanGit(
  $: EngineInterface,
  g: GitAction,
  root: string,
  extraFiles: readonly string[],
): Promise<{ file?: string; kind?: string } | undefined> {
  const git = async (...args: string[]) => {
    try {
      const r = await $.process.run(['git', ...args], { cwd: root === '' ? undefined : root, timeoutMs: 15_000 })
      return r.exitCode === 0 ? r.stdout : ''
    } catch {
      return ''
    }
  }
  const lines = (text: string) =>
    text
      .split('\n')
      .map(x => x.trim())
      .filter(x => x !== '')
  let names: string[]
  let diff: string
  if (g.kind === 'push') {
    names = lines(await git('log', '--name-only', '--format=', 'HEAD', '--not', '--remotes'))
    diff = await git('log', '-p', '--format=', 'HEAD', '--not', '--remotes')
  } else {
    names = lines(await git('diff', '--cached', '--name-only'))
    diff = await git('diff', '--cached')
    if (g.addsFirst) {
      names = [...names, ...lines(await git('diff', 'HEAD', '--name-only'))]
      diff += await git('diff', 'HEAD')
      const fresh = lines(await git('ls-files', '--others', '--exclude-standard'))
      names = [...names, ...fresh]
      for (const name of fresh.slice(0, 40)) {
        try {
          const file = `${root.replace(/[\\/]+$/, '')}/${name}`
          if ((await $.fs.stat(file)).size <= 256 * 1024) {
            diff += `\n${(await $.fs.read(file))
              .split('\n')
              .map(x => `+${x}`)
              .join('\n')}`
          }
        } catch {
          // an unreadable file is skipped
        }
      }
    }
  }
  const file = names.find(n => isSecretFile(n, extraFiles))
  if (file !== undefined) {
    return { file }
  }
  const kind = findSecret(addedLines(diff))
  return kind === undefined ? undefined : { kind }
}
