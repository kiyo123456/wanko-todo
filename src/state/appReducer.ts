import type { AppState, Session, Task } from '../types'

export const initialState: AppState = {
  version: 1,
  tasks: [],
  sessions: [],
}

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/**
 * 時刻は常に呼び出し側から `at` で渡す。reducer 自体は純関数に保ち、
 * ロジックを時計から切り離してテストできるようにしている。
 */
export type Action =
  | { type: 'ADD_TASKS'; titles: string[]; at: number }
  | { type: 'EDIT_TASK'; id: string; title: string }
  | { type: 'DELETE_TASK'; id: string }
  | { type: 'START_SESSION'; at: number }
  | { type: 'COMPLETE_CURRENT'; at: number }
  | { type: 'UNDO_COMPLETE' }
  | { type: 'END_SESSION'; at: number }

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_TASKS': {
      // 空行を捨てる。一括投入で末尾に改行が残るのはよくあるため
      const titles = action.titles.map((t) => t.trim()).filter(Boolean)
      if (titles.length === 0) return state

      // 新しいタスクは常に末尾へ。プールは FIFO で消化される
      const added: Task[] = titles.map((title) => ({
        id: createId(),
        title,
        createdAt: action.at,
        status: 'pending',
      }))
      return { ...state, tasks: [...state.tasks, ...added] }
    }

    case 'EDIT_TASK': {
      const title = action.title.trim()
      if (!title) return state
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id ? { ...task, title } : task,
        ),
      }
    }

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.id),
      }

    case 'START_SESSION': {
      // 進行中のセッションがあればそれを続ける（「おかわり」で戻ってきた場合など）
      if (selectActiveSession(state)) return state

      const session: Session = { id: createId(), startedAt: action.at }
      return {
        ...state,
        sessions: [...state.sessions, session],
        activeSessionId: session.id,
      }
    }

    case 'COMPLETE_CURRENT': {
      const current = selectCurrentTask(state)
      if (!current) return state

      // セッション未開始で食べ始めた場合に備えて、ここでも張っておく
      let next = state
      if (!selectActiveSession(next)) {
        next = appReducer(next, { type: 'START_SESSION', at: action.at })
      }

      return {
        ...next,
        tasks: next.tasks.map((task) =>
          task.id === current.id
            ? {
                ...task,
                status: 'done',
                completedAt: action.at,
                sessionId: next.activeSessionId,
              }
            : task,
        ),
      }
    }

    case 'UNDO_COMPLETE': {
      const target = selectUndoableTask(state)
      if (!target) return state

      // 配列上の位置は変えないので、pending に戻せば自然と再び先頭に来る
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === target.id
            ? {
                ...task,
                status: 'pending',
                completedAt: undefined,
                sessionId: undefined,
              }
            : task,
        ),
      }
    }

    case 'END_SESSION': {
      const active = selectActiveSession(state)
      if (!active) return state

      return {
        ...state,
        sessions: state.sessions.map((session) =>
          session.id === active.id ? { ...session, endedAt: action.at } : session,
        ),
        activeSessionId: undefined,
      }
    }

    default:
      return state
  }
}

// --- セレクタ（派生値は state に持たず、常にここで算出する） ---

export function selectPendingTasks(state: AppState): Task[] {
  return state.tasks.filter((task) => task.status === 'pending')
}

/** 今まさに目の前に出ている 1 杯。プールが空なら undefined */
export function selectCurrentTask(state: AppState): Task | undefined {
  return state.tasks.find((task) => task.status === 'pending')
}

export function selectActiveSession(state: AppState): Session | undefined {
  if (!state.activeSessionId) return undefined
  return state.sessions.find(
    (session) => session.id === state.activeSessionId && !session.endedAt,
  )
}

/** 指定セッションで食べたタスクを、食べた順に返す */
export function selectSessionTasks(state: AppState, sessionId: string): Task[] {
  return state.tasks
    .filter((task) => task.status === 'done' && task.sessionId === sessionId)
    .sort((a, b) => (a.completedAt ?? 0) - (b.completedAt ?? 0))
}

/** 現在のセッションで食べた杯数 */
export function selectBowlCount(state: AppState): number {
  const active = selectActiveSession(state)
  if (!active) return 0
  return state.tasks.filter(
    (task) => task.status === 'done' && task.sessionId === active.id,
  ).length
}

/** 直前に食べた 1 杯。Undo の対象（現在のセッション内に限る） */
export function selectUndoableTask(state: AppState): Task | undefined {
  const active = selectActiveSession(state)
  if (!active) return undefined

  return state.tasks
    .filter((task) => task.status === 'done' && task.sessionId === active.id)
    .reduce<Task | undefined>((latest, task) => {
      if (!latest) return task
      return (task.completedAt ?? 0) > (latest.completedAt ?? 0) ? task : latest
    }, undefined)
}

/** 振り返りで表示するセッション。直近に始めたものを見せる */
export function selectLatestSession(state: AppState): Session | undefined {
  return state.sessions.reduce<Session | undefined>((latest, session) => {
    if (!latest) return session
    return session.startedAt > latest.startedAt ? session : latest
  }, undefined)
}

/** 新しい順に並べたセッション履歴 */
export function selectSessionHistory(state: AppState): Session[] {
  return [...state.sessions].sort((a, b) => b.startedAt - a.startedAt)
}
