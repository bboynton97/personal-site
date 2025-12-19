
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { RenderPixelatedPass } from 'three/examples/jsm/postprocessing/RenderPixelatedPass.js'
import type { AppState } from '../types'

export function updateEffects(
    crtPass: ShaderPass,
    whiteOutPass: ShaderPass,
    renderPixelatedPass: RenderPixelatedPass,
    state: AppState
): void {
    // Update Uniforms
    const time = Date.now() * 0.001
    crtPass.uniforms['time'].value = time
    whiteOutPass.uniforms['time'].value = time

    // Update GIF frame animation if frames are loaded
    if (whiteOutPass.enabled && whiteOutPass.uniforms['fadeAmount'].value > 0.4) {
        // Access gifFrames and gifFrameDelays from global scope (set in main.ts)
        // @ts-ignore - accessing global variables
        const frames = (window as any).gifFrames
        // @ts-ignore
        const delays = (window as any).gifFrameDelays
        // @ts-ignore
        const startTime = (window as any).gifStartTime || 0

        if (frames && frames.length > 0 && delays && delays.length > 0) {
            // Calculate current frame based on elapsed time and frame delays
            let elapsed = Date.now() - startTime

            // Calculate total loop duration
            let totalLoopTime = delays.reduce((sum: number, delay: number) => sum + (delay || 100), 0)
            elapsed = elapsed % totalLoopTime

            // Find which frame we should be on based on cumulative delays
            let cumulativeTime = 0
            let currentFrame = 0

            for (let i = 0; i < delays.length; i++) {
                cumulativeTime += delays[i] || 100 // Default 100ms if no delay
                if (elapsed < cumulativeTime) {
                    currentFrame = i
                    break
                }
            }

            // Update texture to current frame
            if (frames[currentFrame]) {
                whiteOutPass.uniforms['tImage'].value = frames[currentFrame]
            }
        }
    }

    // Pixelation Animation (power pile effect)
    if (state.pixelationAnimationStartTime) {
        const elapsed = (Date.now() - state.pixelationAnimationStartTime) / 1000 // seconds
        const startPixelSize = 1.5
        const endPixelSize = 10
        const upDuration = 15 // 15 seconds to go up
        const fadeOutDuration = 5 // 5 seconds to fade out to white
        const whiteHoldDuration = 8 // 8 seconds to hold at full white (show pattern)
        const fadeInDuration = 5 // 5 seconds to fade back in
        const downDuration = 10 // 10 seconds to go down
        const holdDuration = fadeOutDuration + whiteHoldDuration + fadeInDuration
        const duration = upDuration + holdDuration + downDuration // total duration

        // Music filter: normal is ~2500Hz, muffled is ~800Hz
        const normalFilterFreq = 2500
        const muffledFilterFreq = 800

        if (elapsed < duration) {
            let pixelSize: number
            const isHoldPhase = elapsed >= upDuration && elapsed < upDuration + holdDuration
            const holdElapsed = elapsed - upDuration

            if (elapsed < upDuration) {
                // Phase 1: Going up from 1.5 to 10
                const t = elapsed / upDuration // 0 to 1
                pixelSize = startPixelSize + (endPixelSize - startPixelSize) * t
                whiteOutPass.enabled = false

                // Gradually lower the music filter as animation sets in
                if (state.musicFilter) {
                    state.musicFilter.frequency.value = normalFilterFreq - (normalFilterFreq - muffledFilterFreq) * t
                }
            } else if (isHoldPhase) {
                // Phase 2: Hold at max pixelation, fade to white, hold at white, then fade back
                pixelSize = endPixelSize
                whiteOutPass.enabled = true

                // Keep music muffled during hold phase
                if (state.musicFilter) {
                    state.musicFilter.frequency.value = muffledFilterFreq
                }

                let fadeAmount: number
                if (holdElapsed < fadeOutDuration) {
                    // Fade out to white
                    fadeAmount = holdElapsed / fadeOutDuration // 0 to 1
                } else if (holdElapsed < fadeOutDuration + whiteHoldDuration) {
                    // Hold at full white (show pattern)
                    fadeAmount = 1.0
                } else {
                    // Fade back in from white
                    const fadeInElapsed = holdElapsed - fadeOutDuration - whiteHoldDuration
                    fadeAmount = 1.0 - (fadeInElapsed / fadeInDuration) // 1 to 0
                }

                whiteOutPass.uniforms['fadeAmount'].value = fadeAmount

                // Reduce vignette as white fade comes in (inverse of fadeAmount)
                crtPass.uniforms['vignetteStrength'].value = 1.0 - fadeAmount
            } else {
                // Phase 3: Going down from 10 to 1.5
                const t = (elapsed - upDuration - holdDuration) / downDuration // 0 to 1
                pixelSize = endPixelSize - (endPixelSize - startPixelSize) * t
                whiteOutPass.enabled = false

                // Gradually return music filter to normal as animation fades out
                if (state.musicFilter) {
                    state.musicFilter.frequency.value = muffledFilterFreq + (normalFilterFreq - muffledFilterFreq) * t
                }
            }

            // Update pixel size using the setPixelSize method
            renderPixelatedPass.setPixelSize(pixelSize)
        } else {
            // Animation complete, reset to default
            renderPixelatedPass.setPixelSize(startPixelSize)
            whiteOutPass.enabled = false
            crtPass.uniforms['vignetteStrength'].value = 1.0 // Restore default vignette
            // Restore music filter to normal
            if (state.musicFilter) {
                state.musicFilter.frequency.value = normalFilterFreq
            }
            state.pixelationAnimationStartTime = undefined
        }
    } else {
        // Ensure fade effect is disabled when not animating
        whiteOutPass.enabled = false
    }
}
