import * as Marzipano from 'marzipano'
import type { SceneDef, TourConfig, LinkHotspot, ViewDef, PickedCoords } from './types'

const toRad = (deg: number) => (deg * Math.PI) / 180
const toDeg = (rad: number) => (rad * 180) / Math.PI

const DEFAULT_VIEW: ViewDef = { yaw: 0, pitch: 0, fov: 90 }
const MAX_VFOV = toRad(100)

export interface EngineOptions {
    onSceneChange?: (sceneId: string) => void
    /** Двойной клик по панораме: координаты точки в градусах (для расстановки хотспотов) */
    onPick?: (coords: PickedCoords) => void
}

export interface GoToOptions {
    /** Длительность перехода в мс (0 — мгновенно) */
    transition?: number
}

/** Ядро тура: не зависит от React, им можно пользоваться и отдельно. */
export class TourEngine {
    private container: HTMLElement
    private viewer: Marzipano.Viewer
    private scenes = new Map<string, Marzipano.Scene>()
    private defs = new Map<string, SceneDef>()
    private onSceneChange?: (sceneId: string) => void
    private onPick?: (coords: PickedCoords) => void
    private currentId: string | null = null

    constructor(container: HTMLElement, tour: TourConfig, opts: EngineOptions = {}) {
        this.container = container
        this.onSceneChange = opts.onSceneChange
        this.onPick = opts.onPick

        this.viewer = new Marzipano.Viewer(container, {
            controls: { mouseViewMode: 'drag' },
        })

        // Сцены создаются сразу, но текстуры грузятся только при показе
        for (const def of tour.scenes) {
            this.defs.set(def.id, def)
            this.scenes.set(def.id, this.createScene(def))
        }

        container.addEventListener('dblclick', this.handleDblClick)
    }

    get currentSceneId(): string | null {
        return this.currentId
    }

    goTo(sceneId: string, { transition = 1000 }: GoToOptions = {}): void {
        const scene = this.scenes.get(sceneId)
        const def = this.defs.get(sceneId)
        if (!scene || !def) {
            console.warn(`[TourEngine] Неизвестная сцена: ${sceneId}`)
            return
        }

        const v = { ...DEFAULT_VIEW, ...def.initialView }
        scene.view().setParameters({
            yaw: toRad(v.yaw),
            pitch: toRad(v.pitch),
            fov: toRad(v.fov),
        })

        scene.switchTo({ transitionDuration: transition })
        this.currentId = sceneId
        this.onSceneChange?.(sceneId)
    }

    destroy(): void {
        this.container.removeEventListener('dblclick', this.handleDblClick)
        this.viewer.destroy()
        this.scenes.clear()
        this.defs.clear()
    }

    // ---------- внутреннее ----------

    private handleDblClick = (e: MouseEvent): void => {
        const view = this.viewer.view()
        if (!view || !this.onPick) return

        const rect = this.container.getBoundingClientRect()
        const c = view.screenToCoordinates({ x: e.clientX - rect.left, y: e.clientY - rect.top })
        this.onPick({
            yaw: Math.round(toDeg(c.yaw) * 10) / 10,
            pitch: Math.round(toDeg(c.pitch) * 10) / 10,
        })
    }

    private createScene(def: SceneDef): Marzipano.Scene {
        const { source, geometry, maxResolution } = this.buildSource(def)

        const limiter = Marzipano.RectilinearView.limit.traditional(maxResolution, MAX_VFOV)
        const view = new Marzipano.RectilinearView(undefined, limiter)

        const scene = this.viewer.createScene({
            source,
            geometry,
            view,
            pinFirstLevel: true,
        })

        for (const h of def.hotspots) {
            if (h.type === 'link') this.addLinkHotspot(scene, h)
        }

        return scene
    }

    private buildSource(def: SceneDef) {
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

        return {
            source: Marzipano.ImageUrlSource.fromString(s.url),
            geometry: new Marzipano.EquirectGeometry([{ width: s.width }]),
            maxResolution: s.width,
        }
    }

    private addLinkHotspot(scene: Marzipano.Scene, h: LinkHotspot): void {
        // Внешний div принадлежит Marzipano (он двигает его сам),
        // стили и hover вешаем на вложенную кнопку.
        const wrap = document.createElement('div')
        wrap.className = 'hotspot'

        const btn = document.createElement('button')
        btn.type = 'button'
        btn.className = 'hotspot__btn'
        btn.title = h.label ?? `Перейти: ${h.target}`
        btn.setAttribute('aria-label', btn.title)
        btn.textContent = '➤'
        btn.addEventListener('click', () => this.goTo(h.target))

        wrap.appendChild(btn)
        stopPropagation(wrap)

        scene.hotspotContainer().createHotspot(wrap, {
            yaw: toRad(h.yaw),
            pitch: toRad(h.pitch),
        })
    }
}

/** Чтобы жесты/колесо на хотспоте не вращали панораму */
function stopPropagation(el: HTMLElement): void {
    for (const type of ['touchstart', 'touchmove', 'touchend', 'touchcancel', 'wheel', 'mousewheel', 'dblclick']) {
        el.addEventListener(type, (e) => e.stopPropagation())
    }
}
