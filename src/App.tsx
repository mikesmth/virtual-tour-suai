import { useCallback, useState } from 'react'
import type { PickedCoords } from './types'
import { tour } from './data'
import { TourViewer } from './Tourviewer'

export default function App() {
    const [sceneId, setSceneId] = useState(tour.startSceneId)

    const handleSceneChange = useCallback((id: string) => {
        setSceneId(id)
    }, [])

    const handlePick = useCallback((coords: PickedCoords) => {
        console.log(`yaw: ${coords.yaw}, pitch: ${coords.pitch}`)
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

            <TourViewer
                tour={tour}
                sceneId={sceneId}
                onSceneChange={handleSceneChange}
                onPick={handlePick}
            />

            {/* {scene && (
                <aside className='card card--info'>
                    <h2 className='card__title'>{scene.title}</h2>
                    {scene.description && <p className='card__text'>{scene.description}</p>}
                </aside>
            )} */}
        </div>
    )
}
