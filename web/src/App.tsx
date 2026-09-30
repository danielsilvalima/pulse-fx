import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { DashboardPage } from './pages/DashboardPage'
import { DetailPage } from './pages/DetailPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <header className="border-b border-line bg-navy text-paper">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link to="/" className="font-serif text-2xl">
              Pulse FX
            </Link>
            <p className="text-xs tracking-wide uppercase">Câmbio e macro</p>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/indicadores/:code" element={<DetailPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
