import React from 'react'

export default function Results({ votes }) {
  const resultDates = Object.keys(votes).sort().filter(d => Array.isArray(votes[d]) && votes[d].length > 0)

  return (
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
  )
}
