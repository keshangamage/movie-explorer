import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { errorMessage, movieApi } from '../api'
import type { Genre, Movie } from '../types'

type ThemeMode = 'dark' | 'light'
type AppState = {
  session: string | null
  login: (username: string, password: string) => boolean
  logout: () => void
  themeMode: ThemeMode
  toggleTheme: () => void
  favorites: Movie[]
  isFavorite: (id: number) => boolean
  toggleFavorite: (movie: Movie) => void
  lastSearch: string
  saveSearch: (query: string) => void
  trending: Movie[]
  trendingLoading: boolean
  trendingError: string | null
  reloadTrending: () => Promise<void>
  genres: Genre[]
  configured: boolean | null
}

const AppContext = createContext<AppState | null>(null)

function readString(key: string, fallback: string): string {
  try { return localStorage.getItem(key) ?? fallback } catch { return fallback }
}

function readFavorites(): Movie[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem('movie-explorer-favorites') ?? '[]')
    return Array.isArray(value) ? value.filter((item): item is Movie => typeof item?.id === 'number' && typeof item?.title === 'string') : []
  } catch { return [] }
}

function saveLocal(key: string, value: string) {
  try { localStorage.setItem(key, value) } catch { /* Browsing still works when storage is unavailable. */ }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<string | null>(() => readString('movie-explorer-session', '') || null)
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => readString('movie-explorer-theme', 'light') === 'dark' ? 'dark' : 'light')
  const [favorites, setFavorites] = useState<Movie[]>(readFavorites)
  const [lastSearch, setLastSearch] = useState(() => readString('movie-explorer-last-search', ''))
  const [trending, setTrending] = useState<Movie[]>([])
  const [trendingLoading, setTrendingLoading] = useState(false)
  const [trendingError, setTrendingError] = useState<string | null>(null)
  const [genres, setGenres] = useState<Genre[]>([])
  const [configured, setConfigured] = useState<boolean | null>(null)

  const login = useCallback((username: string, password: string) => {
    if (username.trim() !== 'demo' || password !== 'movie123') return false
    saveLocal('movie-explorer-session', 'demo')
    setSession('demo')
    return true
  }, [])

  const logout = useCallback(() => {
    try { localStorage.removeItem('movie-explorer-session') } catch { /* ignore */ }
    setSession(null)
  }, [])

  const toggleTheme = useCallback(() => setThemeMode((current) => {
    const next = current === 'dark' ? 'light' : 'dark'
    saveLocal('movie-explorer-theme', next)
    return next
  }), [])

  const isFavorite = useCallback((id: number) => favorites.some((movie) => movie.id === id), [favorites])
  const toggleFavorite = useCallback((movie: Movie) => setFavorites((current) => {
    const next = current.some((item) => item.id === movie.id)
      ? current.filter((item) => item.id !== movie.id)
      : [movie, ...current]
    saveLocal('movie-explorer-favorites', JSON.stringify(next))
    return next
  }), [])

  const saveSearch = useCallback((query: string) => {
    setLastSearch(query)
    saveLocal('movie-explorer-last-search', query)
  }, [])

  const reloadTrending = useCallback(async () => {
    setTrendingLoading(true)
    setTrendingError(null)
    try { setTrending((await movieApi.trending()).results) }
    catch (cause) { setTrendingError(errorMessage(cause)) }
    finally { setTrendingLoading(false) }
  }, [])

  useEffect(() => {
    if (!session) return
    void movieApi.status().then(setConfigured).catch(() => setConfigured(null))
    queueMicrotask(() => { void reloadTrending() })
    void movieApi.genres().then(setGenres).catch(() => setGenres([]))
  }, [session, reloadTrending])

  const value = useMemo(() => ({ session, login, logout, themeMode, toggleTheme, favorites, isFavorite,
    toggleFavorite, lastSearch, saveSearch, trending, trendingLoading, trendingError, reloadTrending, genres, configured,
  }), [session, login, logout, themeMode, toggleTheme, favorites, isFavorite, toggleFavorite,
    lastSearch, saveSearch, trending, trendingLoading, trendingError, reloadTrending, genres, configured])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppState {
  const state = useContext(AppContext)
  if (!state) throw new Error('useApp must be used inside AppProvider')
  return state
}
