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
        composer.render()
    }

    return animate
}
