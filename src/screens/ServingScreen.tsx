import { BowlStack } from '../components/BowlStack'
import { QuickAdd } from '../components/QuickAdd'
import type { Task } from '../types'

type Props = {
  task?: Task
  bowlCount: number
  canUndo: boolean
  onComplete: () => void
  onUndo: () => void
  onAdd: (titles: string[]) => void
  onFinish: () => void
}

/**
 * 食事処 — アプリの本体。
 * 残数・一覧・進捗のたぐいは、この画面には絶対に出さない。
 */
export function ServingScreen({
  task,
  bowlCount,
  canUndo,
  onComplete,
  onUndo,
  onAdd,
  onFinish,
}: Props) {
  return (
    <div className="screen screen--serving">
      <header className="serving__header">
        <button
          className="button button--ghost"
          type="button"
          disabled={!canUndo}
          onClick={onUndo}
        >
          ひとつ戻す
        </button>
        <button className="button button--ghost" type="button" onClick={onFinish}>
          ごちそうさま
        </button>
      </header>

      <main className="serving__main">
        {task ? (
          // key を付け替えることで、次の 1 杯が注がれる動きが毎回再生される
          <div className="serving__bowl-area" key={task.id}>
            <p className="serving__label">目の前の一杯</p>
            <h1 className="serving__task">{task.title}</h1>
            <button
              className="button button--primary button--large"
              type="button"
              onClick={onComplete}
            >
              いただいた
            </button>
            <p className="serving__hint">Enter でも完了できます</p>
          </div>
        ) : (
          <div className="serving__bowl-area serving__bowl-area--empty">
            <p className="serving__label">釜が空です</p>
            <h1 className="serving__task serving__task--empty">
              食べ切りました
            </h1>
            <p className="serving__hint">
              下から足すか、ごちそうさまで締めてください。
            </p>
          </div>
        )}
      </main>

      <footer className="serving__footer">
        <BowlStack count={bowlCount} />
        <QuickAdd
          onAdd={onAdd}
          placeholder="もう一杯足す"
          submitLabel="足す"
        />
      </footer>
    </div>
  )
}
