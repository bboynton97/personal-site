import * as THREE from 'three'
import type { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

// Using omggif library to decode GIF frames
// Define types for global modifications (legacy support from main.ts)
interface WindowWithGif extends Window {
    gifFrames?: THREE.DataTexture[]
    gifFrameDelays?: number[]
    gifStartTime?: number
}

// Type for the omggif library
declare class GifReader {
    constructor(data: Uint8Array)
    numFrames(): number
    width: number
    height: number
    frameInfo(i: number): { delay: number }
    decodeAndBlitFrameRGBA(i: number, pixels: Uint8Array): void
}

export async function loadAnimatedGIF(whiteOutPass: ShaderPass): Promise<void> {
    const win = window as WindowWithGif
    let gifFrames: THREE.DataTexture[] = []
    let gifFrameDelays: number[] = []
    let gifStartTime = 0

    try {
        // Load omggif library from CDN
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/omggif@1.0.10/omggif.js'
        await new Promise((resolve, reject) => {
            script.onload = resolve
            script.onerror = reject
            document.head.appendChild(script)
        })

        // Fetch the GIF file
        const response = await fetch('/k.gif')
        const arrayBuffer = await response.arrayBuffer()
        const bytes = new Uint8Array(arrayBuffer)

        // Decode GIF using omggif
        // @ts-ignore - omggif is loaded from CDN
        const gifReader = new GifReader(bytes)
        const numFrames = gifReader.numFrames()
        const width = gifReader.width
        const height = gifReader.height

        console.log(`GIF decoded: ${width}x${height}, ${numFrames} frames`)

        // Extract each frame
        gifFrames = []
        gifFrameDelays = []

        for (let i = 0; i < numFrames; i++) {
            const frameInfo = gifReader.frameInfo(i)
            const frameData = new Uint8Array(width * height * 4)
            gifReader.decodeAndBlitFrameRGBA(i, frameData)

            // Create texture from frame data
            const frameTexture = new THREE.DataTexture(frameData, width, height, THREE.RGBAFormat)
            frameTexture.minFilter = THREE.LinearFilter
            frameTexture.magFilter = THREE.LinearFilter
            frameTexture.flipY = true
            frameTexture.needsUpdate = true

            gifFrames.push(frameTexture)
            gifFrameDelays.push(frameInfo.delay * 10) // Convert centiseconds to milliseconds
        }

        // Set initial frame
        if (gifFrames.length > 0) {
            whiteOutPass.uniforms['tImage'].value = gifFrames[0]
            gifStartTime = Date.now()

            // Expose to global scope for animation loop
            win.gifFrames = gifFrames
            win.gifFrameDelays = gifFrameDelays
            win.gifStartTime = gifStartTime
        }

        console.log('GIF frames extracted:', gifFrames.length)
    } catch (error) {
        console.error('Error loading GIF:', error)
        // Fallback: use canvas approach
        const img = new Image()
        img.src = '/k.gif'
        img.onload = () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')!
            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)
            const texture = new THREE.CanvasTexture(canvas)
            texture.minFilter = THREE.LinearFilter
            texture.magFilter = THREE.LinearFilter
            whiteOutPass.uniforms['tImage'].value = texture
        }
    }
}
