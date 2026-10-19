import { useEffect, useRef, useState } from 'react'
import type { PickedCoords, TourConfig } from './types'
import { TourEngine } from './tourengine'

interface Props {
    tour: TourConfig
    // Текущая сцена (управляется родителем)
    sceneId: string
    onSceneChange: (sceneId: string) => void
    onPick?: (coords: PickedCoords) => void
}

export function TourViewer({ tour, sceneId, onSceneChange, onPick }: Props) {
    const containerRef = useRef<HTMLDivElement>(null)
    const engineRef = useRef<TourEngine | null>(null)
    const [loading, setLoading] = useState(false)

    // Всегда актуальные колбэки, без пересоздания движка
    const handlers = useRef({ onSceneChange, onPick })
    useEffect(() => {
        handlers.current = { onSceneChange, onPick }
    })

    // Стартовая сцена нужна только при создании движка
    const initialSceneId = useRef(sceneId)

    // Движок создаётся один раз на tour
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

        // cleanup важен: в StrictMode эффект выполняется дважды
        return () => {
            engine.destroy()
            engineRef.current = null
        }
    }, [tour])

    // Смена сцены снаружи (навигация сверху); повторный вызов на ту же сцену движок игнорирует
    useEffect(() => {
        void engineRef.current?.goTo(sceneId)
    }, [sceneId])

    return (
        <div className='tour'>
            {/* Marzipano владеет содержимым stage, оверлей React держим снаружи */}
            <div ref={containerRef} className='tour__stage' />
            {loading && <div className='tour__loading'>Загрузка…</div>}
        </div>
    )
}
