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

// Общие поля всех хотспотов (кнопок на панораме)
export interface HotspotBase {
    id: string
    yaw: number
    pitch: number // Заголовок подсказки, показывается при наведении
    label?: string // Дополнительный текст подсказки (под заголовком)
    text?: string // Значок на кнопке; по умолчанию зависит от типа хотспота
    icon?: string // С какой стороны от кнопки показывать подсказку (по умолчанию сверху)
    tipSide?: 'top' | 'bottom'
}

// Переход на другую панораму
export interface LinkHotspot extends HotspotBase {
    type: 'link'
    target: string
    variant?: 'fwd' | 'back' | 'restart' | 'link'
}

// Кнопка со звуком: нажатие включает, повторное — выключает
export interface SoundHotspot extends HotspotBase {
    type: 'sound' // URL аудиофайла
    src: string
    loop?: boolean // Громкость 0…1
    volume?: number
}

// Кнопка-ссылка (в том числе на видео)
export interface UrlHotspot extends HotspotBase {
    type: 'url'
    href: string // Открывать в новой вкладке (по умолчанию да)
    newTab?: boolean
}

// Только текст: подсказка при наведении, по клику закрепляется (для сенсорных экранов)
export interface InfoHotspot extends HotspotBase {
    type: 'info'
}

export type HotspotDef = LinkHotspot | SoundHotspot | UrlHotspot | InfoHotspot

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
