import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { AppState } from '../types'

// Camera position constants
const ZOOM_POS = new THREE.Vector3(-2.8, 2.8, 1.2)
const ZOOM_TARGET = new THREE.Vector3(-3.4, 2.5, -0.1)
const NOTEPAD_POS = new THREE.Vector3(2.8, 2.5, 2.0)
const NOTEPAD_TARGET = new THREE.Vector3(3, 1.2, 1.6)
const BUTTON_ZOOM_POS = new THREE.Vector3(3.0, 1.5, 0.5)
const BUTTON_ZOOM_TARGET = new THREE.Vector3(3.0, 0.5, -1.5)
const DEFAULT_POS = new THREE.Vector3(1, 4, 8)
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0)

export function updateCamera(camera: THREE.PerspectiveCamera, controls: OrbitControls, state: AppState): void {
    if (state.isFocusingOnScreen) {
        camera.position.lerp(ZOOM_POS, 0.05)
        controls.target.lerp(ZOOM_TARGET, 0.05)
    } else if (state.isFocusingOnNotepad) {
        camera.position.lerp(NOTEPAD_POS, 0.05)
        controls.target.lerp(NOTEPAD_TARGET, 0.05)
    } else if (state.isFocusingOnButton) {
        camera.position.lerp(BUTTON_ZOOM_POS, 0.05)
        controls.target.lerp(BUTTON_ZOOM_TARGET, 0.05)
    } else if (state.isCameraLocked) {
        if (camera.position.distanceTo(DEFAULT_POS) > 0.1 || controls.target.distanceTo(DEFAULT_TARGET) > 0.1) {
            camera.position.lerp(DEFAULT_POS, 0.05)
            controls.target.lerp(DEFAULT_TARGET, 0.05)
        }
    }
}
