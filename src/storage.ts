import { initialState } from './state/appReducer'
import type { AppState, Session, Task } from './types'

const STORAGE_KEY = 'wanko-todo/v1'

function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) return false
  const task = value as Record<string, unknown>
  return (
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    typeof task.createdAt === 'number' &&
    (task.status === 'pending' || task.status === 'done')
  )
}

function isSession(value: unknown): value is Session {
  if (typeof value !== 'object' || value === null) return false
  const session = value as Record<string, unknown>
  return typeof session.id === 'string' && typeof session.startedAt === 'number'
}

/**
 * 壊れた localStorage でアプリごと落ちるのが一番まずいので、
 * 少しでも形が違えば初期状態に落とす。
 */
export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState

    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return initialState

    const candidate = parsed as Record<string, unknown>
    if (candidate.version !== 1) return initialState
    if (!Array.isArray(candidate.tasks) || !Array.isArray(candidate.sessions)) {
      return initialState
    }

    const tasks = candidate.tasks.filter(isTask)
    const sessions = candidate.sessions.filter(isSession)
    const activeSessionId =
      typeof candidate.activeSessionId === 'string' &&
      sessions.some((s) => s.id === candidate.activeSessionId && !s.endedAt)
        ? candidate.activeSessionId
        : undefined

    return { version: 1, tasks, sessions, activeSessionId }
  } catch {
    return initialState
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // 容量超過やプライベートモードでの失敗。保存できなくても操作は続行させる
  }
}
