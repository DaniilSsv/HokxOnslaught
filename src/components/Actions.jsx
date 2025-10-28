import React from 'react'

export default function Actions({ user, setUser, submit, removeVote, message }) {
  return (
    <div className="actions">
      <label className="name-input">Your name
        <input value={user.name || ''} onChange={e => setUser(prev => ({ ...prev, name: e.target.value }))} placeholder="Enter your name" />
      </label>
      <button onClick={submit} className="primary">Submit / Update Vote</button>
      <button onClick={removeVote} className="muted">Remove my vote</button>
      {message && <div className="message">{message}</div>}
    </div>
  )
}
