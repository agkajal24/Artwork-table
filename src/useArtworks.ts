import { useState, useEffect } from 'react'
import { Artwork, ArtworkResponse } from './types'

const API_FIELDS = 'id,title,place_of_origin,artist_display,inscriptions,date_start,date_end'
export const Rows_per_page = 12

export function useArtworks(page: number) {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalRecords, setTotalRecords] = useState(0)

  useEffect(() => {  
    let cancel = false

    const fetchData = async () => {
      // console.log('fetching page', page);
      
      setLoading(true)
      setError(null)
      try {
        const url = `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${Rows_per_page}&fields=${API_FIELDS}`
        const res = await fetch(url)
        // console.log(res);
        
        if (!res.ok) {
          throw new Error('Error, check netwrok')
        }

        const json: ArtworkResponse = await res.json()

        if (!cancel) {
          setArtworks(json.data)
          setTotalRecords(json.pagination.total)
        }
      } catch (err) {
        if (!cancel) {
          setError('error')
        }
      } finally {
        if (!cancel) setLoading(false)
      }
    }

    fetchData()
    return () => {
      cancel = true
    }
  }, [page]) 

  return { artworks, loading, error, totalRecords }
}
