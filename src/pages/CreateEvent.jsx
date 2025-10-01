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
    console.log('Submit Event:', eventData)
    alert('Данные мероприятия выведены в консоль. Интеграция с backend позже.')
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
        <section className="pages">
          <div className="pages-sidebar">
            <div className="sidebar-header">
              <h3>Страницы</h3>
              <button onClick={handleAddPage}>+ Создать страницу</button>
            </div>
            <ul className="page-list">
              {eventData.pages.map((p, idx) => (
                <li key={p.id} className={idx === selectedPageIndex ? 'active' : ''}>
                  <button onClick={() => setSelectedPageIndex(idx)}>{p.title || 'Без названия'}</button>
                  <span className="spacer" />
                  <button className="icon danger" title="Удалить" onClick={() => handleDeletePage(idx)}>✕</button>
                </li>
              ))}
            </ul>
          </div>
          <div className="pages-editor">
            {selectedPage ? (
              <PageEditor page={selectedPage} onChange={handleUpdatePage} />
            ) : (
              <div className="empty">Выберите страницу или создайте новую</div>
            )}
          </div>
        </section>
      )}

      {activeTab === 'styles' && (
        <section className="styles">
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
        <section className="images">
          <p>Список загруженных изображений появится здесь после интеграции с backend.</p>
        </section>
      )}
    </div>
  )
}



