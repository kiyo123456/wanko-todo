import { useState } from 'react'
import { QuickAdd } from '../components/QuickAdd'
import type { Task } from '../types'

type Props = {
  tasks: Task[]
  onAdd: (titles: string[]) => void
  onEdit: (id: string, title: string) => void
  onDelete: (id: string) => void
  onStart: () => void
  onOpenSummary: () => void
  hasHistory: boolean
}

/**
 * 釜 — 全体量が見える唯一の画面。
 * ここで仕込んで、食事処では一切見せない。
 */
export function PoolScreen({
  tasks,
  onAdd,
  onEdit,
  onDelete,
  onStart,
  onOpenSummary,
  hasHistory,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')

  function beginEdit(task: Task) {
    setEditingId(task.id)
    setDraft(task.title)
  }

  function commitEdit() {
    if (editingId && draft.trim()) {
      onEdit(editingId, draft)
    }
    setEditingId(null)
    setDraft('')
  }

  return (
    <div className="screen screen--pool">
      <header className="pool__header">
        <h1 className="pool__title">釜</h1>
        <p className="pool__lead">
          ここで仕込みます。食事処に入ったら、残りの数は見えなくなります。
        </p>
      </header>

      <QuickAdd
        multiline
        autoFocus
        onAdd={onAdd}
        placeholder={'1 行に 1 つずつ書いて、まとめて放り込む\n請求書を出す\n歯医者を予約する'}
        submitLabel="釜に入れる"
      />
      <p className="pool__hint">⌘ / Ctrl + Enter でも入れられます</p>

      <div className="pool__list-head">
        <h2 className="pool__list-title">仕込み中</h2>
        <span className="pool__count">{tasks.length} 件</span>
      </div>

      {tasks.length === 0 ? (
        <p className="empty">まだ何も入っていません。</p>
      ) : (
        <ol className="pool__list">
          {tasks.map((task, index) => (
            <li className="pool__item" key={task.id}>
              <span className="pool__index">{index + 1}</span>
              {editingId === task.id ? (
                <input
                  className="pool__edit"
                  value={draft}
                  autoFocus
                  onChange={(event) => setDraft(event.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') commitEdit()
                    if (event.key === 'Escape') setEditingId(null)
                  }}
                />
              ) : (
                <button
                  className="pool__label"
                  type="button"
                  onClick={() => beginEdit(task)}
                >
                  {task.title}
                </button>
              )}
              <button
                className="pool__delete"
                type="button"
                aria-label={`${task.title} を捨てる`}
                onClick={() => onDelete(task.id)}
              >
                ×
              </button>
            </li>
          ))}
        </ol>
      )}

      <footer className="pool__footer">
        <button
          className="button button--primary button--large"
          type="button"
          disabled={tasks.length === 0}
          onClick={onStart}
        >
          いただきます
        </button>
        {hasHistory && (
          <button className="button button--quiet" type="button" onClick={onOpenSummary}>
            これまでの記録
          </button>
        )}
      </footer>
    </div>
  )
}
