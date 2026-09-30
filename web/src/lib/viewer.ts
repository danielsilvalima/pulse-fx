import { api } from './api'

const STORAGE_KEY = 'pulse-fx.viewer'

export async function viewerId() {
  const existing = localStorage.getItem(STORAGE_KEY)
  if (existing) return existing
  const payload = await api<{ data: { id: string } }>('/viewers', { method: 'POST' })
  localStorage.setItem(STORAGE_KEY, payload.data.id)
  return payload.data.id
}
