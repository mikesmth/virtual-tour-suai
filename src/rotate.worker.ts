// Поворот эквидистантной панорамы (yaw/pitch) вне главного потока
// Углы приходят в радианах

interface RotateRequest {
    id: number
    url: string
    width: number
    yaw: number
    pitch: number
}

const TWO_PI = Math.PI * 2

async function rotate({ url, width, yaw, pitch }: RotateRequest): Promise<Blob> {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status} для ${url}`)

    const bitmap = await createImageBitmap(await res.blob())
    const sw = bitmap.width
    const sh = bitmap.height

    const srcCanvas = new OffscreenCanvas(sw, sh)
    const srcCtx = srcCanvas.getContext('2d')!
    srcCtx.drawImage(bitmap, 0, 0)
    bitmap.close()
    // Работаем с пикселями как с Uint32: копирование RGBA за одну операцию
    const src = new Uint32Array(srcCtx.getImageData(0, 0, sw, sh).data.buffer)

    const w = width
    const h = Math.round(width / 2)
    const dstImage = new ImageData(w, h)
    const dst = new Uint32Array(dstImage.data.buffer)

    // Предрасчёт: то, что не зависит от строки/пикселя, не считаем в цикле
    const cosL = new Float64Array(w)
    const sinL = new Float64Array(w)
    for (let x = 0; x < w; x++) {
        const lambda = (x / w) * TWO_PI - Math.PI
        cosL[x] = Math.cos(lambda)
        sinL[x] = Math.sin(lambda)
    }

    const cy = Math.cos(-yaw)
    const sy = Math.sin(-yaw)
    const cp = Math.cos(-pitch)
    const sp = Math.sin(-pitch)

    for (let y = 0; y < h; y++) {
        const phi = Math.PI / 2 - (y / h) * Math.PI
        const cosPhi = Math.cos(phi)
        const Y = Math.sin(phi)
        const row = y * w

        for (let x = 0; x < w; x++) {
            const X = cosPhi * cosL[x]
            const Z = cosPhi * sinL[x]

            // Поворот по pitch, затем по yaw
            const Z1 = Y * sp + Z * cp
            const X2 = X * cy + Z1 * sy
            const Y2 = Y * cp - Z * sp
            const Z2 = -X * sy + Z1 * cy

            const phiSrc = Math.asin(Math.max(-1, Math.min(1, Y2)))
            const lambdaSrc = Math.atan2(Z2, X2)

            const xs = Math.floor(((lambdaSrc + Math.PI) / TWO_PI) * sw) % sw
            const ys = Math.min(sh - 1, Math.floor(((Math.PI / 2 - phiSrc) / Math.PI) * sh))

            dst[row + x] = src[ys * sw + xs]
        }
    }

    const out = new OffscreenCanvas(w, h)
    out.getContext('2d')!.putImageData(dstImage, 0, 0)
    return out.convertToBlob({ type: 'image/jpeg', quality: 0.92 })
}

self.onmessage = async (e: MessageEvent<RotateRequest>) => {
    const { id } = e.data
    try {
        const blob = await rotate(e.data)
        self.postMessage({ id, blob })
    } catch (err) {
        self.postMessage({ id, error: err instanceof Error ? err.message : String(err) })
    }
}
