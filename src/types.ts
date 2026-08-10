export type TaskStatus = 'pending' | 'done'

export type Task = {
  id: string
  title: string
  createdAt: number
  completedAt?: number
  /** どのセッションで食べたか。未完了なら undefined */
  sessionId?: string
  status: TaskStatus
}

export type Session = {
  id: string
  startedAt: number
  endedAt?: number
}

export type AppState = {
  version: 1
  tasks: Task[]
  sessions: Session[]
  activeSessionId?: string
}

/** 画面モード。ルーターは使わず、これ 1 つで切り替える */
export type Mode = 'pool' | 'serving' | 'summary'
