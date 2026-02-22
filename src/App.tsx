import { useRef, useState } from 'react'
import './App.css'
import {
  DataTable,
  DataTablePageEvent,
  DataTableSelectionMultipleChangeEvent
} from 'primereact/datatable'
import { Column } from 'primereact/column'
import { OverlayPanel } from 'primereact/overlaypanel'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { PrimeReactProvider } from 'primereact/api'

import 'primereact/resources/themes/lara-dark-amber/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'

import { useArtworks, Rows_per_page } from './useArtworks'
import { Artwork } from './types'

export default function App() {

  const overlayRef = useRef<OverlayPanel>(null)
  const [page, setPage] = useState(1)
  const [selectCount, setSelectCount] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [globalSelectCount, setGlobalSelectCount] = useState<number | null>(null)
  const { artworks, loading, error, totalRecords } = useArtworks(page)

  
  const isRowSelected = (artwork: Artwork, indexOnPage: number): boolean => {
  
    if (selectedIds.has(-artwork.id)) return false
    if (selectedIds.has(artwork.id)) return true

    if (globalSelectCount !== null) {
      const pos = (page - 1) * Rows_per_page + indexOnPage
      return pos < globalSelectCount
    }

    return false
  }

  const selectedOnPage: Artwork[] = artworks.filter((artwork, index) =>
    isRowSelected(artwork, index)
  )

  const handlePageChange = (e: DataTablePageEvent) => {
    // console.log('check pages');
    // console.log(e.page);
      
    setPage((e.page ?? 0) + 1)
  }

  const handleSelectionChange = (
    e: DataTableSelectionMultipleChangeEvent<Artwork[]>
  ) => {
    const newSelected = e.value as Artwork[]
    const newSelectedIds = new Set(newSelected.map(a => a.id))

    setSelectedIds(prev => {
      const next = new Set(prev)

      artworks.forEach((artwork, index) => {
        const wasSelected = isRowSelected(artwork, index)
        const isNowSelected = newSelectedIds.has(artwork.id)

        if (!wasSelected && isNowSelected) {
          next.add(artwork.id)
          next.delete(-artwork.id) 
        }

        if (wasSelected && !isNowSelected) {
          next.delete(artwork.id)

          if (globalSelectCount !== null) {
            const globalPosition = (page - 1) * Rows_per_page + index
            if (globalPosition < globalSelectCount) {
              next.add(-artwork.id) 
            }
          }
        }
      })

      return next
    })
  }

  const applySelection = () => {
    const n = parseInt(selectCount, 10)
    if (!n || n <= 0) {
      alert('enter a valid number')
      return
    }


    setGlobalSelectCount(n)
    setSelectedIds(new Set()) 
    overlayRef.current?.hide()
    setSelectCount('')
  }

  const ClearAll = () => {
    setSelectedIds(new Set())
    setGlobalSelectCount(null)
  }

  const Selected = (): number => {
    const checked = [...selectedIds].filter(id => id > 0).length
    const unchecked = [...selectedIds].filter(id => id < 0).length

    if (globalSelectCount !== null) {
      return Math.max(0, globalSelectCount -  unchecked + checked)
    }

    return checked
  }

  const totalSelected = Selected()

  const checkboxColumnHeader = (
    <button
      onClick={e => overlayRef.current?.toggle(e)}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#aaa',
        fontSize: '12px',
        padding: '2px 4px'
      }}
      title="row selection"
    >
      ▼
    </button>
  )

  return (
    <PrimeReactProvider>
      <div className="container">

        <h1 className="heading">Art Institute of Chicago</h1>
        <p className="subheading">Artwork Collection</p>

        {totalSelected > 0 && (
          <div className="selection-bar">
            <span className="selected-count">{totalSelected}</span>
            <span className="selected-label">rows selected</span>
            <button className="clear-btn">Clear all</button>
          </div>
        )}

        {error && (
          <div className="error-msg">Error: {error}</div>
        )}

        <DataTable
          value={artworks}
          lazy={true}
          paginator={true}
          rows={Rows_per_page}
          totalRecords={totalRecords}
          first={(page - 1) * Rows_per_page}
          onPage={handlePageChange}
          loading={loading}
          selection={selectedOnPage}
          onSelectionChange={handleSelectionChange}
          selectionMode="multiple"
          dataKey="id"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
          currentPageReportTemplate="Page {currentPage} of {totalPages} · {totalRecords} total"
          emptyMessage="No artworks found."
          scrollable
          scrollHeight="65vh"
        >
          {/* Checkbox column — header has the custom select button */}
          <Column
            selectionMode="multiple"
            header={checkboxColumnHeader}
            headerStyle={{ width: '3rem' }}
          />

          <Column field="title" header="Title" style={{ minWidth: '200px' }} />

          <Column
            field="place_of_origin"
            header="Origin"
            body={(row: Artwork) => row.place_of_origin || 'N/A'}
            style={{ minWidth: '130px' }}
          />

          <Column
            field="artist_display"
            header="Artist"
            body={(row: Artwork) => row.artist_display || 'N/A'}
            style={{ minWidth: '180px' }}
          />

          <Column
            field="inscriptions"
            header="Inscriptions"
            body={(row: Artwork) => row.inscriptions || 'N/A'}
            style={{ minWidth: '160px' }}
          />

          <Column
            header="Date Start"
            body={(row: Artwork) => row.date_start || 'N/A'}
            style={{ minWidth: '100px' }}
          />

          <Column
            header="Date End"
            body={(row: Artwork) => row.date_end || 'N/A'}
            style={{ minWidth: '100px' }}
          />
        </DataTable>

        <OverlayPanel ref={overlayRef} dismissable>
          <div className="overlay-box">
            <h3 className="overlay-title">Select Rows</h3>
            <p className="overlay-desc">Choose how many rows to select from the top of the collection</p>
            <label className="overlay-label">Number of rows</label>

            <InputText
              type="number"
              value={selectCount}
              onChange={e => setSelectCount(e.target.value)}
              placeholder={`1 – ${totalRecords}`}
              style={{ width: '100%', marginBottom: '16px' }}
              onKeyDown={e => e.key === 'Enter' && applySelection()}
            />

            <div className="overlay-btns">
              <Button
                label="Apply"
                onClick={applySelection}
                style={{ flex: 1 }}
              />
              <Button
                label="Cancel"
                outlined
                onClick={() => overlayRef.current?.hide()}
              />
            </div>
          </div>
        </OverlayPanel>

      </div>
    </PrimeReactProvider>
  )
}