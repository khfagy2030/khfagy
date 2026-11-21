// Files that usually hold secrets: .env files, private keys, credential stores.
const SECRET_FILE =
  /(^|[\\/])(\.env(\.[\w.-]+)?|id_(rsa|ed25519|ecdsa|dsa)|[^\\/]*\.(pem|key|p12|pfx)|credentials(\.json)?|\.npmrc|\.pypirc|\.netrc|\.git-credentials)$/i

// Committed templates such as .env.example stay usable.
const TEMPLATE = /\.env\.(example|sample|template|dist)$/i

/** Comma-separated user patterns: "secrets/, *.sqlite, config/prod.json" */
export const parseList = (raw: unknown): string[] =>
  typeof raw === 'string'
    ? raw
        .split(',')
        .map(part => part.trim())
        .filter(part => part.length > 0)
    : []

const norm = (path: string) => path.replace(/\\/g, '/').toLowerCase()

const matchesPattern = (path: string, pattern: string) => {
  const p = norm(pattern)
  const target = norm(path)
  if (p.startsWith('*.')) {
    return target.endsWith(p.slice(1))
  }
  if (p.endsWith('/')) {
    return target.includes(`/${p}`) || target.startsWith(p)
  }
  return target === p || target.endsWith(`/${p}`)
}

export const isSecretFile = (path: string, extra: readonly string[] = []) =>
  (SECRET_FILE.test(path) && !TEMPLATE.test(path)) || extra.some(pattern => matchesPattern(path, pattern))

const DESTRUCTIVE: readonly RegExp[] = [
  // rm -rf on the filesystem root, the home folder, or everything
  /\brm\s+(-[a-z]*r[a-z]*f[a-z]*|-[a-z]*f[a-z]*r[a-z]*|--recursive\s+--force|--force\s+--recursive)\s+(\/|~|\$HOME|\*|\/\*)(\s|$)/i,
  // force push (but not --force-with-lease)
  /\bgit\s+push\b.*(\s--force(?!-with-lease)\b|\s-f\b)/i,
  // PowerShell: recursive delete of a drive root or home
  /\bRemove-Item\b.*-Recurse\b.*\s([A-Z]:\\?|~|\$HOME)(\s|$)/i,
  // wiping disks and filesystems
  /\b(mkfs(\.\w+)?|format\s+[A-Z]:|diskpart\b.*\bclean\b|dd\s+.*of=\/dev\/(sd|nvme|disk))/i,
  // fork bomb
  /:\(\)\s*\{\s*:\|:&\s*\};:/,
  // dropping whole databases
  /\bDROP\s+(DATABASE|SCHEMA)\b/i,
]

export const isDestructive = (command: string, extra: readonly string[] = []) =>
  DESTRUCTIVE.some(re => re.test(command)) ||
  extra.some(word => command.toLowerCase().includes(word.toLowerCase()))

// Known key and token formats, for a prompt about to be sent.
const KEY_FORMATS: readonly (readonly [string, RegExp])[] = [
  ['Anthropic API key', /\bsk-ant-[A-Za-z0-9_-]{20,}/],
  ['OpenAI API key', /\bsk-(proj-)?[A-Za-z0-9_-]{32,}/],
  ['GitHub token', /\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}|\bgithub_pat_[A-Za-z0-9_]{40,}/],
  ['AWS access key', /\b(AKIA|ASIA)[0-9A-Z]{16}\b/],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['Slack token', /\bxox[abposr]-[A-Za-z0-9-]{10,}/],
  ['Stripe live key', /\b(sk|rk)_live_[0-9A-Za-z]{20,}/],
  ['private key', /-----BEGIN ([A-Z]+ )?PRIVATE KEY-----/],
]

/** The kind of secret found in text, or undefined. */
export const findSecret = (text: string): string | undefined =>
  KEY_FORMATS.find(([, re]) => re.test(text))?.[0]
