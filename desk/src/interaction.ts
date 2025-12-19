import * as THREE from 'three'
import type { AppState } from './types'
import type { Terminal } from './meshes/Terminal'
import type { Notepad } from './meshes/Notepad'
import type { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { terminalSession } from './terminalSession'

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

    // Audio Setup
    const listener = new THREE.AudioListener()
    camera.add(listener)

    // Create position helpers for directional audio (relative to camera)
    const technoPosition = new THREE.Object3D()
    technoPosition.position.set(0, -2, -5) // Below and in front of camera
    camera.add(technoPosition)

    const sound = new THREE.PositionalAudio(listener)
    sound.setRefDistance(5)
    sound.setRolloffFactor(0.5)
    technoPosition.add(sound)
    state.technoMusic = sound

    // Create muffled effect (low-pass filter) - starts very muffled, opens up when door opens
    const filter = listener.context.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 400 // Start very muffled, will increase when door opens
    sound.setFilter(filter)
    state.musicFilter = filter

    // Add Reverb to the filtered signal
    const convolver = listener.context.createConvolver()
    const reverbGain = listener.context.createGain()
    reverbGain.gain.value = 0.3

    // Generate impulse response for reverb
    const rate = listener.context.sampleRate
    const length = rate * 1.5 // 1.5 seconds tail
    const impulse = listener.context.createBuffer(2, length, rate)
    const leftChannel = impulse.getChannelData(0)
    const rightChannel = impulse.getChannelData(1)

    for (let i = 0; i < length; i++) {
        const decay = Math.pow(1 - i / length, 2.0)
        // Add some noise to each channel
        leftChannel[i] = (Math.random() * 2 - 1) * decay
        rightChannel[i] = (Math.random() * 2 - 1) * decay
    }
    convolver.buffer = impulse

    // Connect wet path: Filter -> Convolver -> ReverbGain -> MasterGain
    filter.connect(convolver)
    convolver.connect(reverbGain)
    reverbGain.connect(sound.gain)

    const audioLoader = new THREE.AudioLoader()
    audioLoader.load('/berghain.mp3', function (buffer) {
        sound.setBuffer(buffer)
        sound.setLoop(true)
        sound.setVolume(0.5)
        sound.offset = 120 // Start at 2 minutes
    })

    // Emergency switch sound
    const emergencySwitchSound = new THREE.Audio(listener)
    audioLoader.load('/loud-switch.mp3', function (buffer) {
        emergencySwitchSound.setBuffer(buffer)
        emergencySwitchSound.setLoop(false)
        emergencySwitchSound.setVolume(1.0)
    })
    state.emergencySwitchSound = emergencySwitchSound

    // Lamp buzz sound for backrooms (with reverb) - positioned above camera
    const buzzPosition = new THREE.Object3D()
    buzzPosition.position.set(0, 4, 0) // Above the camera
    camera.add(buzzPosition)
    
    const lampBuzzSound = new THREE.PositionalAudio(listener)
    lampBuzzSound.setRefDistance(3)
    lampBuzzSound.setRolloffFactor(0.3)
    buzzPosition.add(lampBuzzSound)
    
    // Create reverb for lamp buzz
    const buzzConvolver = listener.context.createConvolver()
    const buzzReverbGain = listener.context.createGain()
    buzzReverbGain.gain.value = 0.15 // Subtle reverb
    
    // Generate impulse response for reverb (shorter tail for ambient hum)
    const buzzLength = rate * 0.8 // 0.8 seconds tail
    const buzzImpulse = listener.context.createBuffer(2, buzzLength, rate)
    const buzzLeft = buzzImpulse.getChannelData(0)
    const buzzRight = buzzImpulse.getChannelData(1)
    
    for (let i = 0; i < buzzLength; i++) {
        const decay = Math.pow(1 - i / buzzLength, 2.5)
        buzzLeft[i] = (Math.random() * 2 - 1) * decay
        buzzRight[i] = (Math.random() * 2 - 1) * decay
    }
    buzzConvolver.buffer = buzzImpulse
    
    audioLoader.load('/lamp-buzz.mov', function (buffer) {
        lampBuzzSound.setBuffer(buffer)
        lampBuzzSound.setLoop(true)
        
        // Connect reverb: source -> convolver -> reverbGain -> output
        lampBuzzSound.gain.connect(buzzConvolver)
        buzzConvolver.connect(buzzReverbGain)
        buzzReverbGain.connect(listener.context.destination)
    })
    state.lampBuzzSound = lampBuzzSound

    let audioStarted = false

    window.addEventListener('mousemove', (event: MouseEvent) => {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
        raycaster.setFromCamera(pointer, camera)

        let cursorStyle = "url('/pointer.png'), auto"

        // During intro, check for hovering over door UI elements (but not while glitching)
        if (state.isIntro && state.introAnimationProgress === 0 && state.doorUI && !state.introGlitchStartTime) {
            const intersects = raycaster.intersectObjects(state.doorUI.children, true)
            
            // Reset all clickable elements to normal scale
            state.doorUI.children.forEach(child => {
                if (child.name.startsWith('social_') || child.name === 'door_enter') {
                    child.scale.lerp(new THREE.Vector3(1, 1, 1), 0.2)
                }
            })
            
            if (intersects.length > 0) {
                const hitObject = intersects[0].object
                const hitName = hitObject.name
                if (hitName.startsWith('social_') || hitName === 'door_enter') {
                    // Scale up hovered element
                    hitObject.scale.lerp(new THREE.Vector3(1.15, 1.15, 1.15), 0.3)
                    document.body.style.cursor = "url('/click.png'), pointer"
                    return
                }
            }
            document.body.style.cursor = "url('/pointer.png'), auto"
            return
        }

        // Mode 1: Focusing on Notepad - check for specific links
        if (state.isFocusingOnNotepad && state.notepadPivot) {
            let paperMesh: THREE.Mesh | null = null
            state.notepadPivot.traverse(child => {
                if (child instanceof THREE.Mesh && (child.name === 'Torus002_Material002_0' || child.name.includes('Torus.002'))) {
                    paperMesh = child
                }
            })

            let linkHovered = false
            if (paperMesh) {
                const intersects = raycaster.intersectObject(paperMesh)
                if (intersects.length > 0 && intersects[0].uv) {
                    const uv = intersects[0].uv

                    let hoveredIndex = -1
                    notepad.blogPosts.forEach((post, index) => {
                        const texU = uv.x * 1.2 - 0.1
                        const texV = uv.y * 1.2 - 0.1
                        const scaledX = texU * 1024
                        const scaledY = texV * 1448

                        if (scaledX > 140 && scaledX < 900 && scaledY > post.y + 350 && scaledY < post.y + 450) {
                            hoveredIndex = index
                        }
                    })

                    notepad.setHovered(hoveredIndex)
                    if (hoveredIndex !== -1) linkHovered = true
                } else {
                    notepad.setHovered(-1)
                }
            } else {
                notepad.setHovered(-1)
            }

            if (linkHovered) cursorStyle = "url('/click.png'), pointer"

        }
        // Mode 2: General View - check for clickable objects
        else if (state.isCameraLocked) {
            let objectHovered = false

            const checkIntersect = (pivot: THREE.Group | null | undefined) => {
                if (!pivot) return false
                return raycaster.intersectObjects(pivot.children, true).length > 0
            }

            // Check if in backrooms (used to disable notepad interactions)
            const isInBackrooms = state.backroomsPivot && state.backroomsPivot.visible

            // Check interactions based on click handler logic
            if (checkIntersect(state.powerPilePivot)) objectHovered = true
            else if (state.computerPivot && raycaster.intersectObjects(state.computerPivot.children, true).some(hit => hit.object.name.toLowerCase().includes('cube_screen_0'))) objectHovered = true
            else if (!isInBackrooms && checkIntersect(state.notepadPivot)) objectHovered = true
            else if (checkIntersect(state.emergencyButtonPivot)) objectHovered = true
            else if (checkIntersect(state.octocatPivot)) objectHovered = true

            if (objectHovered) cursorStyle = "url('/click.png'), pointer"
        }

        document.body.style.cursor = cursorStyle
    })

    window.addEventListener('click', (event: MouseEvent) => {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1

        // Handle intro click - check for door UI interactions
        if (state.isIntro && state.introAnimationProgress === 0) {
            raycaster.setFromCamera(pointer, camera)
            
            if (state.doorUI) {
                const intersects = raycaster.intersectObjects(state.doorUI.children, true)
                if (intersects.length > 0) {
                    const hitObject = intersects[0].object
                    const hitName = hitObject.name
                    
                    // Handle social icon clicks
                    if (hitName.startsWith('social_') && hitObject.userData.url) {
                        window.open(hitObject.userData.url, '_blank')
                        return
                    }
                    
                    // Handle enter button click
                    if (hitName === 'door_enter') {
                        // Play knock sound
                        if (state.doorKnockSound && !state.doorKnockSound.isPlaying) {
                            state.doorKnockSound.play()
                        }
                        
                        // Start glitch effect (camera movement happens after glitch + scene ready)
                        state.introGlitchStartTime = Date.now()
                        
                        // Play audio on enter
                        if (!audioStarted) {
                            if (sound.context.state === 'suspended') {
                                sound.context.resume()
                            }
                            if (sound.buffer) {
                                sound.play()
                                audioStarted = true
                                state.isAudioPlaying = true
                            }
                        }
                        return
                    }
                }
            }
            return // Don't process other clicks during intro
        }

        // Play audio on first click (if not started during intro)
        if (!audioStarted) {
            if (sound.context.state === 'suspended') {
                sound.context.resume()
            }
            if (sound.buffer) {
                sound.play()
                audioStarted = true
                state.isAudioPlaying = true
            }
        }

        raycaster.setFromCamera(pointer, camera)

        // Check power pile first to prevent computer zoom
        if (state.powerPilePivot) {
            const intersects = raycaster.intersectObjects(state.powerPilePivot.children, true)
            if (intersects.length > 0) {
                if (state.isCameraLocked && !state.pixelationAnimationStartTime) {
                    // Start pixelation animation
                    state.pixelationAnimationStartTime = Date.now()
                    // Play sniff sound
                    if (state.sniffSound && !state.sniffSound.isPlaying) {
                        state.sniffSound.play()
                    }
                }
                return // Don't process other clicks
            }
        }

        if (state.computerPivot) {
            const intersects = raycaster.intersectObjects(state.computerPivot.children, true)
            const hasScreen = intersects.some(hit => hit.object.name.toLowerCase().includes('cube_screen_0'))
            if (hasScreen) {
                if (state.isCameraLocked) {
                    state.isFocusingOnScreen = true
                    state.isFocusingOnNotepad = false
                    terminal.setFocused(true)

                    // Initialize terminal session on first click
                    if (!terminalSession.isSessionValid()) {
                        terminalSession.initSession().then(success => {
                            if (success) {
                                console.log('Terminal session initialized successfully')
                            } else {
                                console.error('Failed to initialize terminal session')
                            }
                        })
                    }
                }
            }
        }

        // Notepad is not clickable in backrooms
        const isInBackrooms = state.backroomsPivot && state.backroomsPivot.visible
        if (state.notepadPivot && !isInBackrooms) {
            const intersects = raycaster.intersectObjects(state.notepadPivot.children, true)
            if (intersects.length > 0) {
                if (state.isCameraLocked && !state.isFocusingOnNotepad) {
                    // First click: zoom into notepad
                    state.isFocusingOnNotepad = true
                    state.isFocusingOnScreen = false
                    terminal.setFocused(false)
                } else if (state.isFocusingOnNotepad) {
                    // Already focused on notepad - check if clicking a blog post
                    let paperMesh: THREE.Mesh | null = null
                    state.notepadPivot.traverse(child => {
                        if (child instanceof THREE.Mesh && (child.name === 'Torus002_Material002_0' || child.name.includes('Torus.002'))) {
                            paperMesh = child
                        }
                    })

                    if (paperMesh) {
                        const paperIntersects = raycaster.intersectObject(paperMesh)
                        if (paperIntersects.length > 0 && paperIntersects[0].uv) {
                            const uv = paperIntersects[0].uv

                            notepad.blogPosts.forEach((post) => {
                                const texU = uv.x * 1.2 - 0.1
                                const texV = uv.y * 1.2 - 0.1
                                const scaledX = texU * 1024
                                const scaledY = texV * 1448

                                if (scaledX > 140 && scaledX < 900 && scaledY > post.y + 350 && scaledY < post.y + 450) {
                                    // Open blog post in new tab
                                    const url = notepad.getPostUrl(post.slug)
                                    window.open(url, '_blank')
                                }
                            })
                        }
                    }
                }
            }
        }

        if (state.octocatPivot) {
            const intersects = raycaster.intersectObjects(state.octocatPivot.children, true)
            if (intersects.length > 0) {
                window.open('https://github.com/bboynton97/personal-site', '_blank')
                return
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

                    // Play emergency switch sound
                    if (state.emergencySwitchSound) {
                        if (state.emergencySwitchSound.isPlaying) state.emergencySwitchSound.stop()
                        state.emergencySwitchSound.play()
                    }

                    // Stop the techno music
                    if (state.technoMusic && state.technoMusic.isPlaying) {
                        state.technoMusic.stop()
                    }

                    // Hide the warning text
                    if (state.emergencyText) state.emergencyText.visible = false

                    // 1. Rave lights off (handled by loop via state.isEmergencyStopped)

                    // 2. Pause then Zoom out
                    setTimeout(() => {
                        state.isFocusingOnButton = false

                        // 3. Pause then Turn off all lights
                        setTimeout(() => {
                            state.isBlackout = true

                            // Play emergency switch sound again for lights off
                            if (state.emergencySwitchSound) {
                                if (state.emergencySwitchSound.isPlaying) state.emergencySwitchSound.stop()
                                state.emergencySwitchSound.play()
                            }

                            state.roomLights.forEach(light => {
                                // @ts-ignore
                                light.visible = false
                            })

                            // 4. After 3s of darkness, swap environment
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

                                // Hide the octocat
                                if (state.octocatPivot) state.octocatPivot.visible = false

                                // Play lamp buzz sound on loop
                                if (state.lampBuzzSound) {
                                    if (state.lampBuzzSound.context.state === 'suspended') {
                                        state.lampBuzzSound.context.resume()
                                    }
                                    if (!state.lampBuzzSound.isPlaying) {
                                        state.lampBuzzSound.play()
                                    }
                                }

                                // Switch notepad to demonic backrooms mode
                                notepad.setBackroomsMode(true)

                            }, 3000)
                        }, 1000)
                    }, 1000)
                }
            }
        }
    })
}
