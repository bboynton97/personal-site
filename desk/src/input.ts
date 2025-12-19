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
    })
}
