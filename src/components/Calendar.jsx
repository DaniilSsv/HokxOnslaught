import React from 'react'
import { formatDateISO, belgiumTodayISO, monthName, daysForMonth } from '../lib/dateUtils'

export default function Calendar({ votes, selection, toggleDate, currentMonth, prevMonth, nextMonth }) {
  const monthCells = daysForMonth(currentMonth)

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button className="nav" onClick={prevMonth} aria-label="Previous month">‹</button>
        <div className="month-title">{monthName(currentMonth)}</div>
        <button className="nav" onClick={nextMonth} aria-label="Next month">›</button>
      </div>

      <div className="weekday-row">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(w => <div key={w} className="weekday">{w}</div>)}
      </div>

      <div className="grid">
        {monthCells.map((cell, idx) => {
          if (!cell) return <div key={idx} className="cell empty" />
          const dateStr = formatDateISO(cell)
          const names = votes[dateStr] || []
          const cnt = names.length
          const isSelected = selection.includes(dateStr)
          return (
            <button
              key={dateStr}
              className={`cell day-cell ${isSelected ? 'selected' : ''}`}
              onClick={() => toggleDate(dateStr)}
              title={`${cnt} selected${cnt>0?': '+names.join(', '):''}`}
              disabled={dateStr < belgiumTodayISO()}
            >
              <div className="day-number">{cell.getDate()}</div>
              <div className="day-count">{cnt > 0 ? cnt : ''}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
