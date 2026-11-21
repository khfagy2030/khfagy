// khfagy 3.0 shields: prompt injection, git secrets, fake packages.

// ---- Prompt-injection shield ----
// Text a page, file or command output uses to give the model orders of its own.
const INJECTION: readonly RegExp[] = [
  /\b(ignore|disregard|forget|override)\s+(all\s+|any\s+|the\s+|your\s+)*(previous|prior|above|earlier|preceding|system|original)\s+(instructions|prompts?|rules|directions|messages)/i,
  /\byou\s+are\s+now\s+(a|an|in|DAN|no\s+longer)\b/i,
  /\b(new|updated|real)\s+(system\s+)?instructions\s*:/i,
  /<\s*\/?\s*(system|assistant|im_start|im_end)\s*>|\[\s*(SYSTEM|INST)\s*\]/i,
  /\b(do\s+not|don'?t|never)\s+(tell|inform|alert|mention\s+(this\s+)?to)\s+the\s+user\b/i,
  /\b(send|post|upload|exfiltrate|leak|email)\s+(me\s+)?(the\s+|all\s+|your\s+|any\s+)*(api[\s_-]?keys?|secrets?|tokens?|credentials|passwords?|\.env|ssh\s+keys?)\b/i,
  /\b(AI|assistant|agent|LLM|Claude|model)\s*[,:]?\s+(must|should|now)\s+(ignore|run|execute|delete|send)\b/i,
  /(تجاهل|انسَ|انس)\s+(كل\s+|جميع\s+)?(التعليمات|الأوامر)\s+(السابقة|الأصلية)/,
]

/** A short quote of the instruction-like text found, or undefined. */
export const findInjection = (text: string): string | undefined => {
  for (const re of INJECTION) {
    const m = re.exec(text)
    if (m !== null) {
      return m[0].replace(/\s+/g, ' ').slice(0, 80)
    }
  }
  return undefined
}

// ---- Git: what a commit or push would send ----
export type GitAction = { kind: 'commit' | 'push'; addsFirst: boolean }

/** Whether a shell command commits or pushes with git, and whether it stages files first. */
export const gitAction = (command: string): GitAction | undefined => {
  const push = /\bgit\s+(-C\s+\S+\s+)?push\b/i.test(command)
  const commit = /\bgit\s+(-C\s+\S+\s+)?commit\b/i.test(command)
  if (!push && !commit) {
    return undefined
  }
  const addsFirst =
    /\bgit\s+add\b/i.test(command) || /\bgit\s+commit\b[^&|;]*\s(-[a-zA-Z]*a[a-zA-Z]*|--all)(\s|$)/.test(command)
  return { kind: commit ? 'commit' : 'push', addsFirst }
}

/** Only the lines a diff adds (a removed key is not a leak). */
export const addedLines = (diff: string) =>
  diff
    .split('\n')
    .filter(line => line.startsWith('+') && !line.startsWith('+++'))
    .join('\n')

// ---- Fake package guard ----
const NPM_TOP = [
  'react', 'react-dom', 'next', 'vue', 'angular', 'svelte', 'express', 'axios', 'lodash', 'moment', 'dayjs', 'chalk',
  'commander', 'yargs', 'debug', 'dotenv', 'uuid', 'nanoid', 'typescript', 'webpack', 'vite', 'rollup', 'esbuild',
  'eslint', 'prettier', 'jest', 'vitest', 'mocha', 'chai', 'cypress', 'playwright', 'puppeteer', 'request',
  'node-fetch', 'cross-env', 'nodemon', 'rimraf', 'mkdirp', 'glob', 'minimist', 'mongoose', 'mongodb', 'mysql',
  'mysql2', 'redis', 'ioredis', 'sequelize', 'prisma', 'knex', 'socket.io', 'cors', 'helmet', 'morgan',
  'body-parser', 'cookie-parser', 'jsonwebtoken', 'bcrypt', 'bcryptjs', 'passport', 'multer', 'sharp', 'zod',
  'joi', 'rxjs', 'redux', 'zustand', 'immer', 'tailwindcss', 'postcss', 'autoprefixer', 'sass', 'styled-components',
  'classnames', 'date-fns', 'luxon', 'underscore', 'jquery', 'bootstrap', 'three', 'electron', 'fastify', 'koa',
  'hono', 'graphql', 'apollo-server', 'openai', 'discord.js', 'twilio', 'stripe', 'firebase', 'colors', 'inquirer',
  'execa', 'fs-extra', 'semver', 'tslib', 'core-js', 'ramda', 'async', 'bluebird', 'cheerio', 'marked',
]
const PYPI_TOP = [
  'requests', 'numpy', 'pandas', 'scipy', 'matplotlib', 'seaborn', 'scikit-learn', 'tensorflow', 'torch', 'keras',
  'flask', 'django', 'fastapi', 'uvicorn', 'gunicorn', 'pydantic', 'sqlalchemy', 'psycopg2', 'pymysql', 'redis',
  'celery', 'boto3', 'botocore', 'urllib3', 'certifi', 'charset-normalizer', 'setuptools', 'wheel',
  'python-dateutil', 'pytz', 'pyyaml', 'jinja2', 'click', 'rich', 'typer', 'tqdm', 'pillow', 'opencv-python',
  'beautifulsoup4', 'lxml', 'selenium', 'scrapy', 'httpx', 'aiohttp', 'pytest', 'black', 'flake8', 'mypy', 'pylint',
  'openai', 'anthropic', 'transformers', 'langchain', 'cryptography', 'paramiko', 'colorama', 'termcolor',
  'python-dotenv', 'openpyxl', 'python-docx', 'pyinstaller', 'jupyter', 'notebook', 'ipython', 'plotly',
  'streamlit', 'gradio', 'networkx', 'sympy', 'nltk', 'spacy', 'xgboost', 'lightgbm', 'pyjwt', 'bcrypt', 'websockets',
]
const NPM_SET = new Set(NPM_TOP)
const PYPI_SET = new Set(PYPI_TOP)

// Damerau-Levenshtein distance: a swap of two neighbouring letters counts as one change.
const distance = (a: string, b: string) => {
  const w = b.length + 1
  const d = new Array<number>((a.length + 1) * w).fill(0)
  const at = (i: number, j: number) => d[i * w + j] ?? 0
  for (let i = 0; i <= a.length; i++) {
    d[i * w] = i
  }
  for (let j = 0; j <= b.length; j++) {
    d[j] = j
  }
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      let v = Math.min(at(i - 1, j) + 1, at(i, j - 1) + 1, at(i - 1, j - 1) + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        v = Math.min(v, at(i - 2, j - 2) + 1)
      }
      d[i * w + j] = v
    }
  }
  return at(a.length, b.length)
}

