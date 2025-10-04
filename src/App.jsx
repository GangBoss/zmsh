import React, { useEffect, useMemo, useState } from 'react'
import CreateEvent from './pages/CreateEvent.jsx'
import Events from './pages/Events.jsx'
import PublicPage from './pages/PublicPage.jsx'

export default function App() {
  const [hash, setHash] = useState(window.location.hash || '#/admin/events')

  useEffect(() => {
    function onHashChange() { setHash(window.location.hash || '#/admin/events') }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const route = useMemo(() => {
    const h = hash.replace(/^#/, '')
    if (h.startsWith('/admin/events/new')) return 'create'
    if (h.startsWith('/p/')) return 'public'
    return 'events'
  }, [hash])

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Конструктор мероприятий</h1>
      </header>
      <main className="app-main">
        {route === 'events' && <Events />}
        {route === 'create' && <CreateEvent />}
        {route === 'public' && <PublicPage hash={hash} />}
      </main>
    </div>
  )
}



