import React, { useEffect, useState } from 'react'
import Calendar from './components/Calendar'
import Actions from './components/Actions'
import Results from './components/Results'
import { belgiumTodayISO } from './lib/dateUtils'

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
    // NOTE: matching is now case-sensitive (exact match)
    const matched = Object.keys(votes).filter(d => Array.isArray(votes[d]) && votes[d].some(n => (n || '') === name))
    setSelection(matched)
  }, [user.name, votes])

  useEffect(() => localStorage.setItem(STORAGE_USER_KEY, JSON.stringify({ name: user.name || '', dates: selection })), [user.name, selection])

  function toggleDate(dateStr) {
    if (!user.name || user.name.trim() === '') {
      setMessage('Please enter your name before selecting dates.')
      setTimeout(() => setMessage(''), 2500)
      return
    }
    const todayBelgium = belgiumTodayISO()
    if (dateStr < todayBelgium) {
      setMessage('Cannot select past dates.')
      setTimeout(() => setMessage(''), 2000)
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

  function prevMonth() { setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1)) }
  function nextMonth() { setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1)) }
  // build results list sorted by date is handled in Results component

  return (
    <div className="container">
      <header>
        <h1>World of Tanks — Onslaught: Availability Vote</h1>
        <p>Enter your name, select the specific dates you can play, then submit.</p>
      </header>

      <section className="voting">
        <Calendar
          votes={votes}
          selection={selection}
          toggleDate={toggleDate}
          currentMonth={currentMonth}
          prevMonth={prevMonth}
          nextMonth={nextMonth}
        />

        <Actions user={user} setUser={setUser} submit={submit} removeVote={removeVote} message={message} />
      </section>

      <Results votes={votes} />

      <footer className="footer">
        <div className="footer-center">
          <small>© kaljmarik</small>
        </div>
      </footer>
    </div>
  )
}
