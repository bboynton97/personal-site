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
