// Death screen overlay management

let overlay: HTMLDivElement | null = null
let deathImage: HTMLImageElement | null = null

export function createDeathOverlay(): void {
    // Create black overlay
    overlay = document.createElement('div')
    overlay.id = 'death-overlay'
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: black;
        opacity: 0;
        pointer-events: none;
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: none;
    `
    
    // Create death image
    deathImage = document.createElement('img')
    deathImage.src = '/you-died.png'
    deathImage.style.cssText = `
        max-width: 80%;
        max-height: 80%;
        transform: scale(0.5);
        opacity: 0;
        transition: none;
    `
    
    overlay.appendChild(deathImage)
    document.body.appendChild(overlay)
}

export function updateDeathScreen(progress: number): void {
    if (!overlay || !deathImage) return
    
    // Timeline (progress 0-1):
    // 0.0 - 0.15: Fade to black
    // 0.15 - 0.5: Image fades in while growing
    // 0.5 - 1.0: Image fades out while still growing
    
    // Fade to black (0 - 0.15)
    const blackFadeProgress = Math.min(progress / 0.15, 1)
    overlay.style.opacity = String(blackFadeProgress)
    
    // Continuous zoom throughout (0.15 - 1.0)
    if (progress >= 0.15) {
        const zoomProgress = (progress - 0.15) / 0.85
        // Scale continuously from 0.6 to 1.4
        const scale = 1 + zoomProgress * 0.8
        deathImage.style.transform = `scale(${scale})`
        
        // Fade in (0.15 - 0.5)
        if (progress < 0.5) {
            const fadeInProgress = (progress - 0.15) / 0.35
            deathImage.style.opacity = String(fadeInProgress)
        }
        // Fade out (0.5 - 1.0)
        else {
            const fadeOutProgress = (progress - 0.5) / 0.5
            deathImage.style.opacity = String(1 - fadeOutProgress)
        }
    }
}

export function isDeathOverlayCreated(): boolean {
    return overlay !== null
}
