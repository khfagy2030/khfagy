# khfagy

**The safety net for Claude Code.** Undo any change Claude made with one command. Keep your keys away from the model. Stop the commands that wreck a project. And see exactly what Claude did, how long it took and how many tokens it used.

English and Arabic (العربية) built in.

## Why khfagy

- **⏪ Undo anything.** khfagy keeps every file as it was before Claude touched it. `/khfagy undo` puts it back.
- **🔑 Your keys never reach the model,** whether they are in your message, in a file or printed by a command.
- **🚧 Claude stays in your project.** Edits outside the project folder are blocked.
- **💥 No more disasters.** Wiping a disk, `rm -rf /`, force pushes and `DROP DATABASE` are blocked before they run.
- **💰 Control the cost.** A daily token budget with warnings, and optionally a hard stop.
- **👀 See everything.** A live activity pane, turn history, and daily and weekly reports.

## Features

### ⏪ Time machine

| | |
| --- | --- |
| **Automatic snapshots** | Before every edit or write, khfagy saves the file as it was, under `~/.claude/khfagy/history`. |
| **`/khfagy history`** | Every file Claude changed this session, newest first. |
| **`/khfagy undo`** | Restores the newest change. `/khfagy undo 3` restores the file as it was before change #3. |

### 🛡 Protection

| | |
| --- | --- |
| **Prompt secret shield** | Stops a message holding an Anthropic, OpenAI, GitHub, AWS, Google, Slack or Stripe key, or a private key. |
| **Output secret shield** | When a command's output or a file's text contains a key, Claude never sees it. |
| **Project fence** | Edits outside the project folder are blocked. Temp folders and `.claude` folders stay allowed, and you can allow more. |
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
| **Token budget** | Set a daily budget: a warning at 80% and at 100%, and optionally a hard stop. `/khfagy budget` shows today's use. |
| **Reports** | `/khfagy report` covers this session and today. `/khfagy stats` covers the last 7 days, day by day, with your top tools. |
| **Status line** | Running count of tool calls and problems. |

### ✨ Comfort

| | |
| --- | --- |
| **Done chime** | A soft sound when a turn of 15 seconds or more finishes (desktop app). |
| **Slow turn alert** | A toast when a turn runs longer than you set. |
| **Navy theme** | Bright sea-spray blue by day, lit-harbour navy by night. |
| **English and Arabic** | The whole interface in either language. |

## 🏢 For teams

### Team policy

Commit `khfagy.policy.json` at the project root. Every developer who opens the project gets the same rules, and what the policy turns on cannot be turned off in a developer's own settings. Claude cannot edit the policy file.

```json
{
  "name": "Acme Security Policy",
  "enforce": {
    "guardPrompts": true,
    "guardSecrets": true,
    "guardReads": true,
    "guardCommands": true,
    "guardOutputs": true,
    "guardProjectFence": true,
    "timeMachine": true
  },
  "protectedPaths": ["infra/prod/", "*.sqlite"],
  "blockedCommands": ["terraform destroy", "kubectl delete"],
  "allowedPaths": [],
  "dailyTokenBudget": 2000000,
  "budgetLock": false,
  "readOnly": false,
  "audit": { "dir": ".khfagy/audit" },
  "alerts": { "webhook": "env" }
}
```

- **`readOnly: true`** freezes the project: Claude can read but not change anything, and `/khfagy unlock` cannot override it.
- **`"webhook": "env"`** reads the URL from the `KHFAGY_ALERT_WEBHOOK` environment variable, so the webhook never sits in the repository.
- `/khfagy policy` shows the active policy.

### Audit log

Every tool call, every block, every undo and every lock or unlock is recorded as one JSON line per event, in one file per day, with time, user, session, project, tool, target, status and reason. A key found in a target is written as `[redacted]`.

- Personal default location: `~/.claude/khfagy/audit/`
- With a policy, the policy's `audit.dir` inside the project.
- `/khfagy audit` exports the last 7 days as an Excel-ready CSV file.

### Alerts

When a guard blocks something, khfagy posts to your channel, sending at most one alert of each kind every 20 seconds:

| Service | Webhook |
| --- | --- |
| Slack | `https://hooks.slack.com/services/...` |
| Microsoft Teams | your incoming webhook URL |
| Discord | `https://discord.com/api/webhooks/...` |
| Telegram | `https://api.telegram.org/bot<token>/sendMessage?chat_id=<chat id>` |

Set it in `/config` → khfagy → Alert webhook (stored in secure storage), or in the team policy.

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
| `/khfagy undo` | Restore the newest change Claude made |
| `/khfagy undo 3` | Restore the file from before change #3 |
| `/khfagy history` | Files Claude changed this session |
| `/khfagy report` | This session and today |
| `/khfagy stats` | The last 7 days |
| `/khfagy budget` | Today's token use against your budget |
| `/khfagy audit` | Export the audit log (CSV, last 7 days) |
| `/khfagy policy` | Show the team policy |
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
| `guardOutputs` | `true` | Hide keys found in tool output |
| `guardProjectFence` | `true` | Block edits outside the project |
| `allowedPaths` | empty | Extra folders Claude may edit, comma-separated |
| `timeMachine` | `true` | Snapshot files before changes |
| `dailyTokenBudget` | `0` | Daily token budget; `0` turns it off |
| `budgetLock` | `false` | Stop sending messages once the budget is used |
| `protectedPaths` | empty | Extra protected files, comma-separated |
| `blockedCommands` | empty | Extra blocked command text, comma-separated |
| `auditLog` | `true` | Keep the audit log |
| `alertWebhook` | empty | Where to send alerts |
| `soundOnDone` | `true` | Chime when a long turn ends |
| `slowTurnSeconds` | `120` | Toast for slow turns; `0` turns it off |

## Privacy

khfagy runs entirely on your machine. It sends nothing anywhere except the alerts you configure. Statistics, snapshots and the audit log stay on your disk.

## Limits

Guards match text, so they are a safety net, not a sandbox. A determined user can get around them, and a command that only mentions a blocked phrase in its text is blocked too.

## العربية

**khfagy** شبكة الأمان لـ Claude Code:

- **🏢 سياسة الفريق:** ملف `khfagy.policy.json` في المشروع يفرض نفس القواعد على كل الموظفين، ولا يستطيع أحد إيقافها من إعداداته.
- **📜 سجل المراجعة:** كل عملية وكل منع مسجّل بالوقت والمستخدم، و`/khfagy audit` يصدّره ملف CSV يفتح في Excel.
- **🔔 تنبيهات فورية:** على Slack أو Teams أو Discord أو تيليجرام عندما تمنع الحماية شيئًا خطيرًا.
- **⏪ آلة الزمن:** يحفظ كل ملف قبل أن يغيّره Claude، و`/khfagy undo` يرجعه كما كان.
- **سور المشروع:** يمنع Claude من تعديل أي ملف خارج مجلد المشروع.
- **حجب الأسرار من النتائج:** إذا طبع أمر مفتاحًا سريًا فلن يراه Claude.
- **ميزانية الرموز اليومية:** تنبيه عند 80% و100%، مع إمكانية الإيقاف التام.
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
