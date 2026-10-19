import type { TourConfig, SceneDef, LevelDef, LinkHotspot } from './types'

const asset = (name: string) => `${import.meta.env.BASE_URL}panos/${name}`

const PANO_WIDTH = 5376

// Уровни, которые обычно выдаёт Marzipano Tool (куб, 4 уровня). Пригодится для multires.
export const DEFAULT_LEVELS: LevelDef[] = [
    { tileSize: 256, size: 256, fallbackOnly: true },
    { tileSize: 512, size: 512 },
    { tileSize: 512, size: 1024 },
    { tileSize: 512, size: 2048 },
]

const link = (target: string, yaw: number, pitch: number, label: string): LinkHotspot => ({
    type: 'link',
    id: `to-${target}`,
    yaw,
    pitch,
    target,
    label,
})

// Координаты необязательны: без них стрелка ставится по умолчанию
const fwd = (target: string, yaw = 0, pitch = -10) => link(target, yaw, pitch, 'Вперёд')
const back = (target: string, yaw = 180, pitch = -10) => link(target, yaw, pitch, 'Назад')

const restart = (target: string, yaw: number, pitch: number) => link(target, yaw, pitch, 'Назад')

type SceneExtra = Pick<SceneDef, 'description' | 'correction' | 'initialView'>

const scene = (
    id: string,
    title: string,
    hotspots: LinkHotspot[],
    extra: SceneExtra = {},
): SceneDef => ({
    id,
    title,
    source: { kind: 'equirect', url: asset(`${id}.JPG`), width: PANO_WIDTH },
    hotspots,
    ...extra,
})

// Панорамы, снятые «набок»: только поворот картинки.
// initialView у каждой такой сцены задаётся отдельно.
const SIDEWAYS: Pick<SceneDef, 'correction'> = {
    correction: { yaw: 90, pitch: 90 },
}

const scenes: SceneDef[] = [
    scene('R0011363', 'П-1', [
        fwd('R0011364', -24.7, 70.3),
    ], {
        correction: { yaw: 100, pitch: 90 },
        initialView: { yaw: -80.9, pitch: 21, fov: 90 },
    }),

    scene('R0011364', 'П-2', [
        fwd('R0011365', 32.3, -4.9),
        back('R0011363', -64, -79.1),
    ], {
        initialView: { yaw: 5.2, pitch: 10.8 },
    }),

    scene('R0011365', 'П-3', [
        fwd('R0011366', 0, -10),
        link('R0011364', -153.8, -7.9, 'Назад'),
    ], {
        initialView: { yaw: 16.7, pitch: 4.5 },
    }),

    scene('R0011366', 'П-4', [
        link('R0011367', 13.9, 1, 'Вперёд'),
        link('R0011365', 161.4, -9.3, 'Назад'),
    ]),

    scene('R0011367', 'П-5', [
        fwd('R0011369', -120.5, -4.2),
        link('R0011368', 166.2, -0.4, 'Подальше'),
        back('R0011366', -20.7, -0.4),
    ], {
        initialView: { yaw: -0.8, pitch: 3.7 },
    }),

    scene('R0011368', 'П-6', [
        link('R0011367', -53.4, 18.9, 'Назад'),
    ], {
        initialView: { yaw: -164.4, pitch: 17.8 },
    }),

    scene('R0011369', 'П-7', [
        fwd('R0011370', 98.6, 0.1),
        back('R0011368', 0, -10),
    ], {
        initialView: { yaw: -175.2, pitch: 2 },
    }),

    scene('R0011370', 'П-8', [
        fwd('R0011372', 93.1, 8.5),
        link('R0011371', -25.4, -17.9, 'Подальше'),
        back('R0011369', 15.9, 5.6),
    ], {
        initialView: { yaw: -31.9, pitch: -8.8 },
    }),

    scene('R0011371', 'П-9', [
        back('R0011370', -23.4, 26.1),
    ], {
        initialView: { yaw: 170.3, pitch: -20.5 },
    }),

    scene('R0011372', 'П-10', [
        fwd('R0011373', 180, -10),
        back('R0011371', 30.1, 29.6),
    ], {
        initialView: { yaw: -176.6, pitch: -2.1 },
    }),

    scene('R0011373', 'П-11', [
        fwd('R0011374', 78.6, 74.6),
        back('R0011372', -60.4, -11.9),
    ], {
        ...SIDEWAYS,
        initialView: { yaw: -90, pitch: -0.2, fov: 90 },
    }),

    scene('R0011374', 'П-12', [
        fwd('R0011376', 128.6, -4.1),
        back('R0011373', 5.9, -51.8),
    ], {
        initialView: { yaw: 1.5, pitch: 7.8 },
    }),

    scene('R0011376', 'П-13', [
        fwd('R0011377', 173.7, -25.90),
        back('R0011374', 0, -10),
    ], {
        initialView: { yaw: 173.7, pitch: 3.3 },
    }),

    scene('R0011377', 'П-14', [
        fwd('R0011378', 8.9, -3.8),
        back('R0011376', 116.6, 9.3),
    ], {
        initialView: { yaw: 10.5, pitch: 6 },
    }),

    scene('R0011378', 'П-15', [
        fwd('R0011379', 0, -10),
        back('R0011377', -160.8, -5.3),
    ], {
        initialView: { yaw: 5.7, pitch: 4.4 },
    }),

    scene('R0011379', 'П-16', [
        fwd('R0011380', -0.9, 5),
        back('R0011378', 178.7, 4.5),
    ], {
        ...SIDEWAYS,
        initialView: { yaw: 90.9, pitch: 61.7, fov: 90 },
    }),

    scene('R0011380', 'П-17', [
        restart('R0011380', -114.5, -2.3),
        back('R0011379', 103.5, -10.2),
    ], {
        initialView: { yaw: -70.1, pitch: 1.3 },
    }),
]

export const tour: TourConfig = {
    startSceneId: 'R0011363',
    scenes,
}
