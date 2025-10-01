import React, { useMemo } from 'react'

export default function PageEditor({ page, onChange }) {
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
          <textarea rows={10} value={page.html} onChange={e => update('html', e.target.value)} placeholder="<p>Ваш HTML</p>"></textarea>
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
        <div className="preview-header">Предпросмотр</div>
        <iframe title="preview" className="preview-frame" sandbox="allow-same-origin" srcDoc={livePreviewHtml} />
      </div>
    </div>
  )
}

function escapeHtml(str) {
  return String(str).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;')
}

function escapeAttr(str) {
  return escapeHtml(str).replaceAll('"', '&quot;')
}



