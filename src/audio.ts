// Воспроизведение звуков тура
// Одновременно играет один звук: запуск нового останавливает предыдущий

export interface PlayOptions {
    loop?: boolean
    volume?: number // Громкость 0…1
}

type Listener = () => void

export class AudioPlayer {
    private audio: HTMLAudioElement | null = null
    private current: string | null = null
    private listeners = new Set<Listener>()

    // URL звука, который играет сейчас (или null) 
    get playingSrc(): string | null {
        return this.current
    }

    isPlaying(src: string): boolean {
        return this.current === src
    }

    // Подписка на любые изменения (старт, остановка, конец трека, ошибка). Возвращает функцию отписки.
    onChange(listener: Listener): () => void {
        this.listeners.add(listener)
        return () => {
            this.listeners.delete(listener)
        }
    }

    // Если этот звук уже играет - выключает, иначе включает
    toggle(src: string, opts: PlayOptions = {}): void {
        if (this.current === src) this.stop()
        else this.play(src, opts)
    }

    play(src: string, { loop = false, volume = 1 }: PlayOptions = {}): void {
        this.stop()

        const audio = new Audio(src)
        audio.loop = loop
        audio.volume = Math.min(1, Math.max(0, volume))
        audio.addEventListener('ended', () => this.finish(audio))
        audio.addEventListener('error', () => {
            console.warn(`[AudioPlayer] Не удалось загрузить звук: ${src}`)
            this.finish(audio)
        })

        this.audio = audio
        this.current = src
        this.emit()

        // play() может быть отклонён браузером или прерван паузой
        audio.play().catch((err: unknown) => {
            if (err instanceof DOMException && err.name === 'AbortError') return
            console.warn(`[AudioPlayer] Воспроизведение не удалось: ${src}`, err)
            this.finish(audio)
        })
    }

    stop(): void {
        const audio = this.audio
        if (!audio) return
        audio.pause()
        this.finish(audio)
    }

    destroy(): void {
        this.stop()
        this.listeners.clear()
    }

    private finish(audio: HTMLAudioElement): void {
        // события старого элемента после запуска нового игнорируем
        if (this.audio !== audio) return
        this.audio = null
        this.current = null
        this.emit()
    }

    private emit(): void {
        for (const listener of this.listeners) listener()
    }
}
