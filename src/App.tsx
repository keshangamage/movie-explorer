import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { AppProvider, useApp } from './state/AppContext'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import { CreditsPage } from './pages/CreditsPage'
import { Skeleton } from './components/ui/skeleton'
import './App.css'

const SearchPage = lazy(() => import('./pages/SearchPage').then((module) => ({ default: module.SearchPage })))
const DiscoverPage = lazy(() => import('./pages/DiscoverPage').then((module) => ({ default: module.DiscoverPage })))
const FavoritesPage = lazy(() => import('./pages/FavoritesPage').then((module) => ({ default: module.FavoritesPage })))
const DetailPage = lazy(() => import('./pages/DetailPage').then((module) => ({ default: module.DetailPage })))

function MovieDetailRoute() {
  const { id } = useParams()
  return <DetailPage key={id} />
}

function AppRoutes() {
  const { session, themeMode } = useApp()
  useEffect(() => { document.documentElement.classList.toggle('dark', themeMode === 'dark') }, [themeMode])

  return <BrowserRouter>
    <Suspense fallback={<div className="mx-auto grid max-w-7xl gap-5 px-5 py-12 sm:grid-cols-3"><Skeleton className="h-80" /><Skeleton className="h-80" /><Skeleton className="h-80" /></div>}>
      <Routes>
        <Route path="/login" element={session ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route element={session ? <Layout /> : <Navigate to="/login" replace />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/credits" element={<CreditsPage />} />
          <Route path="/movie/:id" element={<MovieDetailRoute />} />
        </Route>
        <Route path="*" element={<Navigate to={session ? '/' : '/login'} replace />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
}

export default function App() {
  return <AppProvider><AppRoutes /></AppProvider>
}
