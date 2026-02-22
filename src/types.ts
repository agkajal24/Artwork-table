export interface Artwork {
  id: number
  title: string
  place_of_origin: string | null  
  artist_display: string | null
  inscriptions: string | null
  date_start: number | null
  date_end: number | null
}


export interface Pagination {
  total: number        
  limit: number        
  offset: number
  total_pages: number
  current_page: number
}


export interface ArtworkResponse {
  data: Artwork[]
  pagination: Pagination
}