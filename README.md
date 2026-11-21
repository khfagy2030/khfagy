# khfagy

**A bright navy session HUD for Claude Code.** See what Claude is doing while it works, get a summary of every turn, and stop the two mistakes that hurt most: leaking secrets and running destructive commands.

English and Arabic (العربية) out of the box.

## Features

| | |
| --- | --- |
| 🎨 **Navy theme** | Bright sea-spray blue by day, a lit-harbour navy by night. Desktop and mobile apps. |
| 📋 **Activity pane** | Every tool call as it happens: tool, target, status (`◌` running, `✓` done, `✗` failed, `⛔` blocked) and duration. Open it with `/khfagy`. |
| 📊 **Turn summary** | A row above the prompt: how long the last turn took, how many tools ran, how many failed. |
| ⚓ **Status line** | Running count of tool calls and failures in this session. |
| 🔔 **Alerts** | A toast when a turn runs long, or when a guardrail blocks something. |
| 🔒 **Secret guard** | Blocks edits to `.env` files, private keys (`id_rsa`, `*.pem`, `*.key`), `credentials.json`, `.npmrc`, `.pypirc`. Templates like `.env.example` stay editable. |
| 🛑 **Command guard** | Blocks `rm -rf /`, `rm -rf ~`, `git push --force` (`--force-with-lease` is allowed) and recursive deletes of a drive root in PowerShell. |

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install khfagy --marketplace khfagy2030/khfagy
```

Answer `y` to add the marketplace, then choose a scope (user scope is recommended).

From a shell:

```
claude plugin install khfagy --marketplace khfagy2030/khfagy
```

In the desktop app: click **+** next to the prompt box → **Plugins** → **Add marketplace** with `khfagy2030/khfagy` → **Add plugin**.

## Settings

Change them from the settings menu (`/config`) after installing.

| Setting | Default | What it does |
| --- | --- | --- |
| `language` | `en` | `en` or `ar` |
| `theme` | `true` | Apply the navy look |
| `guardSecrets` | `true` | Block edits to secret files |
| `guardCommands` | `true` | Block destructive shell commands |
| `slowTurnSeconds` | `120` | Toast when a turn runs longer; `0` turns it off |

## العربية

**khfagy** لوحة متابعة احترافية لجلسات Claude Code بألوان الأزرق البحري: لوحة نشاط حيّة، وملخص لكل دور، وشريط حالة، وإشعارات، وحماية للملفات السرية ومنع للأوامر الخطيرة. لتشغيل الواجهة بالعربية اضبط `language` على `ar` من قائمة الإعدادات. افتح لوحة النشاط بالأمر `/khfagy`.

## License

MIT
