import './style.css'
import * as THREE from 'three'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { RenderPixelatedPass } from 'three/examples/jsm/postprocessing/RenderPixelatedPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { CRTShader } from './CRTShader'
import { WhiteOutShader } from './WhiteOutShader'
import { Terminal } from './Terminal'
import { Oscilloscope } from './Oscilloscope'
import { Notepad } from './Notepad'
import { loadSimpleObjects, loadComputer, loadOscilloscope, loadNotepad } from './objects/index'
import type { AppState } from './types'
import { createAnimationLoop } from './animate'

// --- CONSTANTS ---
const DEFAULT_POS = new THREE.Vector3(1, 4, 8)
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0)

// --- STATE ---
const state: AppState = {
    isCameraLocked: true,
    isFocusingOnScreen: false,
    isFocusingOnNotepad: false,
    isFocusingOnButton: false,
    isEmergencyStopped: false,
    isBlackout: false,
    computerPivot: null,
    notepadPivot: null,
    powerPilePivot: null,
    
    // Garage Assets
    floorPivots: [],
    barrierPivots: [],
    wallPivots: [],
    speakerPivots: [],
    carPivot: null,
    bikePivot: null,
    
    // Backrooms Assets
    backroomsPivot: null,
    backroomsLights: [],

    armSegments: { base: null, arm: null },
    roomLights: [],
    raveLights: [],
    currentLightShow: 'lightShow1',
    lightShows: {
        lightShow1: null, // Will store original configuration
        lightShow2: null, // Will store white strobe configuration
        lightShow3: null  // Will store bouncing red light
    },
    bouncingLight: null // Single light for Light Show 3
}

// --- SCENE SETUP ---
const scene = new THREE.Scene()
scene.fog = new THREE.FogExp2(0x050505, 0.02)
RectAreaLightUniformsLib.init()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.copy(DEFAULT_POS)
camera.lookAt(DEFAULT_TARGET)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.domElement.style.position = 'absolute'
renderer.domElement.style.top = '0'
renderer.domElement.style.zIndex = '1'
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.enabled = false // Locked by default

// --- LIGHTING ---
const ambientLight = new THREE.AmbientLight(0x101020, 0.1)
scene.add(ambientLight)
state.roomLights.push(ambientLight)

const spotLight = new THREE.SpotLight(0xffaa55, 20)
spotLight.position.set(3, 6, 2)
spotLight.angle = Math.PI / 6
spotLight.penumbra = 0.5
spotLight.decay = 2
spotLight.distance = 50
spotLight.castShadow = true
spotLight.shadow.mapSize.width = 1024
spotLight.shadow.mapSize.height = 1024
spotLight.shadow.bias = -0.0001
scene.add(spotLight)
state.roomLights.push(spotLight)
scene.add(spotLight.target)
spotLight.target.position.set(0, 0, 0)

const screenLight = new THREE.PointLight(0x00ffaa, 2, 5)
screenLight.position.set(-4, 1.5, 1.5)
scene.add(screenLight)
state.roomLights.push(screenLight)

const rimLight = new THREE.DirectionalLight(0x4455ff, 1)
rimLight.position.set(-5, 5, -5)
scene.add(rimLight)
state.roomLights.push(rimLight)

const deskFrontLight = new THREE.PointLight(0xffffff, 2, 15)
deskFrontLight.position.set(0, -1, 7)
scene.add(deskFrontLight)
state.roomLights.push(deskFrontLight)

// Rave Lights Setup
const raveColors = [0xff0000, 0xffffff]

// 1. RectAreaLights (Base wash)
for (let i = -1; i <= 1; i++) {
    const speed = 0.5 + Math.random() * 0.5
    
    // Upward
    const rectLight = new THREE.RectAreaLight(raveColors[(i + 1) % raveColors.length], 5, 20, 10)
    rectLight.position.set(i * 25, -9, -29)
    rectLight.lookAt(i * 25, 20, -30) // Look up at upper wall
    scene.add(rectLight)
    state.raveLights.push({ light: rectLight, type: 'rect', speed, offset: i })

    // Downward
    const rectLightDown = new THREE.RectAreaLight(raveColors[(i + 1) % raveColors.length], 5, 20, 10)
    rectLightDown.position.set(i * 25, -9, -29)
    rectLightDown.lookAt(i * 25, -20, -30) // Look down at lower wall
    scene.add(rectLightDown)
    state.raveLights.push({ light: rectLightDown, type: 'rect', speed, offset: i })
}

// 3. Left Wall Lights
for (let i = 0; i < 3; i++) {
    const speed = 0.5 + Math.random() * 0.5
    const zPos = -20 + i * 25 // Spaced along the wall
    
    // Upward
    const rectLight = new THREE.RectAreaLight(raveColors[i % raveColors.length], 5, 20, 10)
    rectLight.position.set(-49, -9, zPos)
    rectLight.lookAt(-50, 0, zPos) 
    scene.add(rectLight)
    state.raveLights.push({ light: rectLight, type: 'rect', speed, offset: i + 5 })

    // Downward
    const rectLightDown = new THREE.RectAreaLight(raveColors[i % raveColors.length], 5, 20, 10)
    rectLightDown.position.set(-49, -9, zPos)
    rectLightDown.lookAt(-50, -20, zPos)
    scene.add(rectLightDown)
    state.raveLights.push({ light: rectLightDown, type: 'rect', speed, offset: i + 5 })
}

