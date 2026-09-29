import { Link } from 'react-router-dom'
import { Heart, ImageOff, Star } from 'lucide-react'
import { posterUrl } from '../api'
import { useApp } from '../state/AppContext'
import { Button } from './ui/button'
import type { Movie } from '../types'

export function MovieCard({ movie }: { movie: Movie }) {
  const { isFavorite, toggleFavorite } = useApp()
  const saved = isFavorite(movie.id)

  return <article className="min-w-0">
    <div className="relative overflow-hidden rounded-sm bg-muted">
      <Link to={`/movie/${movie.id}`} aria-label={`View details for ${movie.title}`} className="poster-link block aspect-[2/3] overflow-hidden">
        {movie.poster_path ? <img src={posterUrl(movie.poster_path)} alt={`${movie.title} poster`} loading="lazy" className="poster-image size-full object-cover" />
          : <span className="flex size-full flex-col items-center justify-center gap-3 px-4 text-center text-xs text-muted-foreground"><ImageOff className="size-7" />Poster unavailable</span>}
      </Link>
      <div className="absolute top-2 right-2 shadow-sm"><Button variant="secondary" size="icon-sm" aria-label={`${saved ? 'Remove' : 'Add'} ${movie.title} ${saved ? 'from' : 'to'} favorites`}
        onClick={() => toggleFavorite(movie)} title={saved ? 'Remove from favorites' : 'Add to favorites'}>
        <Heart className={saved ? 'fill-current' : ''} />
      </Button></div>
    </div>
    <div className="pt-3">
      <Link to={`/movie/${movie.id}`} className="line-clamp-2 text-sm leading-snug font-semibold hover:underline hover:underline-offset-2">{movie.title}</Link>
      <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
        <span>{movie.release_date?.slice(0, 4) || 'Year unknown'}</span><span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1"><Star className="size-3 fill-current" />{movie.vote_average ? movie.vote_average.toFixed(1) : 'NR'}</span>
      </div>
    </div>
  </article>
}
