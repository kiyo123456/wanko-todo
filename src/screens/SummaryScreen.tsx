import { BowlStack } from '../components/BowlStack'
import { formatDate, formatDuration, formatTime } from '../format'
import type { Session, Task } from '../types'

export type HistoryEntry = {
  session: Session
  count: number
}

type Props = {
  session?: Session
  tasks: Task[]
  history: HistoryEntry[]
  onResume: () => void
  onOpenPool: () => void
}

/** お会計 — ここで初めて、自分が何をどれだけ裁いたかを振り返る */
export function SummaryScreen({
  session,
  tasks,
  history,
  onResume,
  onOpenPool,
}: Props) {
  if (!session) {
    return (
      <div className="screen screen--summary">
        <h1 className="summary__title">お会計</h1>
        <p className="empty">まだ記録がありません。</p>
        <footer className="summary__footer">
          <button className="button button--primary" type="button" onClick={onOpenPool}>
            釜を見る
          </button>
        </footer>
      </div>
    )
  }

  const endedAt = session.endedAt ?? Date.now()
  const duration = endedAt - session.startedAt
  const average = tasks.length > 0 ? duration / tasks.length : undefined

  return (
    <div className="screen screen--summary">
      <header>
        <h1 className="summary__title">お会計</h1>
        <p className="summary__subtitle">
          {formatDate(session.startedAt)} {formatTime(session.startedAt)} 〜{' '}
          {session.endedAt ? formatTime(session.endedAt) : '進行中'}
        </p>
      </header>

      <BowlStack count={tasks.length} />

      <dl className="summary__stats">
        <div className="summary__stat">
          <dt>食べた数</dt>
          <dd>{tasks.length} 杯</dd>
        </div>
        <div className="summary__stat">
          <dt>かかった時間</dt>
          <dd>{formatDuration(duration)}</dd>
        </div>
        <div className="summary__stat">
          <dt>一杯あたり</dt>
          <dd>{average === undefined ? '—' : formatDuration(average)}</dd>
        </div>
      </dl>

      <section className="summary__section">
        <h2 className="summary__section-title">食べたもの</h2>
        {tasks.length === 0 ? (
          <p className="empty">この回はまだ一杯も食べていません。</p>
        ) : (
          <ol className="summary__tasks">
            {tasks.map((task) => (
              <li className="summary__task" key={task.id}>
                <span className="summary__task-title">{task.title}</span>
                <span className="summary__task-time">
                  {task.completedAt ? formatTime(task.completedAt) : ''}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      {history.length > 0 && (
        <section className="summary__section">
          <h2 className="summary__section-title">これまで</h2>
          <ul className="summary__history">
            {history.map((entry) => (
              <li className="summary__history-item" key={entry.session.id}>
                <span>{formatDate(entry.session.startedAt)}</span>
                <span className="summary__history-time">
                  {formatTime(entry.session.startedAt)}
                </span>
                <span className="summary__history-count">{entry.count} 杯</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="summary__footer">
        <button className="button button--primary" type="button" onClick={onResume}>
          おかわり
        </button>
        <button className="button button--quiet" type="button" onClick={onOpenPool}>
          釜を見る
        </button>
      </footer>
    </div>
  )
}
