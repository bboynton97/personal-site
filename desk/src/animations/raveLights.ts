import * as THREE from 'three'
import type { AppState, LightShowConfig } from '../types'

export function updateRaveLights(state: AppState, time: number): void {
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
                    // Boost white intensity logic embedded here

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
}
