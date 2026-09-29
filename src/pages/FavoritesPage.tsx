import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { MovieGrid } from '../components/MovieGrid'
import { Button } from '../components/ui/button'
import { useApp } from '../state/AppContext'

export function FavoritesPage() {
  const { favorites } = useApp()
  return <div className="mx-auto max-w-7xl px-5 py-10 pb-20 lg:px-8 lg:py-14">
    <header className="mb-8 border-b pb-7"><p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Your collection / Saved locally</p><h1 className="font-display mt-3 text-3xl font-semibold tracking-[-.045em] sm:text-4xl">Favorite films</h1><p className="mt-2 text-sm text-muted-foreground">A shelf for the movies you want to revisit.</p></header>
    <MovieGrid movies={favorites} emptyTitle="Your list is waiting" emptyBody="Save a movie with the heart button to keep it here." />
    {favorites.length === 0 && <div className="mt-6 flex justify-center"><Button asChild variant="outline"><Link to="/discover">Discover movies <ArrowRight data-icon="inline-end" /></Link></Button></div>}
  </div>
}