export type Install = { eco: 'npm' | 'pypi'; names: string[] }

const isLocalOrUrl = (w: string) => /^(\.|\/|~|[a-z]:\\|https?:|git\+|file:)/i.test(w) || /\.(tgz|whl|tar\.gz|zip)$/i.test(w)

/** The packages a shell command installs, per ecosystem. */
export const installsIn = (command: string): Install[] => {
  const found: Install[] = []
  for (const part of command.split(/&&|\|\||;|\|/)) {
    const words = part.trim().split(/\s+/)
    const at = (i: number) => (words[i] ?? '').toLowerCase()
    let eco: Install['eco'] | undefined
    let from = -1
    for (let i = 0; i < words.length && eco === undefined; i++) {
      const w = at(i)
      if (['npm', 'pnpm', 'yarn', 'bun'].includes(w) && ['i', 'install', 'add'].includes(at(i + 1))) {
        eco = 'npm'
        from = i + 2
      } else if (w === 'uv' && at(i + 1) === 'pip' && at(i + 2) === 'install') {
        eco = 'pypi'
        from = i + 3
      } else if (/^(pip3?|uv|poetry|pipx|pipenv)$/.test(w) && ['install', 'add'].includes(at(i + 1))) {
        eco = 'pypi'
        from = i + 2
      }
    }
    if (eco === undefined) {
      continue
    }
    const kind = eco
    const names = words
      .slice(from)
      .filter(w => w !== '' && !w.startsWith('-') && !isLocalOrUrl(w))
      .map(w =>
        (kind === 'npm' ? w.replace(/(.)@[^@/]*$/, '$1') : w.replace(/\[.*$/, '').replace(/[=<>!~;].*$/, '')).toLowerCase(),
      )
      .filter(w => w !== '')
    if (names.length > 0) {
      found.push({ eco: kind, names })
    }
  }
  return found
}

/** The popular package a name imitates (one or two letters off), or undefined. */
export const lookalikeOf = (name: string, eco: Install['eco']): string | undefined => {
  const set = eco === 'npm' ? NPM_SET : PYPI_SET
  const plain = name.replace(/^@[^/]+\//, '')
  if (set.has(name) || set.has(plain) || plain.length < 4) {
    return undefined
  }
  const flat = (s: string) => s.replace(/[-_.]/g, '')
  const max = plain.length >= 9 ? 2 : 1
  for (const top of eco === 'npm' ? NPM_TOP : PYPI_TOP) {
    if (top.length < 4) {
      continue
    }
    if (flat(top) === flat(plain) || (Math.abs(top.length - plain.length) <= max && distance(plain, top) <= max)) {
      // python-dotenv and python_dotenv are the same package on PyPI
      if (eco === 'pypi' && top.replace(/[-_.]/g, '-') === plain.replace(/[-_.]/g, '-')) {
        return undefined
      }
      return top
    }
  }
  return undefined
}
