// Files that usually hold secrets: .env files, private keys, credential stores.
const SECRET_FILE =
  /(^|[\\/])(\.env(\.[\w.-]+)?|id_(rsa|ed25519|ecdsa|dsa)|[^\\/]*\.(pem|key|p12|pfx)|credentials(\.json)?|\.npmrc|\.pypirc)$/i

// Allow committed templates such as .env.example.
const TEMPLATE = /\.env\.(example|sample|template)$/i

export const isSecretFile = (path: string) => SECRET_FILE.test(path) && !TEMPLATE.test(path)

const DESTRUCTIVE: readonly RegExp[] = [
  // rm -rf on the filesystem root, the home folder, or everything
  /\brm\s+(-[a-z]*r[a-z]*f[a-z]*|-[a-z]*f[a-z]*r[a-z]*|--recursive\s+--force|--force\s+--recursive)\s+(\/|~|\$HOME|\*|\/\*)(\s|$)/i,
  // force push (but not --force-with-lease)
  /\bgit\s+push\b.*(\s--force(?!-with-lease)\b|\s-f\b)/i,
  // PowerShell: recursive forced delete of a drive root or home
  /\bRemove-Item\b.*-Recurse\b.*\s([A-Z]:\\?|~|\$HOME)(\s|$)/i,
]

export const isDestructive = (command: string) => DESTRUCTIVE.some(re => re.test(command))
