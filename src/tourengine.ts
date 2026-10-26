import * as Marzipano from 'marzipano'
import type {
    SceneDef,
    TourConfig,
    HotspotDef,
    SoundHotspot,
    ViewDef,
    PickedCoords,
    Rotation,
} from './types'
import { AudioPlayer } from './audio'

const toRad = (deg: number) => (deg * Math.PI) / 180
const toDeg = (rad: number) => (rad * 180) / Math.PI

const DEFAULT_VIEW: ViewDef = { yaw: 0, pitch: 0, fov: 90 }
const MAX_VFOV = toRad(100)
const PRELOAD_DELAY_MS = 400

export interface EngineOptions {
    onSceneChange?: (sceneId: string) => void
    onPick?: (coords: PickedCoords) => void
    onLoadingChange?: (loading: boolean) => void
}

export interface GoToOptions {
    transition?: number
}

interface WorkerReply {
    id: number
    blob?: Blob
    error?: string
}

interface Pending {
    resolve: (url: string) => void
    reject: (err: Error) => void
}

export class TourEngine {
    private viewer: Marzipano.Viewer
    private defs = new Map<string, SceneDef>()
    private scenes = new Map<string, Promise<Marzipano.Scene>>()

    private currentId: string | null = null
    private targetId: string | null = null
    private destroyed = false
    private preloadTimer: number | undefined

    private worker: Worker | null = null
    private pending = new Map<number, Pending>()
    private nextRequestId = 0
    private objectUrls: string[] = []

    // звук и подсказки хотспотов
    private audio = new AudioPlayer()
    private cleanups: Array<() => void> = []
    private openTip: HTMLElement | null = null
    private tipCounter = 0

    constructor(
        private container: HTMLElement,
        tour: TourConfig,
        private opts: EngineOptions = {},
    ) {
        for (const def of tour.scenes) this.defs.set(def.id, def)

        this.viewer = new Marzipano.Viewer(container, {
            controls: { mouseViewMode: 'drag' },
        })

        container.addEventListener('dblclick', this.handleDblClick)
        // capture: срабатывает раньше, чем хотспоты остановят событие
        container.addEventListener('pointerdown', this.handlePointerDown, true)
    }

    get currentSceneId(): string | null {
        return this.currentId
    }

    async goTo(sceneId: string, { transition = 1000 }: GoToOptions = {}): Promise<void> {
        const def = this.defs.get(sceneId)
        if (!def) {
            console.warn(`[TourEngine] Неизвестная сцена: ${sceneId}`)
            return
        }
        if (sceneId === this.targetId) return

        this.targetId = sceneId
        this.setLoading(true)

        let scene: Marzipano.Scene
        try {
            scene = await this.getScene(def)
        } catch (err) {
            if (this.destroyed) return
            console.error(`[TourEngine] Не удалось загрузить сцену ${sceneId}`, err)
            if (this.targetId === sceneId) {
                this.targetId = this.currentId
                this.setLoading(false)
            }
            return
        }

        if (this.destroyed || this.targetId !== sceneId) return
        this.setLoading(false)

        const v = { ...DEFAULT_VIEW, ...def.initialView }
        scene.view().setParameters({
            yaw: toRad(v.yaw),
            pitch: toRad(v.pitch),
            fov: toRad(v.fov),
        })

        // при смене панорамы звук предыдущей выключаем, подсказки закрываем
        this.audio.stop()
        this.closeTip()

        scene.switchTo({ transitionDuration: transition })
        this.currentId = sceneId
        this.opts.onSceneChange?.(sceneId)
        this.schedulePreload(def)
    }

    destroy(): void {
        this.destroyed = true
        window.clearTimeout(this.preloadTimer)
        this.container.removeEventListener('dblclick', this.handleDblClick)
        this.container.removeEventListener('pointerdown', this.handlePointerDown, true)

        for (const cleanup of this.cleanups) cleanup()
        this.cleanups = []
        this.audio.destroy()

        this.worker?.terminate()
        this.worker = null
        for (const p of this.pending.values()) p.reject(new Error('Движок уничтожен'))
        this.pending.clear()

        for (const url of this.objectUrls) URL.revokeObjectURL(url)
        this.objectUrls = []

        this.viewer.destroy()
        this.scenes.clear()
        this.defs.clear()
    }

