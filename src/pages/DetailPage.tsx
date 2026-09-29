import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Heart, ImageOff, Star } from 'lucide-react'
import { errorMessage, movieApi, posterUrl } from '../api'
import { useApp } from '../state/AppContext'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '../components/ui/alert'
import { Skeleton } from '../components/ui/skeleton'
import { Separator } from '../components/ui/separator'
import type { MovieDetail } from '../types'

export function DetailPage() {
  const { id } = useParams()
  const { isFavorite, toggleFavorite } = useApp()
  const [movie, setMovie] = useState<MovieDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    const numericId = Number(id)
    if (!Number.isInteger(numericId) || numericId <= 0) return
    let active = true
    queueMicrotask(() => { if (active) { setLoading(true); setError(null) } })
    void movieApi.detail(numericId).then((data) => { if (active) setMovie(data) })
      .catch((cause) => { if (active) setError(errorMessage(cause)) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id, retry])

  if (!Number.isInteger(Number(id)) || Number(id) <= 0) return <div className="mx-auto max-w-7xl px-5 py-10"><Alert variant="destructive"><AlertTitle>Invalid movie link</AlertTitle></Alert></div>
  if (loading) return <div className="mx-auto grid max-w-7xl gap-7 px-5 py-12 md:grid-cols-[220px_1fr] lg:px-8"><Skeleton className="aspect-[2/3] w-full" /><div className="flex flex-col gap-4"><Skeleton className="h-12 w-3/4" /><Skeleton className="h-5 w-2/3" /><Skeleton className="h-28 w-full" /></div></div>
  if (error || !movie) return <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8"><Alert variant="destructive"><AlertTitle>Film details could not load</AlertTitle><AlertDescription>{error || 'This movie is unavailable.'}</AlertDescription><AlertAction><Button variant="outline" size="sm" onClick={() => setRetry((value) => value + 1)}>Retry</Button></AlertAction></Alert></div>

  const trailer = movie.videos?.results.find((video) => video.site === 'YouTube' && video.type === 'Trailer' && video.official && /^[\w-]+$/.test(video.key))
    ?? movie.videos?.results.find((video) => video.site === 'YouTube' && video.type === 'Trailer' && /^[\w-]+$/.test(video.key))
  const director = movie.credits?.crew.find((person) => person.job === 'Director')
  const cast = movie.credits?.cast.slice(0, 8) ?? []
  const saved = isFavorite(movie.id)

  return <div className="pb-20">
    <div className="detail-photo h-50 bg-muted sm:h-75 lg:h-90" style={movie.backdrop_path ? { backgroundImage: `url(${posterUrl(movie.backdrop_path, 'w1280')})` } : undefined} role={movie.backdrop_path ? 'img' : undefined} aria-label={movie.backdrop_path ? `${movie.title} backdrop` : undefined} />
    <div className="mx-auto max-w-7xl px-5 lg:px-8">
      <div className="relative z-10 -mt-15 grid gap-8 md:grid-cols-[220px_minmax(0,1fr)] md:gap-10 lg:gap-14">
        <div className="max-w-55"><div className="aspect-[2/3] overflow-hidden rounded-sm bg-muted shadow-md">{movie.poster_path ? <img src={posterUrl(movie.poster_path)} alt={`${movie.title} poster`} className="size-full object-cover" /> : <div className="flex size-full flex-col items-center justify-center gap-3 text-xs text-muted-foreground"><ImageOff className="size-7" />Poster unavailable</div>}</div></div>
        <div className="min-w-0 pt-17 md:pt-16">
          <Button asChild variant="ghost" size="sm"><Link to="/"><ArrowLeft data-icon="inline-start" /> Back to movies</Link></Button>
          <p className="mt-5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Film details</p>
          <h1 className="font-display mt-2 max-w-3xl text-4xl leading-tight font-semibold tracking-[-.055em] sm:text-5xl">{movie.title}</h1>
          {movie.tagline && <p className="mt-2 text-sm italic text-muted-foreground">“{movie.tagline}”</p>}
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground"><span>{movie.release_date?.slice(0, 4) || 'Year unknown'}</span><span>·</span><span>{movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : 'Runtime unavailable'}</span><span>·</span><span className="inline-flex items-center gap-1 text-foreground"><Star className="size-3.5 fill-current" />{movie.vote_average ? movie.vote_average.toFixed(1) : 'NR'} / 10</span></div>
          <div className="mt-5 flex flex-wrap gap-2">{movie.genres?.map((genre) => <Badge key={genre.id} variant="outline">{genre.name}</Badge>)}</div>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-foreground/85">{movie.overview || 'No synopsis is available for this film yet.'}</p>
          {director && <p className="mt-4 text-sm text-muted-foreground">Directed by <span className="font-medium text-foreground">{director.name}</span></p>}
          <div className="mt-6 flex flex-wrap gap-2"><Button onClick={() => toggleFavorite(movie)}><Heart data-icon="inline-start" className={saved ? 'fill-current' : ''} />{saved ? 'Saved to favorites' : 'Save to favorites'}</Button>
            <Button asChild variant="outline"><a href={`https://www.themoviedb.org/movie/${movie.id}`} target="_blank" rel="noreferrer">View on TMDB <ExternalLink data-icon="inline-end" /></a></Button></div>
        </div>
      </div>
      <Separator className="my-12" />
      <div className="grid gap-12 md:grid-cols-2">
        <section><p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">People</p><h2 className="font-display mt-2 mb-5 text-2xl font-semibold tracking-tight">Top cast</h2>
          {cast.length ? <div className="grid grid-cols-2 gap-x-6">{cast.map((person) => <div key={person.id} className="border-b py-3 text-sm"><div className="font-medium">{person.name}</div><div className="mt-1 text-xs text-muted-foreground">{person.character}</div></div>)}</div> : <p className="text-sm text-muted-foreground">Cast information is unavailable.</p>}
        </section>
        <section><p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Preview</p><h2 className="font-display mt-2 mb-5 text-2xl font-semibold tracking-tight">Watch the trailer</h2>
          {trailer ? <div className="aspect-video overflow-hidden rounded-sm bg-black"><iframe src={`https://www.youtube-nocookie.com/embed/${trailer.key}`} title={`${movie.title} trailer`} className="size-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen loading="lazy" /></div>
            : <div className="flex aspect-video items-center justify-center border bg-muted/35 px-4 text-center text-sm text-muted-foreground">No trailer is available for this film.</div>}
        </section>
      </div>
    </div>
  </div>
}
