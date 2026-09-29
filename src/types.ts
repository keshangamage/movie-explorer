export type Movie = {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  genre_ids?: number[]
}

export type MoviePage = {
  page: number
  results: Movie[]
  total_pages: number
  total_results: number
}

export type Genre = { id: number; name: string }

export type MovieDetail = Movie & {
  runtime: number | null
  tagline: string
  genres: Genre[]
  homepage: string | null
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[]
    crew: { id: number; name: string; job: string }[]
  }
  videos?: {
    results: { id: string; name: string; key: string; site: string; type: string; official: boolean }[]
  }
}

export type DiscoverFilters = { genre: string; year: string; rating: string }
