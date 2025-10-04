import React, { useEffect, useMemo, useState } from 'react'

export default function PublicPage({ hash }) {
  const [event, setEvent] = useState(null)
  const [page, setPage] = useState(null)

  const params = useMemo(() => {
    // #/p/:eventId/:pageId
    const h = (hash || window.location.hash).replace(/^#/, '')
    const parts = h.split('/')
    return { eventId: parts[2], pageId: parts[3] }
  }, [hash])

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/events/${params.eventId}`)
      if (!res.ok) return
      const ev = await res.json()
      setEvent(ev)
      setPage(ev.pages?.find(p => p.id === params.pageId) || null)
    }
    load()
  }, [params.eventId, params.pageId])

  if (!event || !page) return <div className="empty">Страница не найдена</div>

  return (
    <div className="public-page" style={{ backgroundImage: `url(${page.backgroundUrl || ''})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="cover" style={{ height: 180, backgroundImage: `url(${page.coverUrl || ''})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 8 }} />
      <div dangerouslySetInnerHTML={{ __html: page.html || '' }} />
    </div>
  )
}



