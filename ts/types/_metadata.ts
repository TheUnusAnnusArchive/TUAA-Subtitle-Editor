interface GlobalMetadata {
  videos?: Metadata[][]
}

interface Metadata {
  video?: string,
  sources?: Source[],
  tracks?: Track[],
  thumbnail?: string,
  posters?: Poster[],
  season: number,
  episode: number,
  title: string,
  description: string,
  date?: number,
  releasedate?: number,
  duration?: number
}

interface Source {
  src: string,
  type: string,
  size: number
}

interface Track {
  kind: string,
  label: string,
  srclang: string,
  src: string
}

interface Poster {
  src: string,
  type: string
}

export { GlobalMetadata, Metadata, Source, Track, Poster }