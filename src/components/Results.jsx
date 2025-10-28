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
            const cnt = names.length
            const popularityClass = cnt >= 15 ? 'very-popular' : (cnt >= 7 ? 'popular' : '')
            return (
              <li key={d} className={`result-row ${popularityClass}`}>
                <div className="label">
                  <strong>{d}</strong>
                  <span className="count">{cnt}</span>
                </div>
                {cnt > 0 && (
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
