import type { On } from 'claude-code'
import { test, expect } from 'claude-code/testing'

const ask = { tool_name: 'Bash', tool_input: { command: 'ls' }, permission_mode: 'default' as const }

const memoryStore = (on: On) => {
  const kv = new Map<string, unknown>()
  on('store.get', (_$, e) => ({ value: kv.get(e.key) }))
  on('store.set', (_$, e) => { kv.set(e.key, e.value); return { value: undefined } })
}

test('sound mode plays the ping and still shows the dialog', async ($, on) => {
  memoryStore(on)
  const played: unknown[] = []
  on('audio.play', (_$, e) => { played.push(e); return { value: undefined } })
  on('ui.notify', () => ({ value: { isSent: true, channel: 'terminal_bell' } }))
  on('ui.status', () => ({ value: undefined }))
  on('classic.PermissionRequest', () => ({}))

  await $.command.run({ command: 'perm-alert', args: 'sound' })
  const res = await $.classic.PermissionRequest(ask as never)

  expect(res.decision).toBe(undefined)
  expect(played.length).toBe(1)
})

test('auto mode approves without reaching the dialog', async ($, on) => {
  memoryStore(on)
  let reachedDialog = false
  on('ui.status', () => ({ value: undefined }))
  on('ui.toast', () => ({ value: undefined }))
  on('classic.PermissionRequest', () => { reachedDialog = true; return {} })

  await $.command.run({ command: 'perm-alert', args: 'auto' })
  const res = await $.classic.PermissionRequest(ask as never)

  expect(res.decision).toEqual({ behavior: 'allow' })
  expect(reachedDialog).toBe(false)
})

test('auto-approves by default with nothing stored', async ($, on) => {
  memoryStore(on)
  on('ui.toast', () => ({ value: undefined }))
  on('classic.PermissionRequest', () => ({}))

  const res = await $.classic.PermissionRequest(ask as never)

  expect(res.decision).toEqual({ behavior: 'allow' })
})
