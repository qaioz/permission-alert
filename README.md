# permission-alert

A Claude Code mod that answers permission dialogs for you.

> **Warning:** the default mode is `auto`, which approves **every** permission dialog without asking.
> Switch with `/perm-alert sound` or `/perm-alert off` if that is not what you want.

| Mode | What happens on a permission dialog |
|---|---|
| `auto` (default) | approved at once, a toast names the tool, the status line shows `perm-alert: AUTO-APPROVE` |
| `sound` | a ping and a desktop notification, then the normal dialog |
| `off` | nothing, the normal dialog |

If the hook fails for any reason, the normal dialog appears.

## Install

```
claude plugin marketplace add qaioz/permission-alert && claude plugin install permission-alert@permission-alert --scope user
```

Then `/reload-plugins` in an open session. Change mode with `/perm-alert auto|sound|off`; the choice is kept across sessions.

The ping in `sounds/ping.wav` is a generated tone, free to use.
