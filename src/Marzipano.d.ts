// Типы для используемой части API Marzipano
declare module 'marzipano' {
    export interface ViewParams {
        yaw: number
        pitch: number
        fov: number
    }

    export interface Coords {
        yaw: number
        pitch: number
    }

    export interface LevelProperties {
        size?: number
        tileSize?: number
        width?: number
        fallbackOnly?: boolean
    }

    export class Hotspot { }

    export class HotspotContainer {
        createHotspot(
            element: HTMLElement,
            coords: Coords,
            opts?: { perspective?: { radius: number, extraTransforms?: string } },
        ): Hotspot
        destroyHotspot(hotspot: Hotspot): void
        hasHotspot(hotspot: Hotspot): boolean
        listHotspots(): Hotspot[]
    }

    export class RectilinearView {
        constructor(params?: Partial<ViewParams>, limiter?: unknown)
        static limit: {
            traditional(maxResolution: number, maxVFov: number, maxHFov?: number): unknown
        }
        setParameters(params: Partial<ViewParams>): void
        parameters(): ViewParams
        screenToCoordinates(point: { x: number, y: number }, result?: Partial<Coords>): Coords
        yaw(): number
        pitch(): number
        fov(): number
    }

    export class ImageUrlSource {
        static fromString(
            template: string,
            opts?: { cubeMapPreviewUrl?: string, cubeMapPreviewFaceOrder?: string },
        ): ImageUrlSource
    }

    export class CubeGeometry {
        constructor(levels: LevelProperties[])
    }

    export class EquirectGeometry {
        constructor(levels: LevelProperties[])
    }

    export class Scene {
        view(): RectilinearView
        hotspotContainer(): HotspotContainer
        switchTo(opts?: { transitionDuration?: number }, done?: () => void): void
        destroy(): void
    }

    export class Viewer {
        constructor(
            element: HTMLElement,
            opts?: { controls?: { mouseViewMode?: 'drag' | 'qtvr' } },
        )
        createScene(opts: {
            source: ImageUrlSource
            geometry: CubeGeometry | EquirectGeometry
            view: RectilinearView
            pinFirstLevel?: boolean
        }): Scene
        destroyScene(scene: Scene): void
        scene(): Scene | null
        view(): RectilinearView | null
        destroy(): void
    }
}
