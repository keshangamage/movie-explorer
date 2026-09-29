import { Film } from 'lucide-react'
import { MovieCard } from './MovieCard'
import { Button } from './ui/button'
import { Alert, AlertAction, AlertDescription, AlertTitle } from './ui/alert'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from './ui/empty'
import { Skeleton } from './ui/skeleton'
import type { Movie } from '../types'

type Props = { movies: Movie[]; loading?: boolean; error?: string | null; onRetry?: () => void; emptyTitle?: string; emptyBody?: string }

export function MovieGrid({ movies, loading = false, error, onRetry, emptyTitle = 'No movies found', emptyBody = 'Try a different search or filter.' }: Props) {
  if (loading && movies.length === 0) return <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" aria-label="Loading movies">
    {Array.from({ length: 10 }, (_, index) => <div key={index}><Skeleton className="aspect-[2/3] w-full rounded-sm" /><Skeleton className="mt-3 h-4 w-4/5" /><Skeleton className="mt-2 h-3 w-1/2" /></div>)}
  </div>
  if (error && movies.length === 0) return <Alert variant="destructive"><AlertTitle>Movies could not load</AlertTitle><AlertDescription>{error}</AlertDescription>
    {onRetry && <AlertAction><Button variant="outline" size="sm" onClick={onRetry}>Retry</Button></AlertAction>}
  </Alert>
  if (movies.length === 0) return <Empty className="min-h-65 border"><EmptyHeader><EmptyMedia variant="icon"><Film /></EmptyMedia><EmptyTitle>{emptyTitle}</EmptyTitle><EmptyDescription>{emptyBody}</EmptyDescription></EmptyHeader></Empty>
  return <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">{movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}</div>
}
