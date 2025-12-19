import * as THREE from 'three'
import type { AppState } from './types'
import type { Terminal } from './meshes/Terminal'
import type { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import type { RenderPixelatedPass } from 'three/examples/jsm/postprocessing/RenderPixelatedPass.js'
import type { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import type { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export function setupInputListeners(
    state: AppState,
    terminal: Terminal,
    renderPixelatedPass: RenderPixelatedPass,
    crtPass: ShaderPass,
    bloomPass: UnrealBloomPass,
    renderPass: RenderPass,
    controls: OrbitControls,
    camera: THREE.PerspectiveCamera,
    scene: THREE.Scene,
    DEFAULT_POS: THREE.Vector3,
    DEFAULT_TARGET: THREE.Vector3
): void {
    window.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.key === 'Escape' || (event.ctrlKey && (event.key === 'c' || event.key === 'C'))) {
            state.isFocusingOnScreen = false
            state.isFocusingOnNotepad = false
            state.isFocusingOnButton = false
            terminal.setFocused(false)
        }

        if (event.ctrlKey && (event.key === 'p' || event.key === 'P')) {
            event.preventDefault()
            const isRetro = renderPixelatedPass.enabled

            if (isRetro) {
                // Dev Mode
                renderPixelatedPass.enabled = false
                crtPass.enabled = false
                bloomPass.enabled = false
                renderPass.enabled = true

                controls.enabled = true
                state.isCameraLocked = false
                state.isFocusingOnScreen = false
                state.isFocusingOnNotepad = false
                terminal.setFocused(false)
            } else {
                // View Mode
                renderPass.enabled = false
                renderPixelatedPass.enabled = true
                crtPass.enabled = true
                bloomPass.enabled = true

                controls.enabled = false
                state.isCameraLocked = true

                camera.position.copy(DEFAULT_POS)
                camera.lookAt(DEFAULT_TARGET)
            }
        }

        if (event.ctrlKey && (event.key === 'l' || event.key === 'L')) {
            event.preventDefault()
            // Cycle through light shows
            if (state.currentLightShow === 'lightShow1') {
                state.currentLightShow = 'lightShow2'
            } else if (state.currentLightShow === 'lightShow2') {
                state.currentLightShow = 'lightShow3'
            } else {
                state.currentLightShow = 'lightShow1'
            }
        }

        if (event.key === 'b' || event.key === 'B') {
            // Skip directly to backrooms
            if (!state.isEmergencyStopped) {
                state.isEmergencyStopped = true

                // Hide the warning text
                if (state.emergencyText) state.emergencyText.visible = false

                // Turn off rave lights (handled by loop via state.isEmergencyStopped)

                // Pause then Turn off all lights
                setTimeout(() => {
                    state.isBlackout = true
                    state.roomLights.forEach(light => {
                        // @ts-ignore
                        light.visible = false
                    })

                    // After 1s of darkness, swap environment
                    setTimeout(() => {
                        // Remove Garage Assets
                        state.floorPivots.forEach(p => p.visible = false)
                        state.barrierPivots.forEach(p => p.visible = false)
                        state.wallPivots.forEach(p => p.visible = false)
                        state.speakerPivots.forEach(p => p.visible = false)
                        if (state.carPivot) state.carPivot.visible = false
                        if (state.bikePivot) state.bikePivot.visible = false

                        // Show Backrooms
                        if (state.backroomsPivot) state.backroomsPivot.visible = true

                        // Disable fog for bright backrooms
                        scene.fog = null

                        // Reduce vignette for backrooms
                        crtPass.uniforms['vignetteStrength'].value = 0.3

                        // Enable Backrooms Lights
                        state.backroomsLights.forEach(light => light.visible = true)

                    }, 1000)
                }, 1000)
            }
        }
    })
}
