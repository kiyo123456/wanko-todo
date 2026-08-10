import { useEffect, useMemo, useReducer, useState } from 'react'
import { PoolScreen } from './screens/PoolScreen'
import { ServingScreen } from './screens/ServingScreen'
import { SummaryScreen } from './screens/SummaryScreen'
import type { HistoryEntry } from './screens/SummaryScreen'
import {
  appReducer,
  selectActiveSession,
  selectBowlCount,
  selectCurrentTask,
  selectLatestSession,
  selectPendingTasks,
  selectSessionHistory,
  selectSessionTasks,
  selectUndoableTask,
} from './state/appReducer'
import { loadState, saveState } from './storage'
import type { Mode } from './types'
import './styles.css'

export default function App() {
  const [state, dispatch] = useReducer(appReducer, undefined, loadState)

  // 食事中にリロードされた場合は食事処へ戻す。
  // ここで釜に落とすと、隠していたはずの全体量が見えてしまう。
  const [mode, setMode] = useState<Mode>(() =>
    selectActiveSession(state) ? 'serving' : 'pool',
  )

  useEffect(() => {
    saveState(state)
  }, [state])

  // Enter / Space で完了。連打でテンポを作るのがこのアプリの肝
  useEffect(() => {
    if (mode !== 'serving') return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Enter' && event.key !== ' ') return
      if (event.metaKey || event.ctrlKey || event.altKey) return

      // 入力欄やボタンにフォーカスがある時は、その要素本来の動作に任せる
      const target = event.target as HTMLElement | null
      if (target) {
        const tag = target.tagName
        if (
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          tag === 'BUTTON' ||
          target.isContentEditable
        ) {
          return
        }
      }

      event.preventDefault()
      dispatch({ type: 'COMPLETE_CURRENT', at: Date.now() })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mode])

  const pendingTasks = selectPendingTasks(state)
  const summarySession = selectLatestSession(state)
  const summaryTasks = summarySession
    ? selectSessionTasks(state, summarySession.id)
    : []

  const history = useMemo<HistoryEntry[]>(() => {
    return selectSessionHistory(state)
      .filter((session) => session.id !== summarySession?.id)
      .map((session) => ({
        session,
        count: selectSessionTasks(state, session.id).length,
      }))
  }, [state, summarySession?.id])

  if (mode === 'serving') {
    return (
      <ServingScreen
        task={selectCurrentTask(state)}
        bowlCount={selectBowlCount(state)}
        canUndo={Boolean(selectUndoableTask(state))}
        onComplete={() => dispatch({ type: 'COMPLETE_CURRENT', at: Date.now() })}
        onUndo={() => dispatch({ type: 'UNDO_COMPLETE' })}
        onAdd={(titles) => dispatch({ type: 'ADD_TASKS', titles, at: Date.now() })}
        onFinish={() => {
          dispatch({ type: 'END_SESSION', at: Date.now() })
          setMode('summary')
        }}
      />
    )
  }

  if (mode === 'summary') {
    return (
      <SummaryScreen
        session={summarySession}
        tasks={summaryTasks}
        history={history}
        onResume={() => {
          dispatch({ type: 'START_SESSION', at: Date.now() })
          setMode('serving')
        }}
        onOpenPool={() => setMode('pool')}
      />
    )
  }

  return (
    <PoolScreen
      tasks={pendingTasks}
      hasHistory={state.sessions.length > 0}
      onAdd={(titles) => dispatch({ type: 'ADD_TASKS', titles, at: Date.now() })}
      onEdit={(id, title) => dispatch({ type: 'EDIT_TASK', id, title })}
      onDelete={(id) => dispatch({ type: 'DELETE_TASK', id })}
      onStart={() => {
        dispatch({ type: 'START_SESSION', at: Date.now() })
        setMode('serving')
      }}
      onOpenSummary={() => setMode('summary')}
    />
  )
}
