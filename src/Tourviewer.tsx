import { useEffect, useRef, useState } from 'react'
import type { PickedCoords, TourConfig } from './types'
import { TourEngine } from './tourengine'

interface Props {
    tour: TourConfig
    sceneId: string
    onSceneChange: (sceneId: string) => void
    onPick?: (coords: PickedCoords) => void
}

export function TourViewer({ tour, sceneId, onSceneChange, onPick }: Props) {
    const containerRef = useRef<HTMLDivElement>(null)
    const engineRef = useRef<TourEngine | null>(null)
    const [loading, setLoading] = useState(false)

    const handlers = useRef({ onSceneChange, onPick })
    useEffect(() => {
        handlers.current = { onSceneChange, onPick }
    })

    const initialSceneId = useRef(sceneId)

    useEffect(() => {
        const el = containerRef.current
        if (!el) return

        const engine = new TourEngine(el, tour, {
            onSceneChange: (id) => handlers.current.onSceneChange(id),
            onPick: (c) => handlers.current.onPick?.(c),
            onLoadingChange: setLoading,
        })
        engineRef.current = engine
        void engine.goTo(initialSceneId.current, { transition: 0 })

        return () => {
            engine.destroy()
            engineRef.current = null
        }
    }, [tour])

    useEffect(() => {
        void engineRef.current?.goTo(sceneId)
    }, [sceneId])

    return (
        <div className='tour'>
            <div ref={containerRef} className='tour__stage' />
            {loading && <div className='tour__loading'>Загрузка панорамы…</div>}
        </div>
    )
}
