# khfagy

**The safety and insight layer for Claude Code.** khfagy stops the mistakes that cost the most, such as a leaked API key, an edited `.env` or a force push, and shows exactly what Claude is doing, how long it takes and how many tokens it uses.

English and Arabic (العربية) built in.

## Why khfagy

- **Your keys never reach the model.** A message that contains an API key, token or private key is stopped before it is sent.
- **Secret files stay secret.** Claude can neither read nor edit `.env` files, private keys or credential stores.
- **No more disasters.** Wiping a disk, `rm -rf /`, force pushes and `DROP DATABASE` are blocked before they run.
- **Review mode.** One command turns Claude read-only while you review its work.
- **See everything.** A live activity pane, turn history, and daily and weekly reports with time and token usage.

## Features

### 🛡 Protection

| | |
| --- | --- |
| **Prompt secret shield** | Stops a message holding an Anthropic, OpenAI, GitHub, AWS, Google, Slack or Stripe key, or a private key. |
| **Secret file guard** | Blocks reads and edits of `.env*`, `id_rsa` / `id_ed25519`, `*.pem`, `*.key`, `*.p12`, `credentials.json`, `.npmrc`, `.pypirc`, `.netrc` and `.git-credentials`. Templates such as `.env.example` stay usable. |
| **Destructive command guard** | Blocks `rm -rf /` and `~`, `git push --force` (`--force-with-lease` is allowed), recursive deletes of a drive root, `mkfs`, `format`, `diskpart clean`, `dd` to a disk, fork bombs and `DROP DATABASE`. |
| **Your own rules** | Add protected files (`secrets/`, `*.sqlite`, `config/prod.json`) and blocked commands (`terraform destroy`, `kubectl delete`). |
| **Review mode** | `/khfagy lock` blocks every edit, write and shell command until `/khfagy unlock`. A band above the prompt shows that it is on. |

### 📊 Insight

| | |
| --- | --- |
| **Activity pane** | Every tool call live: tool, target, status (`◌` running, `✓` done, `✗` failed, `⛔` blocked) and duration, with the last 5 turns below. |
| **Turn summary** | A row above the prompt: time, tools and failures of the last turn. |
| **Token tracking** | Input and output tokens per turn, session, day and week. |
| **Reports** | `/khfagy report` covers this session and today. `/khfagy stats` covers the last 7 days, day by day, with your top tools. |
| **Status line** | Running count of tool calls and problems. |

### ✨ Comfort

| | |
| --- | --- |
| **Done chime** | A soft sound when a turn of 15 seconds or more finishes (desktop app). |
| **Slow turn alert** | A toast when a turn runs longer than you set. |
| **Navy theme** | Bright sea-spray blue by day, lit-harbour navy by night. |
| **English and Arabic** | The whole interface in either language. |

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

## Commands

| Command | What it does |
| --- | --- |
| `/khfagy` | Open the pane |
| `/khfagy report` | This session and today |
| `/khfagy stats` | The last 7 days |
| `/khfagy lock` | Review mode on |
| `/khfagy unlock` | Review mode off |
| `/khfagy help` | All commands |

## Settings

Change them in `/config` → khfagy.

| Setting | Default | What it does |
| --- | --- | --- |
| `language` | `en` | `en` or `ar` |
| `theme` | `true` | Navy look |
| `guardPrompts` | `true` | Stop messages that hold a key |
| `guardSecrets` | `true` | Block edits to secret files |
| `guardReads` | `true` | Block reading secret files |
| `guardCommands` | `true` | Block destructive commands |
| `protectedPaths` | empty | Extra protected files, comma-separated |
| `blockedCommands` | empty | Extra blocked command text, comma-separated |
| `soundOnDone` | `true` | Chime when a long turn ends |
| `slowTurnSeconds` | `120` | Toast for slow turns; `0` turns it off |

## Privacy

khfagy runs entirely on your machine. It sends nothing anywhere, and its statistics stay in Claude Code's local plugin storage.

## العربية

**khfagy** طبقة حماية ومتابعة احترافية لـ Claude Code:

- **درع الرسائل:** يمنع إرسال أي رسالة فيها مفتاح API أو توكن أو مفتاح خاص.
- **حماية الملفات السرية:** يمنع Claude من قراءة أو تعديل ملفات `.env` والمفاتيح وملفات الاعتماد.
- **منع الأوامر المدمّرة:** مثل مسح القرص و`rm -rf /` و`git push --force` و`DROP DATABASE`.
- **وضع المراجعة:** الأمر `/khfagy lock` يجعل Claude للقراءة فقط حتى `/khfagy unlock`.
- **لوحة النشاط وسجل الأدوار:** ترى كل ما يفعله Claude لحظة بلحظة.
- **تقارير يومية وأسبوعية:** الوقت وعدد الأدوات واستهلاك الرموز (tokens).
- **صوت عند انتهاء الرد**، وتنبيه للردود الطويلة، ومظهر أزرق بحري.

لتشغيل الواجهة بالعربية اضبط `language` على `ar` من `/config`.

## License

MIT
