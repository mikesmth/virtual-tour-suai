import { useCallback, useState } from 'react'
import type { PickedCoords } from './types'
import { tour } from './data'
import { TourViewer } from './Tourviewer'

export default function App() {
    const [sceneId, setSceneId] = useState(tour.startSceneId)
    const [pick, setPick] = useState<PickedCoords | null>(null)

    const handleSceneChange = useCallback((id: string) => {
        setSceneId(id)
        setPick(null)
    }, [])

    const scene = tour.scenes.find((s) => s.id === sceneId)

    return (
        <div className='app'>
            <nav className='nav'>
                {tour.scenes.map((s) => (
                    <button
                        key={s.id}
                        type='button'
                        className={s.id === sceneId ? 'pill pill--active' : 'pill'}
                        onClick={() => handleSceneChange(s.id)}
                    >
                        {s.title}
                    </button>
                ))}
            </nav>

            <main className='main'>
                <section className='card card--pano'>
                    <TourViewer
                        tour={tour}
                        sceneId={sceneId}
                        onSceneChange={handleSceneChange}
                        onPick={setPick}
                    />
                </section>

                <aside className='card card--info'>
                    <h2 className='card__title'>{scene?.title}</h2>
                    <p className='card__text'>{scene?.description}</p>

                    <div className='card__label'>Двойной клик</div>
                    <pre className='code'>
                        {pick ? `yaw: ${pick.yaw}, pitch: ${pick.pitch}` : '—'}
                    </pre>
                </aside>
            </main>
        </div>
    )
}
