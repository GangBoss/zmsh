import React, { useMemo, useState } from 'react'

export default function PageEditor({ page, onChange, images = [], pages = [] }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const livePreviewHtml = useMemo(() => {
    return `
      <style>
        .page { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; padding: 16px; }
        .page .cover { height: 180px; background-size: cover; background-position: center; border-radius: 8px; }
        .page .content { padding: 16px 0; }
        .page .preview { border: 1px solid #e2e2e2; border-radius: 8px; padding: 12px; display: flex; gap: 12px; align-items: center; }
        .page .preview img { width: 72px; height: 72px; object-fit: cover; border-radius: 8px; }
        .page .preview .text { display: grid; gap: 4px; }
        .page .preview .title { font-weight: 600; }
      </style>
      <div class="page" style="background-image:url('${escapeAttr(page.backgroundUrl)}'); background-size:cover; background-position:center;">
        <div class="cover" style="background-image:url('${escapeAttr(page.coverUrl)}')"></div>
        <div class="content">${page.html || ''}</div>
        <div class="preview">
          ${page.coverUrl ? `<img src="${escapeAttr(page.coverUrl)}" alt="cover"/>` : ''}
          <div class="text">
            <div class="title">${escapeHtml(page.previewTitle || '')}</div>
            <div class="desc">${escapeHtml(page.previewDescription || '')}</div>
          </div>
        </div>
      </div>
    `
  }, [page])

  function update(key, value) {
    onChange({ ...page, [key]: value })
  }

  function insertAtTextarea(id, text) {
    const el = document.getElementById(id)
    if (!el) return
    const start = el.selectionStart || 0
    const end = el.selectionEnd || 0
    const before = el.value.slice(0, start)
    const after = el.value.slice(end)
    const next = before + text + after
    update('html', next)
    setTimeout(() => {
      el.selectionStart = el.selectionEnd = start + text.length
      el.focus()
    })
  }

  return (
    <div className="page-editor">
      <div className="editor-form">
        <label className="field">
          <span>Название страницы</span>
          <input value={page.title} onChange={e => update('title', e.target.value)} placeholder="Например: Главная" />
        </label>
        <label className="field">
          <span>Обложка (URL)</span>
          <input value={page.coverUrl} onChange={e => update('coverUrl', e.target.value)} placeholder="https://.../cover.jpg" />
        </label>
        <label className="field">
          <span>Фоновое изображение (URL)</span>
          <input value={page.backgroundUrl} onChange={e => update('backgroundUrl', e.target.value)} placeholder="https://.../bg.jpg" />
        </label>
        <label className="field">
          <span>HTML блоки</span>
          <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
            <ImagePicker images={images} onPick={url => insertAtTextarea('page_html_editor', `<img src=\"${url}\" alt=\"\" />`)} />
            <PageLinkPicker pages={pages} onPick={id => insertAtTextarea('page_html_editor', `<a href=\"#/p/${encodeURIComponent(window.location.hash.split('/')[2] || '')}/${id}\">Ссылка на страницу</a>`)} />
          </div>
          <textarea id="page_html_editor" rows={10} value={page.html} onChange={e => update('html', e.target.value)} placeholder="<p>Ваш HTML</p>"></textarea>
        </label>
        <div className="grid-2">
          <label className="field">
            <span>Превью: Заголовок</span>
            <input value={page.previewTitle} onChange={e => update('previewTitle', e.target.value)} placeholder="Короткий заголовок" />
          </label>
          <label className="field">
            <span>Превью: Описание</span>
            <input value={page.previewDescription} onChange={e => update('previewDescription', e.target.value)} placeholder="Короткое описание" />
          </label>
        </div>
      </div>
      <div className="preview-pane">
        <button onClick={() => setIsPreviewOpen(true)}>Открыть предпросмотр</button>
      </div>
      {isPreviewOpen && (
        <div className="modal-backdrop" onClick={() => setIsPreviewOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="icon close" onClick={() => setIsPreviewOpen(false)}>✕</button>
            <iframe title="preview" className="preview-frame" sandbox="allow-same-origin" srcDoc={livePreviewHtml} />
          </div>
        </div>
      )}
    </div>
  )
}

function escapeHtml(str) {
  return String(str).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;')
}

function escapeAttr(str) {
  return escapeHtml(str).replaceAll('"', '&quot;')
}

function ImagePicker({ images, onPick }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)}>Вставить изображение</button>
      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="icon close" onClick={() => setOpen(false)}>✕</button>
            <div className="card-grid">
              {images.map((url, idx) => (
                <div key={idx} className="card image-card" onClick={() => { onPick(url); setOpen(false) }}>
                  <div className="thumb" style={{ backgroundImage: `url(${url})` }} />
                </div>
              ))}
            </div>
            <UploadImageButton onUploaded={url => { onPick(url); setOpen(false) }} />
          </div>
        </div>
      )}
    </>
  )
}

function UploadImageButton({ onUploaded }) {
  async function onChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/uploads', { method: 'POST', body: form })
    const data = await res.json()
    if (data?.url) onUploaded(data.url)
  }
  return (
    <label className="field">
      <span>Загрузить изображение</span>
      <input type="file" accept="image/*" onChange={onChange} />
    </label>
  )
}

function PageLinkPicker({ pages, onPick }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)}>Вставить ссылку на страницу</button>
      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="icon close" onClick={() => setOpen(false)}>✕</button>
            <div className="card-grid">
              {pages.map(p => (
                <div key={p.id} className="card" onClick={() => { onPick(p.id); setOpen(false) }}>
                  <div className="thumb" style={{ backgroundImage: `url(${p.coverUrl || ''})` }} />
                  <div className="card-title">{p.title || 'Без названия'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}