    private getScene(def: SceneDef): Promise<Marzipano.Scene> {
        let promise = this.scenes.get(def.id)
        if (!promise) {
            promise = this.createScene(def)
            this.scenes.set(def.id, promise)
            promise.catch(() => this.scenes.delete(def.id))
        }
        return promise
    }

    private async createScene(def: SceneDef): Promise<Marzipano.Scene> {
        const { source, geometry, maxResolution } = await this.buildSource(def)
        if (this.destroyed) throw new Error('Движок уничтожен')

        const limiter = Marzipano.RectilinearView.limit.traditional(maxResolution, MAX_VFOV)
        const view = new Marzipano.RectilinearView(undefined, limiter)

        const scene = this.viewer.createScene({ source, geometry, view, pinFirstLevel: true })

        for (const h of def.hotspots) this.addHotspot(scene, h)
        return scene
    }

    private async buildSource(def: SceneDef) {
        const s = def.source

        if (s.kind === 'multires') {
            return {
                source: Marzipano.ImageUrlSource.fromString(s.urlTemplate, {
                    cubeMapPreviewUrl: s.previewUrl,
                }),
                geometry: new Marzipano.CubeGeometry(s.levels),
                maxResolution: Math.max(...s.levels.map((l) => l.size)),
            }
        }

        let url = s.url
        const corr = def.correction
        if (corr && (corr.yaw || corr.pitch)) {
            try {
                url = await this.rotatePano(s.url, s.width, corr)
            } catch (err) {
                if (this.destroyed) throw err
                console.warn(`[TourEngine] Коррекция не удалась (${def.id}), берём оригинал`, err)
            }
        }

        return {
            source: Marzipano.ImageUrlSource.fromString(url),
            geometry: new Marzipano.EquirectGeometry([{ width: s.width }]),
            maxResolution: s.width,
        }
    }

    private schedulePreload(def: SceneDef): void {
        window.clearTimeout(this.preloadTimer)
        this.preloadTimer = window.setTimeout(() => {
            for (const h of def.hotspots) {
                if (h.type !== 'link') continue
                const next = this.defs.get(h.target)
                if (next) this.getScene(next).catch(() => { })
            }
        }, PRELOAD_DELAY_MS)
    }

    private getWorker(): Worker {
        if (this.worker) return this.worker

        const worker = new Worker(new URL('./rotate.worker.ts', import.meta.url), { type: 'module' })

        worker.onmessage = (e: MessageEvent<WorkerReply>) => {
            const { id, blob, error } = e.data
            const p = this.pending.get(id)
            if (!p) return
            this.pending.delete(id)

            if (blob) {
                const url = URL.createObjectURL(blob)
                this.objectUrls.push(url)
                p.resolve(url)
            } else {
                p.reject(new Error(error ?? 'Неизвестная ошибка воркера'))
            }
        }

        worker.onerror = (e) => {
            for (const p of this.pending.values()) p.reject(new Error(e.message))
            this.pending.clear()
        }

        this.worker = worker
        return worker
    }

    private rotatePano(url: string, width: number, rot: Rotation): Promise<string> {
        return new Promise((resolve, reject) => {
            const id = this.nextRequestId++
            this.pending.set(id, { resolve, reject })
            this.getWorker().postMessage({
                id,
                url: new URL(url, document.baseURI).href,
                width,
                yaw: toRad(rot.yaw ?? 0),
                pitch: toRad(rot.pitch ?? 0),
            })
        })
    }

    private setLoading(loading: boolean): void {
        if (!this.destroyed) this.opts.onLoadingChange?.(loading)
    }

    private handleDblClick = (e: MouseEvent): void => {
        const view = this.viewer.view()
        if (!view || !this.opts.onPick) return

        const rect = this.container.getBoundingClientRect()
        const c = view.screenToCoordinates({ x: e.clientX - rect.left, y: e.clientY - rect.top })
        this.opts.onPick({
            yaw: Math.round(toDeg(c.yaw) * 10) / 10,
            pitch: Math.round(toDeg(c.pitch) * 10) / 10,
        })
    }

    // хотспоты

