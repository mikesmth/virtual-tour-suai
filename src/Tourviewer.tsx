import { useEffect, useRef } from 'react'
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

    // Движок создаётся один раз на tour
    useEffect(() => {
        const el = containerRef.current
        if (!el) return

        const engine = new TourEngine(el, tour, { onSceneChange, onPick })
        engineRef.current = engine
        engine.goTo(sceneId, { transition: 0 })

        // cleanup важен: в StrictMode эффект выполняется дважды
        return () => {
            engine.destroy()
            engineRef.current = null
        }
        // sceneId и колбэки намеренно не в зависимостях: движок не пересоздаём
    }, [tour])

    // Смена сцены снаружи (навигация сверху)
    useEffect(() => {
        const engine = engineRef.current
        if (engine && engine.currentSceneId !== sceneId) engine.goTo(sceneId)
    }, [sceneId])

    return <div ref={containerRef} className='tour' />
}
