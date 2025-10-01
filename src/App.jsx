import React from 'react'
import CreateEvent from './pages/CreateEvent.jsx'

export default function App() {
  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Конструктор мероприятий</h1>
      </header>
      <main className="app-main">
        <CreateEvent />
      </main>
    </div>
  )
}



