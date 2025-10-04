import React, { useEffect, useMemo, useState } from 'react'

export default function Events() {
  const [events, setEvents] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/events')
        if (!res.ok) throw new Error('failed')
        const data = await res.json()
        setEvents(data)
      } catch {
        // fallback to local
        try {
          const saved = localStorage.getItem('events_list')
          if (saved) setEvents(JSON.parse(saved))
        } catch {}
      }
    }
    load()
  }, [])

  const sorted = useMemo(() => {
    return [...events].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
  }, [events])

  function createNew() {
    window.location.hash = '#/admin/events/new'
  }

  return (
    <div className="events-page">
      <div className="events-header">
        <h2>Мероприятия</h2>
        <div className="spacer" />
        <button className="primary" onClick={createNew}>+ Создать мероприятие</button>
      </div>
      <div className="card-grid">
        <button className="card add-card" onClick={createNew}>+ Новое мероприятие</button>
        {sorted.map(ev => (
          <div key={ev.id} className="card event-card">
            <div className="event-cover" style={{ backgroundImage: `url(${ev.coverUrl || ''})` }} />
            <div className="event-body">
              <div className="event-title">{ev.title || 'Без названия'}</div>
              <div className="event-meta">{(ev.pages?.length || 0)} стр. • {(ev.images?.length || 0)} изобр.</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


