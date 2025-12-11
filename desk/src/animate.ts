import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { RenderPixelatedPass } from 'three/examples/jsm/postprocessing/RenderPixelatedPass.js'
import type { AppState, LightShowConfig } from './types'
import { Terminal } from './Terminal'
import { Oscilloscope } from './Oscilloscope'

// Camera position constants
const ZOOM_POS = new THREE.Vector3(-2.8, 2.8, 1.2)
const ZOOM_TARGET = new THREE.Vector3(-3.4, 2.5, -0.1)
const NOTEPAD_POS = new THREE.Vector3(2.8, 2.5, 2.0)
const NOTEPAD_TARGET = new THREE.Vector3(3, 1.2, 1.6)
const BUTTON_ZOOM_POS = new THREE.Vector3(3.0, 1.5, 0.5)
const BUTTON_ZOOM_TARGET = new THREE.Vector3(3.0, 0.5, -1.5)
const DEFAULT_POS = new THREE.Vector3(1, 4, 8)
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0)

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

        // Camera Animation
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

        // Update Uniforms
        const time = Date.now() * 0.001
        crtPass.uniforms['time'].value = time

        // Check if in backrooms (used to disable animations)
        const isInBackrooms = state.backroomsPivot && state.backroomsPivot.visible

        // Arm Animation (disabled in backrooms)
        if (state.armSegments.arm && !isInBackrooms) {
            const rawTriangle = (2 / Math.PI) * Math.asin(Math.sin(time * 0.7))
            const clamped = Math.max(-1, Math.min(1, rawTriangle * 1.02))
            state.armSegments.arm.rotation.x = clamped * 0.1
        }

        // Show/hide lights based on active show
        const showRaveLights = state.currentLightShow !== 'lightShow3' && !state.isEmergencyStopped
        state.raveLights.forEach(item => {
            item.light.visible = showRaveLights
        })
        if (state.bouncingLight) {
            state.bouncingLight.visible = state.currentLightShow === 'lightShow3' && !state.isEmergencyStopped
        }

        // Rave Animation
        if (!state.isEmergencyStopped) {
            const activeConfig = state.lightShows[state.currentLightShow]
            if (activeConfig && Array.isArray(activeConfig)) {
                state.raveLights.forEach((item, index) => {
                    const config = activeConfig[index] as LightShowConfig
                    if (!config) return
                    
                    if (state.currentLightShow === 'lightShow2') {
                        // Light Show 2: Sequence of phases
                        // Phase cycle: fast strobe -> pause -> slow strobe -> fast strobe -> red light
                        const cycleTime = 8.0 // Total cycle duration in seconds
                        const phaseTime = time % cycleTime
                        const phaseDuration = cycleTime / 5 // Each phase gets equal time
                        const currentPhase = Math.floor(phaseTime / phaseDuration)
                        const phaseLocalTime = phaseTime % phaseDuration
                        
                        let color = 0xffffff
                        let intensity = 0
                        let isStrobing = false
                        let strobeSpeed = 0
                        
                        if (currentPhase === 0) {
                            // Phase 1: Much faster strobe (white)
                            strobeSpeed = 15.0 // Very fast
                            isStrobing = true
                            color = 0xffffff
                        } else if (currentPhase === 1) {
                            // Phase 2: Pause (all off)
                            intensity = 0
                            color = 0xffffff
                        } else if (currentPhase === 2) {
                            // Phase 3: Slow strobe (white)
                            strobeSpeed = 2.0 // Slow
                            isStrobing = true
                            color = 0xffffff
                        } else if (currentPhase === 3) {
                            // Phase 4: Fast strobe (white)
                            strobeSpeed = 8.0 // Fast
                            isStrobing = true
                            color = 0xffffff
                        } else {
                            // Phase 5: Red light (solid)
                            color = 0xff0000
                            intensity = item.type === 'rect' ? 15 : 300
                        }
                        
                        if (isStrobing) {
                            const colorIndex = Math.floor(phaseLocalTime * strobeSpeed) % 2
                            const isOn = colorIndex === 1
                            intensity = isOn 
                                ? (item.type === 'rect' ? 15 : 300) 
                                : 0
                        }
                        
                        item.light.color.setHex(color)
                        item.light.intensity = intensity
                        
                        if (item.type === 'spot' && item.light instanceof THREE.SpotLight) {
                            // Keep spotlights stationary for strobe effect
                            item.light.target.position.x = item.targetBaseX ?? 0
                            item.light.target.position.y = 10
                        }
                    } else {
                        // Light Show 1: Original red/white alternating pattern
                        const speed = config.speed ?? 1
                        const offset = config.offset ?? 0
                        const colorIndex = Math.floor(time * speed + offset) % 2
                        const color = colorIndex === 0 ? 0xff0000 : 0xffffff
                        const intensity = colorIndex === 0 ? 1 : 2 // Boost white intensity
                        
                        item.light.color.setHex(color)
                        item.light.intensity = item.type === 'rect' 
                            ? (colorIndex === 0 ? 5 : 10) 
                            : (colorIndex === 0 ? 100 : 200)

                        if (item.type === 'spot' && item.light instanceof THREE.SpotLight) {
                            // Move spotlights
                            item.light.target.position.x = (item.targetBaseX ?? 0) + Math.sin(time * speed + offset) * 10
                            item.light.target.position.y = 10 + Math.cos(time * speed * 0.5) * 5
                        }
                    }
                })
            }
        }

        // Light Show 3: Bouncing red light around perimeter
        if (state.currentLightShow === 'lightShow3' && state.bouncingLight && !state.isEmergencyStopped) {
            // Square path: back-left -> back-right -> front-right -> front-left -> back-left
            // Perimeter: 100 (back) + 50 (right) + 100 (front) + 50 (left) = 300 units
            const perimeterLength = 300
            const speed = 0.5 // units per second
            const cycleTime = perimeterLength / speed // Time for one full cycle
            const pathTime = (time % cycleTime) / cycleTime // 0 to 1
            
            let x: number, z: number
            
            if (pathTime < 0.25) {
                // Side 1: Back wall, left to right (x: -50 to +50, z: -30)
                const t = pathTime / 0.25
                x = -50 + (t * 100)
                z = -30
            } else if (pathTime < 0.5) {
                // Side 2: Right wall, back to front (x: +50, z: -30 to +20)
                const t = (pathTime - 0.25) / 0.25
                x = 50
                z = -30 + (t * 50)
            } else if (pathTime < 0.75) {
                // Side 3: Front wall, right to left (x: +50 to -50, z: +20)
                const t = (pathTime - 0.5) / 0.25
                x = 50 - (t * 100)
                z = 20
            } else {
                // Side 4: Left wall, front to back (x: -50, z: +20 to -30)
                const t = (pathTime - 0.75) / 0.25
                x = -50
                z = 20 - (t * 50)
            }
            
            state.bouncingLight.position.set(x, 0, z)
        }

        // Emergency Text Flashing
        if (state.emergencyText) {
            if (state.isFocusingOnButton && !isInBackrooms) {
                state.emergencyText.visible = Math.floor(time * 2) % 2 === 0
            } else {
                state.emergencyText.visible = false
            }
        }

        // Pixelation Animation (power pile effect)
        if (state.pixelationAnimationStartTime) {
            const elapsed = (Date.now() - state.pixelationAnimationStartTime) / 1000 // seconds
            const startPixelSize = 1.5
            const endPixelSize = 10
            const upDuration = 15 // 15 seconds to go up
            const fadeOutDuration = 5 // 5 seconds to fade out to white
            const fadeInDuration = 5 // 5 seconds to fade back in
            const downDuration = 10 // 10 seconds to go down
            const holdDuration = fadeOutDuration + fadeInDuration
            const duration = upDuration + holdDuration + downDuration // total duration
            
            if (elapsed < duration) {
                let pixelSize: number
                const isHoldPhase = elapsed >= upDuration && elapsed < upDuration + holdDuration
                const holdElapsed = elapsed - upDuration
                
                if (elapsed < upDuration) {
                    // Phase 1: Going up from 1.5 to 10
                    const t = elapsed / upDuration // 0 to 1
                    pixelSize = startPixelSize + (endPixelSize - startPixelSize) * t
                    whiteOutPass.enabled = false
                } else if (isHoldPhase) {
                    // Phase 2: Hold at max pixelation, fade to white then back
                    pixelSize = endPixelSize
                    whiteOutPass.enabled = true
                    
                    let fadeAmount: number
                    if (holdElapsed < fadeOutDuration) {
                        // Fade out to white
                        fadeAmount = holdElapsed / fadeOutDuration // 0 to 1
                    } else {
                        // Fade back in from white
                        const fadeInElapsed = holdElapsed - fadeOutDuration
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
                }
                
                // Update pixel size using the setPixelSize method
                renderPixelatedPass.setPixelSize(pixelSize)
            } else {
                // Animation complete, reset to default
                renderPixelatedPass.setPixelSize(startPixelSize)
                whiteOutPass.enabled = false
                crtPass.uniforms['vignetteStrength'].value = 1.0 // Restore default vignette
                state.pixelationAnimationStartTime = undefined
            }
        } else {
            // Ensure fade effect is disabled when not animating
            whiteOutPass.enabled = false
        }

        // Render
        terminal.update()
        // Oscilloscope disabled in backrooms
        if (!isInBackrooms) {
            oscilloscope.update()
        }
        composer.render()
    }

    return animate
}
