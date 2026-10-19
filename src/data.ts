import type { TourConfig, SceneDef, LevelDef } from './types'

const asset = (name: string) => `${import.meta.env.BASE_URL}panos/${name}`

const PANO_WIDTH = 5376

// Уровни, которые обычно выдаёт Marzipano Tool (куб, 4 уровня). Пригодится для multires.
export const DEFAULT_LEVELS: LevelDef[] = [
    { tileSize: 256, size: 256, fallbackOnly: true },
    { tileSize: 512, size: 512 },
    { tileSize: 512, size: 1024 },
    { tileSize: 512, size: 2048 },
]

const scenes: SceneDef[] = [
    {
        id: 'R0011363',
        title: 'П-1',
        source: { kind: 'equirect', url: asset('R0011363.JPG'), width: PANO_WIDTH },
        hotspots: [
            { type: 'link', id: 'to-R0011364', yaw: 0, pitch: -10, target: 'R0011364', label: 'Вперёд' },
        ],
    },
    {
        id: 'R0011364',
        title: 'П-2',
        source: { kind: 'equirect', url: asset('R0011364.JPG'), width: PANO_WIDTH },
        hotspots: [
            { type: 'link', id: 'to-R0011365', yaw: 0, pitch: -10, target: 'R0011365', label: 'Вперёд' },
            { type: 'link', id: 'to-R0011363', yaw: 180, pitch: -10, target: 'R0011363', label: 'Назад' },
        ],
    },
    {
        id: 'R0011365',
        title: 'П-3',
        source: { kind: 'equirect', url: asset('R0011365.JPG'), width: PANO_WIDTH },
        hotspots: [
            { type: 'link', id: 'to-R0011366', yaw: 0, pitch: -10, target: 'R0011366', label: 'Вперёд' },
            { type: 'link', id: 'to-R0011364', yaw: 180, pitch: -10, target: 'R0011364', label: 'Назад' },
        ],
    },
    {
        id: 'R0011366',
        title: 'П-4',
        source: { kind: 'equirect', url: asset('R0011366.JPG'), width: PANO_WIDTH },
        hotspots: [
            { type: 'link', id: 'to-R0011367', yaw: 0, pitch: -10, target: 'R0011367', label: 'Вперёд' },
            { type: 'link', id: 'to-R0011365', yaw: 180, pitch: -10, target: 'R0011365', label: 'Назад' },
        ],
    },
    {
        id: 'R0011367',
        title: 'П-5',
        source: { kind: 'equirect', url: asset('R0011367.JPG'), width: PANO_WIDTH },
        hotspots: [
            { type: 'link', id: 'to-R0011368', yaw: 0, pitch: -10, target: 'R0011368', label: 'Вперёд' },
            { type: 'link', id: 'to-R0011366', yaw: 180, pitch: -10, target: 'R0011366', label: 'Назад' },
        ],
    },
    {
        id: 'R0011368',
        title: 'П-6',
        source: { kind: 'equirect', url: asset('R0011368.JPG'), width: PANO_WIDTH },
        hotspots: [
            { type: 'link', id: 'to-R0011369', yaw: 0, pitch: -10, target: 'R0011369', label: 'Вперёд' },
            { type: 'link', id: 'to-R0011367', yaw: 180, pitch: -10, target: 'R0011367', label: 'Назад' },
        ],
    },
    {
        id: 'R0011369',
        title: 'П-7',
        source: { kind: 'equirect', url: asset('R0011369.JPG'), width: PANO_WIDTH },
        hotspots: [
            { type: 'link', id: 'to-R0011370', yaw: 0, pitch: -10, target: 'R0011370', label: 'Вперёд' },
            { type: 'link', id: 'to-R0011368', yaw: 180, pitch: -10, target: 'R0011368', label: 'Назад' },
        ],
    },
    {
        id: 'R0011370',
        title: 'П-8',
        source: { kind: 'equirect', url: asset('R0011370.JPG'), width: PANO_WIDTH },
        hotspots: [
            { type: 'link', id: 'to-R0011371', yaw: 0, pitch: -10, target: 'R0011371', label: 'Вперёд' },
            { type: 'link', id: 'to-R0011369', yaw: 180, pitch: -10, target: 'R0011369', label: 'Назад' },
        ],
    },
    {
        id: 'R0011371',
        title: 'П-9',
        source: { kind: 'equirect', url: asset('R0011371.JPG'), width: PANO_WIDTH },
        hotspots: [
            { type: 'link', id: 'to-R0011372', yaw: 0, pitch: -10, target: 'R0011372', label: 'Вперёд' },
            { type: 'link', id: 'to-R0011370', yaw: 180, pitch: -10, target: 'R0011370', label: 'Назад' },
        ],
    },
    {
        id: 'R0011372',
        title: 'П-10',
        source: { kind: 'equirect', url: asset('R0011372.JPG'), width: PANO_WIDTH },
        hotspots: [
            { type: 'link', id: 'to-R0011373', yaw: 0, pitch: -10, target: 'R0011373', label: 'Вперёд' },
            { type: 'link', id: 'to-R0011371', yaw: 180, pitch: -10, target: 'R0011371', label: 'Назад' },
        ],
    },
    {
        id: 'R0011373',
        title: 'П-11',
        source: { kind: 'equirect', url: asset('R0011373.JPG'), width: PANO_WIDTH },
        hotspots: [
            { type: 'link', id: 'to-R0011374', yaw: 0, pitch: -10, target: 'R0011374', label: 'Вперёд' },
            { type: 'link', id: 'to-R0011372', yaw: 180, pitch: -10, target: 'R0011372', label: 'Назад' },
        ],
    },
    {
        id: 'R0011374',
        title: 'П-12',
        source: { kind: 'equirect', url: asset('R0011374.JPG'), width: PANO_WIDTH },
        hotspots: [
            { type: 'link', id: 'to-R0011375', yaw: 0, pitch: -10, target: 'R0011375', label: 'Вперёд' },
            { type: 'link', id: 'to-R0011373', yaw: 180, pitch: -10, target: 'R0011373', label: 'Назад' },
        ],
    },
    {
        id: 'R0011375',
        title: 'П-13',
        source: { kind: 'equirect', url: asset('R0011375.JPG'), width: PANO_WIDTH },
        hotspots: [
            { type: 'link', id: 'to-R0011376', yaw: 0, pitch: -10, target: 'R0011376', label: 'Вперёд' },
            { type: 'link', id: 'to-R0011374', yaw: 180, pitch: -10, target: 'R0011374', label: 'Назад' },
        ],
    },
    {
        id: 'R0011376',
        title: 'П-14',
        source: { kind: 'equirect', url: asset('R0011376.JPG'), width: PANO_WIDTH },
        hotspots: [
            { type: 'link', id: 'to-R0011377', yaw: 0, pitch: -10, target: 'R0011377', label: 'Вперёд' },
            { type: 'link', id: 'to-R0011375', yaw: 180, pitch: -10, target: 'R0011375', label: 'Назад' },
        ],
    },
    {
        id: 'R0011377',
        title: 'П-15',
        source: { kind: 'equirect', url: asset('R0011377.JPG'), width: PANO_WIDTH },
        hotspots: [
            { type: 'link', id: 'to-R0011378', yaw: 0, pitch: -10, target: 'R0011378', label: 'Вперёд' },
            { type: 'link', id: 'to-R0011376', yaw: 180, pitch: -10, target: 'R0011376', label: 'Назад' },
        ],
    },
    {
        id: 'R0011378',
        title: 'П-16',
        source: { kind: 'equirect', url: asset('R0011378.JPG'), width: PANO_WIDTH },
        hotspots: [
            { type: 'link', id: 'to-R0011379', yaw: 0, pitch: -10, target: 'R0011379', label: 'Вперёд' },
            { type: 'link', id: 'to-R0011377', yaw: 180, pitch: -10, target: 'R0011377', label: 'Назад' },
        ],
    },
    {
        id: 'R0011379',
        title: 'П-17',
        source: { kind: 'equirect', url: asset('R0011379.JPG'), width: PANO_WIDTH },
        hotspots: [
            { type: 'link', id: 'to-R0011380', yaw: 0, pitch: -10, target: 'R0011380', label: 'Вперёд' },
            { type: 'link', id: 'to-R0011378', yaw: 180, pitch: -10, target: 'R0011378', label: 'Назад' },
        ],
    },
    {
        id: 'R0011380',
        title: 'П-18',
        source: { kind: 'equirect', url: asset('R0011380.JPG'), width: PANO_WIDTH },
        hotspots: [
            { type: 'link', id: 'to-R0011379', yaw: 180, pitch: -10, target: 'R0011379', label: 'Назад' },
        ],
    },
]

export const tour: TourConfig = {
    startSceneId: 'R0011373',
    scenes,
}
