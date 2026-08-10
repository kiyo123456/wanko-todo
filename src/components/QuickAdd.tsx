import { useState } from 'react'

type Props = {
  onAdd: (titles: string[]) => void
  placeholder: string
  submitLabel: string
  /** 釜では複数行を一括投入する。食事処では 1 行だけ */
  multiline?: boolean
  autoFocus?: boolean
}

export function QuickAdd({
  onAdd,
  placeholder,
  submitLabel,
  multiline = false,
  autoFocus = false,
}: Props) {
  const [value, setValue] = useState('')

  function submit() {
    const titles = value.split('\n')
    if (titles.every((t) => !t.trim())) return
    onAdd(titles)
    setValue('')
  }

  return (
    <form
      className={multiline ? 'quick-add quick-add--block' : 'quick-add'}
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      {multiline ? (
        <textarea
          className="quick-add__field"
          rows={4}
          value={value}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            // 改行はそのまま使いたいので、送信は Cmd/Ctrl+Enter に割り当てる
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
              event.preventDefault()
              submit()
            }
          }}
        />
      ) : (
        <input
          className="quick-add__field"
          type="text"
          value={value}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onChange={(event) => setValue(event.target.value)}
        />
      )}
      <button className="button button--quiet" type="submit">
        {submitLabel}
      </button>
    </form>
  )
}
