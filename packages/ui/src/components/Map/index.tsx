'use client'

import { classMerge } from '@app/ui/lib/utils'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin } from 'lucide-react'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface MapProps {
  center: [number, number]
  zoom?: number
  /** Leaflet tile URL template. No baseMap is drawn until it is provided. */
  tileUrl?: string
  className?: string
  children?: React.ReactNode
}

export interface MapMarkerProps {
  position: [number, number]
  icon?: React.ReactNode
  iconAnchor?: [number, number]
}

// ─── Map Context ────────────────────────────────────────────────────────────────

const MapInstanceContext = React.createContext<L.Map | null>(null)

function useMapInstance() {
  return React.useContext(MapInstanceContext)
}

// ─── Map ────────────────────────────────────────────────────────────────────────

const TILE_ATTRIBUTION = '&copy; <a href="https://www.here.com">HERE</a>'

function Map({ center, zoom = 13, tileUrl, className, children }: MapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const mapRef = React.useRef<L.Map | null>(null)
  const [mapInstance, setMapInstance] = React.useState<L.Map | null>(null)

  React.useEffect(() => {
    const container = containerRef.current
    if (!container || mapRef.current) return

    const map = L.map(container, { zoomControl: false }).setView(center, zoom)

    mapRef.current = map
    setMapInstance(map)

    return () => {
      map.remove()
      mapRef.current = null
      setMapInstance(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    if (!mapInstance || !tileUrl) return
    const layer = L.tileLayer(tileUrl, {
      attribution: TILE_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(mapInstance)
    return () => {
      layer.remove()
    }
  }, [mapInstance, tileUrl])

  // Update view when center/zoom change
  React.useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.setView(center, map.getZoom())
  }, [center])

  return (
    <MapInstanceContext.Provider value={mapInstance}>
      <div
        ref={containerRef}
        className={classMerge(
          'relative h-[400px] w-full overflow-hidden rounded-xl border shadow-sm',
          className,
        )}
      />
      {mapInstance && children}
    </MapInstanceContext.Provider>
  )
}
Map.displayName = 'Map'

// ─── MapMarker ──────────────────────────────────────────────────────────────────

const MARKER_STYLES = `
  .smp-marker {
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    transition: transform 0.2s ease;
  }
  .smp-marker:hover {
    transform: scale(1.15);
  }
`

const DefaultMarkerIcon = () => (
  <MapPin
    className="h-7 w-7"
    style={{ color: 'hsl(239,93%,61%)', fill: 'hsl(239,93%,61%)' }}
  />
)

function MapMarker({ position, icon, iconAnchor = [14, 28] }: MapMarkerProps) {
  const map = useMapInstance()
  const markerRef = React.useRef<L.Marker | null>(null)

  React.useEffect(() => {
    if (!map) return

    const iconHtml = renderToStaticMarkup(<>{icon ?? <DefaultMarkerIcon />}</>)

    // Inject marker styles once
    if (!document.getElementById('smp-marker-styles')) {
      const style = document.createElement('style')
      style.id = 'smp-marker-styles'
      style.textContent = MARKER_STYLES
      document.head.appendChild(style)
    }

    const divIcon = L.divIcon({
      html: `<div class="smp-marker">${iconHtml}</div>`,
      className: '',
      iconSize: [28, 28],
      iconAnchor,
    })

    const marker = L.marker(position, { icon: divIcon }).addTo(map)
    markerRef.current = marker

    return () => {
      marker.remove()
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])

  // Update position when it changes
  React.useEffect(() => {
    markerRef.current?.setLatLng(position)
  }, [position])

  return null
}
MapMarker.displayName = 'MapMarker'

// ─── MapZoomControl ─────────────────────────────────────────────────────────────

function MapZoomControl({
  position = 'bottomright',
}: {
  position?: L.ControlPosition
}) {
  const map = useMapInstance()

  React.useEffect(() => {
    if (!map) return
    const control = L.control.zoom({ position }).addTo(map)
    return () => {
      control.remove()
    }
  }, [map, position])

  return null
}
MapZoomControl.displayName = 'MapZoomControl'

// ─── MapTileLayer (no-op, tile is added in Map) ─────────────────────────────────
// Kept for API compatibility — the tile layer is applied by <Map> from its `tileUrl` prop.
function MapTileLayer() {
  return null
}
MapTileLayer.displayName = 'MapTileLayer'

// ─── Exports ────────────────────────────────────────────────────────────────────

export { Map, MapMarker, MapTileLayer, MapZoomControl }
