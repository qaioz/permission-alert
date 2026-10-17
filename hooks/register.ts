import type { Register } from 'claude-code'

type Mode = 'sound' | 'auto' | 'off'
const MODES: readonly Mode[] = ['sound', 'auto', 'off']
const DEFAULT: Mode = 'auto'
const isMode = (v: unknown): v is Mode => MODES.includes(v as Mode)
const modeOf = (v: unknown): Mode => (isMode(v) ? v : DEFAULT)

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'perm-alert',
      description: 'Permission prompts: auto (auto-approve, default), sound (ding + notification), off',
    })
    if (modeOf(await $.store.get('mode')) === 'auto') $.ui.status('perm-alert: AUTO-APPROVE')

    return next(e)
  })

  on('command.run', { command: 'perm-alert' }, async ($, e) => {
    const want = e.args.trim().toLowerCase()
    if (!isMode(want)) {
      const mode = modeOf(await $.store.get('mode'))
      return { text: `perm-alert is "${mode}". Use /perm-alert sound | auto | off` }
    }
    await $.store.set('mode', want)
    $.ui.status(want === 'auto' ? 'perm-alert: AUTO-APPROVE' : undefined)

    return { text: `perm-alert set to "${want}".` }
  })

  on('classic.PermissionRequest', async ($, e, next) => {
    const mode = modeOf(await $.store.get('mode'))

    if (mode === 'auto') {
      $.ui.toast(`auto-approved ${e.tool_name}`)
      return { decision: { behavior: 'allow' } }
    }

    if (mode === 'sound') {
      void $.audio.play({ asset: 'sounds/ping.wav' }).catch(() => undefined)
      void $.ui.notify(`Claude needs permission for ${e.tool_name}`, { title: 'Claude Code' })
        .catch(() => undefined)
    }

    return next(e)
  }).catch(($, e, next) => next(e)) // on any failure, fall back to the normal dialog
}
