import * as THREE from 'three'
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import type { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import type { RenderPixelatedPass } from 'three/examples/jsm/postprocessing/RenderPixelatedPass.js'
import type { AppState } from './types'
import { Terminal } from './meshes/Terminal'
import { Oscilloscope } from './meshes/Oscilloscope'
import { updateCamera } from './animations/cameraAnimation'
import { updateRaveLights } from './animations/raveLights'
import { updateEffects } from './animations/effects'
import { updateScene } from './animations/sceneUpdates'

export interface AnimationDependencies {
    controls: OrbitControls
    camera: THREE.PerspectiveCamera
    state: AppState
    crtPass: ShaderPass
    terminal: Terminal
    oscilloscope: Oscilloscope
    composer: EffectComposer
    renderPixelatedPass: RenderPixelatedPass
    whiteOutPass: ShaderPass
}

export function createAnimationLoop(deps: AnimationDependencies): () => void {
    const { controls, camera, state, crtPass, terminal, oscilloscope, composer, renderPixelatedPass, whiteOutPass } = deps

    function animate(): void {
        requestAnimationFrame(animate)
        controls.update()

        const time = Date.now() * 0.001

        updateCamera(camera, controls, state)
        updateScene(state, time)
        updateRaveLights(state, time)
        updateEffects(crtPass, whiteOutPass, renderPixelatedPass, state)

        // Pulsate enter button opacity (0.6 to 1.0) - only when not glitching
        if (state.isIntro && state.doorEnterMesh && !state.introGlitchStartTime) {
            const material = state.doorEnterMesh.material as THREE.MeshBasicMaterial
            // Pulsate using sine wave: oscillates between 0.6 and 1.0
            material.opacity = 0.8 + 0.2 * Math.sin(time * 2)
        }

        // Handle intro glitch effect
        if (state.isIntro && state.introGlitchStartTime && state.doorUI) {
            const glitchElapsed = Date.now() - state.introGlitchStartTime
            const glitchDuration = 800 // 0.8 seconds of glitching
            const postGlitchDelay = 1500
            
            if (glitchElapsed < glitchDuration) {
                // Glitch effect: rapidly toggle visibility with random timing
                const glitchSpeed = 50 + Math.random() * 100
                const visible = Math.sin(glitchElapsed / glitchSpeed * Math.PI) > 0
                state.doorUI.visible = visible
                
                // Also randomly offset position slightly for extra glitch feel
                if (state.doorUI.visible) {
                    state.doorUI.position.x = (Math.random() - 0.5) * 0.1
                    state.doorUI.position.y = 2.5 + (Math.random() - 0.5) * 0.1
                }
            } else {
                // Glitch done - hide UI completely
                state.doorUI.visible = false
                state.doorUI.position.x = 0
                state.doorUI.position.y = 2.5
                
                // Wait additional delay after glitch, then start door opening if scene is ready
                if (glitchElapsed >= glitchDuration + postGlitchDelay && 
                    state.introSceneReady && !state.introDoorOpenStartTime) {
                    state.introDoorOpenStartTime = Date.now()
                    
                    // Play door open sound
                    if (state.doorOpenSound && !state.doorOpenSound.isPlaying) {
                        state.doorOpenSound.play()
                    }
                }
            }
        }

        // Handle door opening animation
        if (state.isIntro && state.introDoorOpenStartTime) {
            const doorElapsed = Date.now() - state.introDoorOpenStartTime
            const doorOpenDuration = 2500 // 2.5 seconds to open door
            const targetAngle = (130 * Math.PI) / 180 // 130 degrees (opens to the right)
            
            if (state.doorHingePivot) {
                if (doorElapsed < doorOpenDuration) {
                    // Ease out cubic for smooth door opening
                    const progress = doorElapsed / doorOpenDuration
                    const eased = 1 - Math.pow(1 - progress, 3)
                    state.doorHingePivot.rotation.y = targetAngle * eased
                } else {
                    // Door fully open - start camera movement
                    state.doorHingePivot.rotation.y = targetAngle
                    if (state.introAnimationProgress === 0) {
                        state.introAnimationProgress = 0.001
                    }
                }
            } else {
                // No door hinge found, just start camera after duration
                if (doorElapsed >= doorOpenDuration && state.introAnimationProgress === 0) {
                    state.introAnimationProgress = 0.001
                }
            }
        }

        // Render
        terminal.update()
        // Check if in backrooms (used to disable oscilloscope)
        const isInBackrooms = state.backroomsPivot && state.backroomsPivot.visible
        if (!isInBackrooms) {
            oscilloscope.update()
        }

        // Camera Rumble (140 BPM)
        let shakeX = 0
        let shakeY = 0
        let shakeZ = 0

        if (state.isAudioPlaying) {
            // 140 BPM = 2.333 beats per second
            const beatFreq = 140 / 60
            // Sawtooth wave 0->1 for beat timing
            const beat = (time * beatFreq) % 1

            // Sharp decay envelope (starts at 1, drops fast) creates the "kick" rhythmic feel
            const envelope = Math.pow(1 - beat, 4)

            // High frequency rumble (noise) synced to the beat envelope
            // "Sharp" vibration comes from random noise + fast attack
            const intensity = 0.025
            shakeX = (Math.random() - 0.5) * intensity * envelope
            shakeY = (Math.random() - 0.5) * intensity * envelope
            shakeZ = (Math.random() - 0.5) * intensity * envelope

            camera.position.x += shakeX
            camera.position.y += shakeY
            camera.position.z += shakeZ
        }

        composer.render()

        // Restore camera position to prevent drift/fighting with controls
        if (state.isAudioPlaying) {
            camera.position.x -= shakeX
            camera.position.y -= shakeY
            camera.position.z -= shakeZ
        }
    }

    return animate
}
