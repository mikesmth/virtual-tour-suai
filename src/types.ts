// Все углы в конфиге задаются в ГРАДУСАХ, в радианы конвертирует движок

export interface LevelDef {
    size: number
    tileSize: number
    fallbackOnly?: boolean
}

export type PanoSource =
    | {
        kind: 'equirect'
        url: string
        width: number
    }
    | {
        kind: 'multires'
        urlTemplate: string
        previewUrl: string
        levels: LevelDef[]
    }

export interface ViewDef {
    yaw: number
    pitch: number
    fov: number
}

export interface Rotation {
    yaw?: number
    pitch?: number
}

export interface PickedCoords {
    yaw: number
    pitch: number
}

export interface LinkHotspot {
    type: 'link'
    id: string
    yaw: number
    pitch: number
    target: string
    label?: string
    variant?: 'fwd' | 'back' | 'restart' | 'link'
}

export type HotspotDef = LinkHotspot

export interface SceneDef {
    id: string
    title: string
    description?: string
    source: PanoSource
    initialView?: Partial<ViewDef>
    correction?: Rotation
    hotspots: HotspotDef[]
}

export interface TourConfig {
    startSceneId: string
    scenes: SceneDef[]
}
