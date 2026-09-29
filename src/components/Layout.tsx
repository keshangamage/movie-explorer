import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Heart, LogOut, Moon, Search, Sun } from 'lucide-react'
import { useApp } from '../state/AppContext'
import { cn } from '../lib/utils'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'

export function Layout() {
  const { logout, themeMode, toggleTheme, lastSearch, saveSearch, configured } = useApp()
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function submit(event: FormEvent) {
    event.preventDefault()
    const next = query.trim()
    if (!next) return
    saveSearch(next)
    navigate(`/search?q=${encodeURIComponent(next)}`)
  }

  return <div className="flex min-h-screen flex-col">
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-3 px-5 py-4 lg:px-8">
        <Link to="/" className="font-display flex shrink-0 items-baseline text-xl font-bold tracking-[-.08em]" aria-label="Frame by Frame home">
          frame<span className="px-0.5 font-normal text-muted-foreground">/</span>frame<span className="ml-1 text-primary">.</span>
        </Link>
        <nav className="order-3 flex w-full items-center gap-4 text-sm font-medium text-muted-foreground sm:gap-6 md:order-none md:w-auto" aria-label="Main navigation">
          <NavLink end to="/" className={({ isActive }) => cn('transition-colors hover:text-foreground', isActive && 'text-foreground')}>Home</NavLink>
          <NavLink to="/discover" className={({ isActive }) => cn('transition-colors hover:text-foreground', isActive && 'text-foreground')}>Discover</NavLink>
          <NavLink to="/favorites" className={({ isActive }) => cn('flex items-center gap-1.5 transition-colors hover:text-foreground', isActive && 'text-foreground')}><Heart className="size-4" /> Saved</NavLink>
          <NavLink to="/credits" className={({ isActive }) => cn('transition-colors hover:text-foreground', isActive && 'text-foreground')}>Credits</NavLink>
        </nav>
        <form onSubmit={submit} role="search" className="order-4 flex w-full items-center gap-2 md:order-none md:ml-auto md:max-w-70 lg:max-w-90">
          <Input aria-label="Search movies" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={lastSearch ? `Search movies (last: ${lastSearch})` : 'Search movies by title'} />
          <Button type="submit" size="icon" variant="outline" aria-label="Submit search"><Search /></Button>
        </form>
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}>
            {themeMode === 'dark' ? <Sun /> : <Moon />}
          </Button>
          <Button variant="ghost" size="icon" onClick={logout} aria-label="Log out" title="Log out"><LogOut /></Button>
        </div>
      </div>
    </header>

    {configured === false && <div className="mx-auto w-full max-w-7xl px-5 pt-5 lg:px-8"><Alert>
      <AlertTitle>Connect TMDB to see live films</AlertTitle>
      <AlertDescription>Add <code className="font-mono text-xs">TMDB_READ_TOKEN</code> to your .env file, then restart the server.</AlertDescription>
    </Alert></div>}

    <main className="flex-1"><Outlet /></main>

  </div>
}
