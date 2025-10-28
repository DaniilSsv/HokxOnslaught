export function formatDateISO(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// return today's date in Belgium as YYYY-MM-DD using locale insensitive format
export function belgiumTodayISO() {
  try {
    // 'en-CA' produces ISO-like YYYY-MM-DD in most browsers; specify Brussels timezone
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Brussels' })
  } catch (e) {
    // fallback to local date format (may mismatch if client TZ differs)
    return formatDateISO(new Date())
  }
}

export function monthName(d) {
  return d.toLocaleString(undefined, { month: 'long', year: 'numeric' })
}

export function daysForMonth(date) {
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