// 2. SpotLights (Beams)
for (let i = -2; i <= 2; i++) {
    const spot = new THREE.SpotLight(raveColors[(i + 2) % raveColors.length], 100)
    spot.position.set(i * 15, -9, -20)
    spot.target.position.set(i * 10, 10, -35)
    spot.angle = Math.PI / 8
    spot.penumbra = 0.5
    spot.decay = 1.5
    spot.distance = 100
    spot.castShadow = true
    spot.shadow.bias = -0.0001
    
    scene.add(spot)
    scene.add(spot.target)
    state.raveLights.push({ 
        light: spot, 
        type: 'spot', 
        baseX: i * 15, 
        targetBaseX: i * 10,
        speed: 1 + Math.random(), 
        offset: i * 2 
    })
}

// Save Light Show 1 configuration (original)
state.lightShows.lightShow1 = state.raveLights.map(item => ({
    speed: item.speed,
    offset: item.offset,
    type: item.type,
    baseX: item.baseX,
    targetBaseX: item.targetBaseX
}))

// Create Light Show 2 configuration (white strobe, all in sync)
state.lightShows.lightShow2 = state.raveLights.map(item => ({
    speed: 3.0, // Fast strobe speed, same for all
    offset: 0,  // All in sync (no offset)
    type: item.type,
    baseX: item.baseX,
    targetBaseX: item.targetBaseX
}))

// Create Light Show 3: Single bouncing red light
// Room perimeter: back wall at z=-30, left wall at x=-50, front at z=20, right at x=50
const bouncingLight = new THREE.PointLight(0xff0000, 50, 30)
bouncingLight.position.set(-50, 0, -30) // Start at back-left corner
bouncingLight.visible = false // Hidden by default
scene.add(bouncingLight)
state.bouncingLight = bouncingLight
state.lightShows.lightShow3 = { light: bouncingLight }

// --- TERMINAL ---
const terminal = new Terminal()
const oscilloscope = new Oscilloscope()
const notepad = new Notepad()

// --- ASSET LOADING ---
const loader = new GLTFLoader()

// Load simple objects (only need loader, scene, state)
loadSimpleObjects(loader, scene, state)

// Load objects that need additional parameters
loadComputer(loader, scene, terminal, state)
loadOscilloscope(loader, scene, oscilloscope)
loadNotepad(loader, scene, state, notepad)

// --- POST PROCESSING ---
const composer = new EffectComposer(renderer)

const renderPass = new RenderPass(scene, camera)
renderPass.enabled = false
composer.addPass(renderPass)

const renderPixelatedPass = new RenderPixelatedPass(1.5, scene, camera)
composer.addPass(renderPixelatedPass)

const whiteOutPass = new ShaderPass(WhiteOutShader)
whiteOutPass.uniforms['resolution'].value = new THREE.Vector2(window.innerWidth, window.innerHeight)
whiteOutPass.uniforms['fadeAmount'].value = 0.0
whiteOutPass.enabled = false // Disabled by default
composer.addPass(whiteOutPass)

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5, 0.4, 0.85
)
bloomPass.strength = 0.8
bloomPass.radius = 0.5
bloomPass.threshold = 0.7
composer.addPass(bloomPass)

const crtPass = new ShaderPass(CRTShader)
crtPass.uniforms['resolution'].value = new THREE.Vector2(window.innerWidth, window.innerHeight)
crtPass.uniforms['vignetteStrength'].value = 1.0 // Default full vignette
composer.addPass(crtPass)

const outputPass = new OutputPass()
composer.addPass(outputPass)

// --- INTERACTION ---
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
                console.log('Emergency Stop ACTIVATED')
                
                // Hide the warning text
                if (state.emergencyText) state.emergencyText.visible = false
                
                // 1. Rave lights off (handled by loop via state.isEmergencyStopped)
                
                // 2. Pause then Zoom out
                setTimeout(() => {
                    state.isFocusingOnButton = false
                    
                    // 3. Pause then Turn off all lights
                    setTimeout(() => {
                        state.isBlackout = true
                        state.roomLights.forEach(light => light.visible = false)
                        
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

window.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
        state.isFocusingOnScreen = false
        state.isFocusingOnNotepad = false
        state.isFocusingOnButton = false
        terminal.setFocused(false)
    }

    if (event.key === 'p' || event.key === 'P') {
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
            
            console.log('Switched to Dev Mode')
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
            
            console.log('Switched to View Mode')
        }
    }

    if (event.key === 'l' || event.key === 'L') {
        // Cycle through light shows
        if (state.currentLightShow === 'lightShow1') {
            state.currentLightShow = 'lightShow2'
            console.log('Switched to Light Show 2')
        } else if (state.currentLightShow === 'lightShow2') {
            state.currentLightShow = 'lightShow3'
            console.log('Switched to Light Show 3')
        } else {
            state.currentLightShow = 'lightShow1'
            console.log('Switched to Light Show 1')
        }
    }

    if (event.key === 'b' || event.key === 'B') {
        // Skip directly to backrooms
        if (!state.isEmergencyStopped) {
            state.isEmergencyStopped = true
            console.log('Emergency Stop ACTIVATED (B key)')
            
            // Hide the warning text
            if (state.emergencyText) state.emergencyText.visible = false
            
            // Turn off rave lights (handled by loop via state.isEmergencyStopped)
            
            // Pause then Turn off all lights
            setTimeout(() => {
                state.isBlackout = true
                state.roomLights.forEach(light => light.visible = false)
                
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

// --- ANIMATION LOOP ---
const animate = createAnimationLoop({
    controls,
    camera,
    state,
    crtPass,
    terminal,
    oscilloscope,
    composer,
    renderPixelatedPass,
    whiteOutPass
})

// --- RESIZE ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    composer.setSize(window.innerWidth, window.innerHeight)
    crtPass.uniforms['resolution'].value.set(window.innerWidth, window.innerHeight)
    whiteOutPass.uniforms['resolution'].value.set(window.innerWidth, window.innerHeight)
})

animate()
