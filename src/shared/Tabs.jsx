import React from 'react'

export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="tabs">
      {tabs.map(t => (
        <button
          key={t.id}
          className={['tab', t.id === activeTab ? 'active' : ''].join(' ')}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )}



