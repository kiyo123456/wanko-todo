import { useEffect, useRef } from 'react'

/** 1 列に積む上限。これを超えたら横に列を増やす */
const PER_COLUMN = 10

function Bowl() {
  return (
    <svg className="bowl" viewBox="0 0 48 30" aria-hidden="true">
      {/* 椀の身 */}
      <path
        d="M3 5 C3 19, 12 27, 24 27 C36 27, 45 19, 45 5 Z"
        className="bowl__body"
      />
      {/* 縁 */}
      <ellipse cx="24" cy="5" rx="21" ry="3.6" className="bowl__rim" />
    </svg>
  )
}

/**
 * 積み上がるのは「食べた数」であって「残り」ではない。
 * 総量を示唆する表現はここには一切置かない。
 */
export function BowlStack({ count }: { count: number }) {
  const columns: number[] = []
  for (let remaining = count; remaining > 0; remaining -= PER_COLUMN) {
    columns.push(Math.min(PER_COLUMN, remaining))
  }

  // 列が増えて横に溢れたら、いま置かれた椀が見えるよう右端に追従する
  const columnsRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = columnsRef.current
    if (element) element.scrollLeft = element.scrollWidth
  }, [count])

  return (
    <div className="bowl-stack">
      <div className="bowl-stack__columns" ref={columnsRef}>
        {columns.map((height, columnIndex) => (
          <div className="bowl-stack__column" key={columnIndex}>
            {Array.from({ length: height }, (_, bowlIndex) => (
              // key が index なので、増えた分だけが新規マウントされて
              // 積み上がるアニメーションが自然に付く
              <Bowl key={bowlIndex} />
            ))}
          </div>
        ))}
      </div>
      <p className="bowl-stack__count">
        <span className="bowl-stack__number">{count}</span> 杯
      </p>
    </div>
  )
}