    private addHotspot(scene: Marzipano.Scene, h: HotspotDef): void {
        const { wrap, inner, btn } = this.buildHotspotElement(h)

        switch (h.type) {
            case 'link': {
                const { target } = h
                btn.addEventListener('click', () => void this.goTo(target))
                break
            }
            case 'sound':
                this.bindSound(btn, h)
                break
            case 'url': {
                const { href, newTab = true } = h
                btn.addEventListener('click', () => openUrl(href, newTab))
                break
            }
            case 'info':
                btn.addEventListener('click', () => this.toggleTip(inner))
                break
        }

        stopPropagation(wrap)

        scene.hotspotContainer().createHotspot(wrap, {
            yaw: toRad(h.yaw),
            pitch: toRad(h.pitch),
        })
    }

    private buildHotspotElement(h: HotspotDef) {
        const wrap = document.createElement('div')
        wrap.className = 'hotspot'

        const inner = document.createElement('div')
        inner.className = 'hotspot__inner'

        const btn = document.createElement('button')
        btn.type = 'button'
        btn.className = `hotspot__btn hotspot__btn--${h.type}`
        if (h.type === 'link' && h.variant) btn.classList.add(`hotspot__btn--${h.variant}`)
        btn.textContent = h.icon ?? defaultIcon(h)

        const ariaLabel = h.label ?? (h.type === 'link' ? `Перейти: ${h.target}` : undefined)
        if (ariaLabel) btn.setAttribute('aria-label', ariaLabel)

        inner.appendChild(btn)

        if (h.label || h.text) {
            const tip = document.createElement('div')
            tip.className = `hotspot__tip hotspot__tip--${h.tipSide ?? 'top'}`
            tip.id = `tour-tip-${this.tipCounter++}`
            tip.setAttribute('role', 'tooltip')

            if (h.label) {
                const title = document.createElement('div')
                title.className = 'hotspot__tip-title'
                title.textContent = h.label
                tip.appendChild(title)
            }
            if (h.text) {
                const text = document.createElement('div')
                text.className = 'hotspot__tip-text'
                text.textContent = h.text
                tip.appendChild(text)
            }

            btn.setAttribute('aria-describedby', tip.id)
            inner.appendChild(tip)
        }

        wrap.appendChild(inner)
        return { wrap, inner, btn }
    }

    private bindSound(btn: HTMLButtonElement, h: SoundHotspot): void {
        const idleIcon = h.icon ?? defaultIcon(h)

        const sync = () => {
            const playing = this.audio.isPlaying(h.src)
            btn.classList.toggle('hotspot__btn--playing', playing)
            btn.setAttribute('aria-pressed', String(playing))
            btn.textContent = playing ? '■' : idleIcon
        }

        this.cleanups.push(this.audio.onChange(sync))
        btn.addEventListener('click', () => this.audio.toggle(h.src, { loop: h.loop, volume: h.volume }))
        sync()
    }

    private toggleTip(inner: HTMLElement): void {
        const wasOpen = this.openTip === inner
        this.closeTip()
        if (!wasOpen) {
            inner.classList.add('hotspot__inner--open')
            this.openTip = inner
        }
    }

    private closeTip(): void {
        this.openTip?.classList.remove('hotspot__inner--open')
        this.openTip = null
    }

    private handlePointerDown = (e: PointerEvent): void => {
        if (this.openTip && !this.openTip.contains(e.target as Node)) this.closeTip()
    }
}

function defaultIcon(h: HotspotDef): string {
    switch (h.type) {
        case 'link':
            if (h.variant === 'back') return '↩'
            if (h.variant === 'restart') return '⭯'
            return '➤'
        case 'sound':
            return '♪'
        case 'url':
            return '↗'
        case 'info':
            return 'i'
    }
}

// Открывает только http(s)-ссылки
function openUrl(href: string, newTab: boolean): void {
    let url: URL
    try {
        url = new URL(href, document.baseURI)
    } catch {
        console.warn(`[TourEngine] Некорректная ссылка: ${href}`)
        return
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        console.warn(`[TourEngine] Разрешены только http(s)-ссылки: ${href}`)
        return
    }
    if (newTab) window.open(url.href, '_blank', 'noopener,noreferrer')
    else window.location.assign(url.href)
}

function stopPropagation(el: HTMLElement): void {
    for (const type of ['touchstart', 'touchmove', 'touchend', 'touchcancel', 'wheel', 'mousewheel', 'dblclick']) {
        el.addEventListener(type, (e) => e.stopPropagation())
    }
}
