import React, { useMemo, useState, useEffect } from 'react'
import Tabs from '../shared/Tabs.jsx'
import PageEditor from '../shared/PageEditor.jsx'

const DEFAULT_EVENT = {
  title: '',
  pages: [],
  styles: '',
  images: []
}

export default function CreateEvent() {
  const [activeTab, setActiveTab] = useState('pages')
  const [eventData, setEventData] = useState(DEFAULT_EVENT)
  const [selectedPageIndex, setSelectedPageIndex] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('create_event_draft')
    if (saved) {
      try { setEventData(JSON.parse(saved)) } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('create_event_draft', JSON.stringify(eventData))
  }, [eventData])

  const selectedPage = useMemo(() => {
    if (selectedPageIndex == null) return null
    return eventData.pages[selectedPageIndex] || null
  }, [eventData.pages, selectedPageIndex])

  function handleAddPage() {
    const newPage = {
      id: crypto.randomUUID(),
      title: 'Новая страница',
      coverUrl: '',
      backgroundUrl: '',
      html: '',
      previewTitle: 'Превью',
      previewDescription: ''
    }
    setEventData(prev => ({ ...prev, pages: [...prev.pages, newPage] }))
    setSelectedPageIndex(eventData.pages.length)
  }

  function handleUpdatePage(updatedPage) {
    setEventData(prev => ({
      ...prev,
      pages: prev.pages.map((p, idx) => idx === selectedPageIndex ? updatedPage : p)
    }))
  }

  function handleDeletePage(index) {
    setEventData(prev => ({
      ...prev,
      pages: prev.pages.filter((_, idx) => idx !== index)
    }))
    setSelectedPageIndex(null)
  }

  function handleSaveDraft() {
    localStorage.setItem('create_event_draft', JSON.stringify(eventData))
    alert('Черновик сохранён локально')
  }

  function handleClearDraft() {
    localStorage.removeItem('create_event_draft')
    setEventData(DEFAULT_EVENT)
    setSelectedPageIndex(null)
  }

  function handleSubmit() {
    // Placeholder: send to backend later
    const withId = { id: eventData.id || crypto.randomUUID(), ...eventData, updatedAt: Date.now() }
    console.log('Submit Event:', withId)
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(withId)
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(() => {
        alert('Мероприятие сохранено')
        window.location.hash = '#/admin/events'
      })
      .catch(() => {
        // fallback to local
        try {
          const listRaw = localStorage.getItem('events_list')
          const list = listRaw ? JSON.parse(listRaw) : []
          const next = [withId, ...list.filter(e => e.id !== withId.id)]
          localStorage.setItem('events_list', JSON.stringify(next))
          alert('Мероприятие сохранено локально (offline)')
          window.location.hash = '#/admin/events'
        } catch {
          alert('Не удалось сохранить мероприятие')
        }
      })
  }

  return (
    <div className="create-event">
      <section className="event-meta">
        <label className="field">
          <span>Название мероприятия</span>
          <input
            value={eventData.title}
            onChange={e => setEventData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Моё мероприятие"
          />
        </label>
        <div className="meta-actions">
          <button onClick={handleSaveDraft}>Сохранить черновик</button>
          <button className="secondary" onClick={handleClearDraft}>Сбросить</button>
          <button className="primary" onClick={handleSubmit}>Сохранить мероприятие</button>
        </div>
      </section>

      <Tabs
        tabs={[
          { id: 'pages', label: 'Страницы мероприятия' },
          { id: 'styles', label: 'Стили мероприятия' },
          { id: 'images', label: 'Изображения мероприятия' }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'pages' && (
        <section className="block-section">
          <div className="section-header">
            <div className="spacer" />
            <button onClick={handleAddPage}>+ Создать страницу</button>
          </div>
          <div className="card-grid">
            {eventData.pages.map((p, idx) => (
              <div key={p.id} className={['card', idx === selectedPageIndex ? 'active' : ''].join(' ')} onClick={() => setSelectedPageIndex(idx)}>
                <div className="thumb" style={{ backgroundImage: `url(${p.coverUrl || ''})` }} />
                <div className="card-title">{p.title || 'Без названия'}</div>
                <button className="icon danger remove" title="Удалить" onClick={(e) => { e.stopPropagation(); handleDeletePage(idx) }}>✕</button>
              </div>
            ))}
          </div>

          <div className="editor-panel">
            {selectedPage ? (
              <PageEditor page={selectedPage} onChange={handleUpdatePage} images={eventData.images} pages={eventData.pages} />
            ) : (
              <div className="empty">Выберите страницу или создайте новую</div>
            )}
          </div>
        </section>
      )}

      {activeTab === 'styles' && (
        <section className="block-section">
          <div className="section-header">
            <div className="spacer" />
          </div>
          <label className="field">
            <span>CSS стили мероприятия</span>
            <textarea
              className="code"
              rows={14}
              value={eventData.styles}
              onChange={e => setEventData(prev => ({ ...prev, styles: e.target.value }))}
              placeholder={"/* Вставьте кастомные стили */\n.page-title { font-weight: 600; }"}
            />
          </label>
          <p className="hint">Стили будут применяться к страницам после выбора карты стилей.</p>
        </section>
      )}

      {activeTab === 'images' && (
        <section className="block-section">
          <div className="section-header">
            <div className="spacer" />
            <button disabled>+ Загрузить изображение (позже)</button>
          </div>
          <div className="card-grid">
            {(eventData.images || []).map((src, idx) => (
              <div key={idx} className="card image-card">
                <div className="thumb" style={{ backgroundImage: `url(${src})` }} />
              </div>
            ))}
            {(!eventData.images || eventData.images.length === 0) && (
              <div className="empty">Список изображений появится после загрузки</div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}



