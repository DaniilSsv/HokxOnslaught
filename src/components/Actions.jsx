import React from 'react'

export default function Actions({ user, setUser, submit, message }) {
  return (
    <div className="actions">
      <label className="name-input">Your name
        <input value={user.name || ''} onChange={e => setUser(prev => ({ ...prev, name: e.target.value }))} placeholder="Enter your name" />
      </label>
      <button onClick={submit} className="primary">Submit / Update Vote</button>
      <p>Please refrain from using other players' names.</p>
      {message && <div className="message">{message}</div>}
    </div>
  )
}
