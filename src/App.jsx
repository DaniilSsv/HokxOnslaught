import React, { useEffect, useState } from 'react'

const STORAGE_USER_KEY = 'wot-onslaught-user'
const API_URL = process.env.VITE_API_PATH || 'https://hokx-backend.vercel.app'

async function fetchVotesFromApi() {
  try {
    const res = await fetch(`${API_URL}/votes`)
    if (!res.ok) throw new Error('Failed to fetch')
    return await res.json()
  } catch (err) {
    console.error('fetchVotesFromApi error', err)
    return {}
  }
}

function loadUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_USER_KEY)) || { name: '', dates: [] }
  } catch {
    return { name: '', dates: [] }
  }
}

function formatDateISO(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function monthName(d) {
  return d.toLocaleString(undefined, { month: 'long', year: 'numeric' })
}

export default function App() {
  const [votes, setVotes] = useState({})
  const [user, setUser] = useState(() => loadUser())
  const [selection, setSelection] = useState(() => (loadUser().dates || []))
  const [message, setMessage] = useState('')
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  useEffect(() => {
    // load votes from API on mount
    let mounted = true
    fetchVotesFromApi().then(data => { if (mounted) setVotes(data) })
    return () => { mounted = false }
  }, [])

  // when user types a name or votes change, auto-select dates for that name (case-insensitive exact match)
  useEffect(() => {
    const name = (user.name || '').trim()
    if (!name) {
      setSelection([])
      return
    }
    // find dates where this name appears
    const lower = name.toLowerCase()
    const matched = Object.keys(votes).filter(d => Array.isArray(votes[d]) && votes[d].some(n => (n || '').toLowerCase() === lower))
    setSelection(matched)
  }, [user.name, votes])

  useEffect(() => localStorage.setItem(STORAGE_USER_KEY, JSON.stringify({ name: user.name || '', dates: selection })), [user.name, selection])

  function toggleDate(dateStr) {
    if (!user.name || user.name.trim() === '') {
      setMessage('Please enter your name before selecting dates.')
      setTimeout(() => setMessage(''), 2500)
      return
    }
    setSelection(prev => prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr])
  }

  function submit() {
    if (!user.name || user.name.trim() === '') {
      setMessage('Please enter your name before submitting.')
      setTimeout(() => setMessage(''), 2500)
      return
    }

    // call API to replace user's votes
    fetch(`${API_URL}/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: user.name, dates: selection })
    }).then(async res => {
      if (!res.ok) throw new Error('failed')
      const data = await fetchVotesFromApi()
      setVotes(data)
      setUser({ ...user, name: user.name })
      setMessage('Your availability has been saved.')
      setTimeout(() => setMessage(''), 3000)
    }).catch(err => {
      console.error(err)
      setMessage('Failed to save — check the server.')
      setTimeout(() => setMessage(''), 3000)
    })
  }

  function removeVote() {
    // remove only the currently selected dates for this user
    if (!user.name || user.name.trim() === '') {
      setMessage('Enter your name before trying to remove a vote.')
      setTimeout(() => setMessage(''), 2000)
      return
    }
    if (!selection || selection.length === 0) {
      setMessage('Select one or more dates to remove your vote from.')
      setTimeout(() => setMessage(''), 2000)
      return
    }

    fetch(`${API_URL}/votes/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: user.name, dates: selection })
    }).then(async res => {
      if (!res.ok) throw new Error('failed')
      const data = await fetchVotesFromApi()
      // update local user dates (remove the removed ones)
      const prevDates = loadUser().dates || []
      const remaining = prevDates.filter(d => !selection.includes(d))
      setVotes(data)
      setSelection([])
      setUser(prev => ({ ...prev, dates: remaining }))
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify({ name: user.name || '', dates: remaining }))
      setMessage('Selected dates removed from your vote (name preserved).')
      setTimeout(() => setMessage(''), 3000)
    }).catch(err => {
      console.error(err)
      setMessage('Failed to remove vote — check the server.')
      setTimeout(() => setMessage(''), 3000)
    })
  }

  // calendar helpers
  function daysForMonth(date) {
    const year = date.getFullYear()
    const month = date.getMonth()
    const first = new Date(year, month, 1)
    const firstWeekday = first.getDay() // 0 (Sun) - 6
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells = []
    for (let i = 0; i < firstWeekday; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
    // pad to full weeks
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }

  function prevMonth() { setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1)) }
  function nextMonth() { setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1)) }

  const monthCells = daysForMonth(currentMonth)

  // build results list sorted by date
  const resultDates = Object.keys(votes).sort().filter(d => Array.isArray(votes[d]) && votes[d].length > 0)

  return (
    <div className="container">
      <header>
        <h1>World of Tanks — Onslaught: Availability Vote</h1>
        <p>Enter your name, select the specific dates you can play, then submit.</p>
      </header>

      <section className="voting">
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
                >
                  <div className="day-number">{cell.getDate()}</div>
                  <div className="day-count">{cnt > 0 ? cnt : ''}</div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="actions">
          <label className="name-input">Your name
            <input value={user.name || ''} onChange={e => setUser(prev => ({ ...prev, name: e.target.value }))} placeholder="Enter your name" />
          </label>
          <button onClick={submit} className="primary">Submit / Update Vote</button>
          <button onClick={removeVote} className="muted">Remove my vote</button>
          {message && <div className="message">{message}</div>}
        </div>
      </section>

      <section className="results">
        <h2>Current availability</h2>
        {resultDates.length === 0 ? (
          <p className="muted">No votes recorded yet.</p>
        ) : (
          <ul className="results-list">
            {resultDates.map(d => {
              const names = votes[d] || []
              return (
                <li key={d} className="result-row">
                  <div className="label">
                    <strong>{d}</strong>
                    <span className="count">{names.length}</span>
                  </div>
                  {names.length > 0 && (
                    <div className="names-list">{names.join(', ')}</div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <footer className="footer">
        <div className="footer-center">
          <small>© kaljmairk</small>
        </div>
      </footer>
    </div>
  )
}
