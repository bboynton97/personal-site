import * as THREE from 'three'
import type { AppState } from './types'
import type { Terminal } from './meshes/Terminal'
import type { Notepad } from './meshes/Notepad'
import type { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

export function setupInteractions(
    camera: THREE.PerspectiveCamera,
    scene: THREE.Scene,
    state: AppState,
    notepad: Notepad,
    terminal: Terminal,
    crtPass: ShaderPass
): void {
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()

    window.addEventListener('mousemove', (event: MouseEvent) => {
        // Only check for hover if focusing on the notepad
        if (state.isFocusingOnNotepad && state.notepadPivot) {
            pointer.x = (event.clientX / window.innerWidth) * 2 - 1
            pointer.y = -(event.clientY / window.innerHeight) * 2 + 1

            raycaster.setFromCamera(pointer, camera)

            // Find the paper mesh
            let paperMesh: THREE.Mesh | null = null
            state.notepadPivot.traverse(child => {
                if (child instanceof THREE.Mesh && (child.name === 'Torus002_Material002_0' || child.name.includes('Torus.002'))) {
                    paperMesh = child
                }
            })

            if (paperMesh) {
                const intersects = raycaster.intersectObject(paperMesh)
                if (intersects.length > 0 && intersects[0].uv) {
                    const uv = intersects[0].uv
                    // Canvas coordinates (1024x1024)
                    // UV (0,0) is bottom-left, Canvas (0,0) is top-left
                    // Texture is likely flipped or rotated, need to calibrate
                    // Based on standard UV mapping:

                    // Check if hovering over any blog post title
                    let hoveredIndex = -1

                    notepad.blogPosts.forEach((post, index) => {
                        // Simple bounding box check
                        // Canvas size is 1024x1448

                        // Transform UV to Texture Space
                        // We applied repeat: 1.2, offset: -0.1
                        // Texture UV = (Mesh UV * repeat) + offset
                        // But Wait! Texture offset moves the texture, so it shifts UV coordinates in the opposite direction for sampling.
                        // Actually, gl_FragColor = texture2D(map, uv * repeat + offset)
                        // So the UV we want to check against canvas coords is (uv * repeat + offset)

                        const texU = uv.x * 1.2 - 0.1
                        // Use standard V orientation (Top-Down for Canvas)
                        // (1 - uv.y) is standard flip. 
                        const texV = (1 - uv.y) * 1.2 - 0.1

                        const scaledX = texU * 1024
                        const scaledY = texV * 1448

                        if (scaledX > 250 && scaledX < 850 && scaledY > post.y - 40 && scaledY < post.y + 40) {
                            hoveredIndex = index
                        }
                    })

                    notepad.setHovered(hoveredIndex)

                    // Change cursor style
                    document.body.style.cursor = hoveredIndex !== -1 ? 'pointer' : 'default'
                } else {
                    notepad.setHovered(-1)
                    document.body.style.cursor = 'default'
                }
            }
        } else {
            document.body.style.cursor = 'default'
        }
    })

    window.addEventListener('click', (event: MouseEvent) => {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1

        raycaster.setFromCamera(pointer, camera)

        // Check power pile first to prevent computer zoom
        if (state.powerPilePivot) {
            const intersects = raycaster.intersectObjects(state.powerPilePivot.children, true)
            if (intersects.length > 0) {
                if (state.isCameraLocked && !state.pixelationAnimationStartTime) {
                    // Start pixelation animation
                    state.pixelationAnimationStartTime = Date.now()
                }
                return // Don't process other clicks
            }
        }

        if (state.computerPivot) {
            const intersects = raycaster.intersectObjects(state.computerPivot.children, true)
            if (intersects.length > 0) {
                if (state.isCameraLocked) {
                    state.isFocusingOnScreen = true
                    state.isFocusingOnNotepad = false
                    terminal.setFocused(true)
                }
            }
        }

        if (state.notepadPivot) {
            const intersects = raycaster.intersectObjects(state.notepadPivot.children, true)
            if (intersects.length > 0) {
                if (state.isCameraLocked) {
                    state.isFocusingOnNotepad = true
                    state.isFocusingOnScreen = false
                    terminal.setFocused(false)
                }
            }
        }

        if (state.emergencyButtonPivot) {
            const intersects = raycaster.intersectObjects(state.emergencyButtonPivot.children, true)
            if (intersects.length > 0) {
                if (!state.isFocusingOnButton) {
                    // Zoom in on button
                    state.isFocusingOnButton = true
                    state.isCameraLocked = true
                    state.isFocusingOnScreen = false
                    state.isFocusingOnNotepad = false
                    terminal.setFocused(false)
                } else if (!state.isEmergencyStopped) {
                    // Sequence: Turn off rave lights -> Pause -> Zoom out -> Pause -> Turn off all lights
                    state.isEmergencyStopped = true

                    // Hide the warning text
                    if (state.emergencyText) state.emergencyText.visible = false

                    // 1. Rave lights off (handled by loop via state.isEmergencyStopped)

                    // 2. Pause then Zoom out
                    setTimeout(() => {
                        state.isFocusingOnButton = false

                        // 3. Pause then Turn off all lights
                        setTimeout(() => {
                            state.isBlackout = true
                            state.roomLights.forEach(light => {
                                // @ts-ignore
                                light.visible = false
                            })

                            // 4. After 1s of darkness, swap environment
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
                    }, 1000)
                }
            }
        }
    })
}
