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
const IPOD_POS = new THREE.Vector3(1.5, 1.2, 1.5)
const IPOD_TARGET = new THREE.Vector3(1.5, 0.0, 1.4)
const DEFAULT_POS = new THREE.Vector3(1, 4, 8)
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0)

// Intro camera position (further back, behind the door)
const INTRO_POS = new THREE.Vector3(1, 4, 20)
const INTRO_TARGET = new THREE.Vector3(0, 0, 0)

export function updateCamera(camera: THREE.PerspectiveCamera, controls: OrbitControls, state: AppState): void {
    // During intro, keep camera at intro position until user clicks
    if (state.isIntro) {
        if (state.introAnimationProgress === 0) {
            // Waiting for click - keep camera at intro position
            return
        }
        
        // Animate from intro to default position
        const progress = Math.min(state.introAnimationProgress, 1)
        
        // Use easeOutCubic for smooth deceleration
        const eased = 1 - Math.pow(1 - progress, 3)
        
        const targetPos = new THREE.Vector3().lerpVectors(INTRO_POS, DEFAULT_POS, eased)
        const targetLookAt = new THREE.Vector3().lerpVectors(INTRO_TARGET, DEFAULT_TARGET, eased)
        
        camera.position.copy(targetPos)
        controls.target.copy(targetLookAt)
        
        // Update animation progress
        state.introAnimationProgress += 0.015
        
        // Animation complete
        if (state.introAnimationProgress >= 1) {
            state.isIntro = false
            state.introAnimationProgress = 0
            // Hide the door, light, walls, and UI after animation
            if (state.doorPivot) {
                state.doorPivot.visible = false
            }
            if (state.doorLight) {
                state.doorLight.visible = false
            }
            if (state.doorUI) {
                state.doorUI.visible = false
            }
            state.doorWalls.forEach(wall => {
                wall.visible = false
            })
        }
        return
    }
    
    if (state.isFocusingOnScreen) {
        camera.position.lerp(ZOOM_POS, 0.05)
        controls.target.lerp(ZOOM_TARGET, 0.05)
    } else if (state.isFocusingOnNotepad) {
        camera.position.lerp(NOTEPAD_POS, 0.05)
        controls.target.lerp(NOTEPAD_TARGET, 0.05)
    } else if (state.isFocusingOnButton) {
        camera.position.lerp(BUTTON_ZOOM_POS, 0.05)
        controls.target.lerp(BUTTON_ZOOM_TARGET, 0.05)
    } else if (state.isFocusingOnIpod) {
        camera.position.lerp(IPOD_POS, 0.05)
        controls.target.lerp(IPOD_TARGET, 0.05)
    } else if (state.isCameraLocked) {
        if (camera.position.distanceTo(DEFAULT_POS) > 0.1 || controls.target.distanceTo(DEFAULT_TARGET) > 0.1) {
            camera.position.lerp(DEFAULT_POS, 0.05)
            controls.target.lerp(DEFAULT_TARGET, 0.05)
        }
    }
}
