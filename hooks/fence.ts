const norm = (path: string) => path.replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase()

const isAbsolute = (path: string) => /^([A-Za-z]:[\\/]|[\\/])/.test(path)

/**
 * Whether a change to `path` stays where Claude may work: inside the project,
 * in a temp folder, under a .claude folder (plans, memory), or in a folder the
 * user allowed. Relative paths resolve inside the project.
 */
export const isAllowedPlace = (path: string, root: string | undefined, allowed: readonly string[] = []) => {
  if (root === undefined || !isAbsolute(path)) {
    return true
  }
  const p = norm(path)
  if (p.includes('/..')) {
    return false
  }
  const places = [root, ...allowed].map(norm).filter(x => x.length > 0)
  if (places.some(place => p === place || p.startsWith(`${place}/`))) {
    return true
  }
  return /\/\.claude\//.test(p) || /\/(temp|tmp)\//.test(p)
}

/** Where file snapshots go: <home>/.claude/khfagy/history, else under the project. */
export const historyDir = (pluginRoot: string, cwd: string) => {
  const unix = pluginRoot.replace(/\\/g, '/')
  const at = unix.toLowerCase().indexOf('/.claude/')
  const base = at >= 0 ? `${pluginRoot.slice(0, at)}/.claude/khfagy/history` : `${cwd}/.khfagy/history`
  return base.replace(/\\/g, '/')
}
