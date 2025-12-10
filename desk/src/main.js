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
import { CRTShader } from './CRTShader.js'
import { Terminal } from './Terminal.js'
import { Oscilloscope } from './Oscilloscope.js'
import { Notepad } from './Notepad.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import typeface from 'three/examples/fonts/helvetiker_regular.typeface.json'

// --- CONSTANTS ---
const ZOOM_POS = new THREE.Vector3(-2.8, 2.8, 1.2)
const ZOOM_TARGET = new THREE.Vector3(-3.4, 2.5, -0.1)
const NOTEPAD_POS = new THREE.Vector3(2.8, 2.5, 2.0)
const NOTEPAD_TARGET = new THREE.Vector3(3, 1.2, 1.6)
const BUTTON_ZOOM_POS = new THREE.Vector3(3.0, 1.5, 0.5)
const BUTTON_ZOOM_TARGET = new THREE.Vector3(3.0, 0.5, -1.5)
const DEFAULT_POS = new THREE.Vector3(1, 4, 8)
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0)

// --- STATE ---
const state = {
    isCameraLocked: true,
    isFocusingOnScreen: false,
    isFocusingOnNotepad: false,
    isFocusingOnButton: false,
    isEmergencyStopped: false,
    computerPivot: null,
    notepadPivot: null,
    armSegments: { base: null, arm: null },
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
scene.add(spotLight.target)
spotLight.target.position.set(0, 0, 0)

const screenLight = new THREE.PointLight(0x00ffaa, 2, 5)
screenLight.position.set(-4, 1.5, 1.5)
scene.add(screenLight)

const rimLight = new THREE.DirectionalLight(0x4455ff, 1)
rimLight.position.set(-5, 5, -5)
scene.add(rimLight)

const deskFrontLight = new THREE.PointLight(0xffffff, 2, 15)
deskFrontLight.position.set(0, -1, 7)
scene.add(deskFrontLight)

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

// 1. Desk
loader.load('/metal_desk/scene.gltf', (gltf) => {
    const model = gltf.scene
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    const pivot = new THREE.Group()
    scene.add(pivot)

    model.position.copy(center).negate()
    pivot.add(model)

    const targetWidth = 14
    const scale = targetWidth / size.x
    pivot.scale.set(scale, scale, scale)
    pivot.position.set(0, -(size.y * scale) / 2, 0)

    model.traverse(child => {
        if (child.isMesh) {
            child.receiveShadow = true
            child.castShadow = true
        }
    })
})

// 2. Computer
loader.load('/computer/scene_converted.glb', (gltf) => {
    const model = gltf.scene
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    const pivot = new THREE.Group()
    state.computerPivot = pivot
    scene.add(pivot)

    model.position.copy(center).negate()
    pivot.add(model)

    const maxDim = Math.max(size.x, size.y, size.z)
    const targetSize = 3 * 1.875
    const scale = targetSize / maxDim
    pivot.scale.set(scale, scale, scale)
    pivot.position.set(-4, (size.y * scale / 2) - 0.4, 0)
    pivot.rotation.y = 0.3 - Math.PI / 2

    model.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
            if (child.material) {
                child.material.side = THREE.DoubleSide
                child.material.needsUpdate = true
            }

            const name = child.name.toLowerCase()

            if (name.includes('glass')) {
                // Glass Layer (excluding convex screen)
                child.material = child.material.clone()
                child.material.transparent = true
                child.material.opacity = 0.1
                child.material.roughness = 0.1
                child.material.metalness = 0.9
                child.material.blending = THREE.AdditiveBlending
            } else if (name.includes('cube_screen_0')) {
                // The Main Screen (Convex)
                console.log('FOUND CONVEX SCREEN:', child.name)
                
                // 1. Compute Planar UVs to map texture onto the curved surface
                child.geometry.computeBoundingBox();
                const box = child.geometry.boundingBox;
                const size = new THREE.Vector3();
                box.getSize(size);
                
                // Identify the "flat" dimensions vs "depth"
                // Assuming depth is the smallest dimension
                const minDim = Math.min(size.x, size.y, size.z);
                
                const positionAttribute = child.geometry.attributes.position;
                const uvAttribute = new THREE.BufferAttribute(new Float32Array(positionAttribute.count * 2), 2);
                
                for (let i = 0; i < positionAttribute.count; i++) {
                    const x = positionAttribute.getX(i);
                    const y = positionAttribute.getY(i);
                    const z = positionAttribute.getZ(i);
                    
                    let u, v;
                    
                    // Planar projection
                    if (size.x <= minDim + 0.001) {
                        // Projects along X
                        u = (z - box.min.z) / size.z;
                        v = (y - box.min.y) / size.y;
                    } else if (size.y <= minDim + 0.001) {
                        // Projects along Y
                        u = (x - box.min.x) / size.x;
                        v = (z - box.min.z) / size.z;
                    } else {
                        // Projects along Z
                        u = (x - box.min.x) / size.x;
                        v = (y - box.min.y) / size.y;
                    }
                    
                    uvAttribute.setXY(i, u, v);
                }
                
                child.geometry.setAttribute('uv', uvAttribute);
                child.geometry.attributes.uv.needsUpdate = true;

                // Reset texture transforms to defaults first, then adjust if needed
                // Planar mapping usually results in standard orientation
                terminal.texture.center.set(0.5, 0.5);
                terminal.texture.rotation = Math.PI / 2;
                terminal.texture.repeat.set(1, 1);

                // Use MeshStandardMaterial for reflections + glowing text
                child.material = new THREE.MeshStandardMaterial({
                    map: terminal.texture,
                    emissiveMap: terminal.texture,
                    emissive: 0xffffff,
                    emissiveIntensity: 1.1,
                    roughness: 0.2,
                    metalness: 0.8,
                    color: 0x000000
                })
            } else if (name.includes('monitor_screen_0')) {
                // Hide old flat screen
                child.visible = false;
            }
        }
    })
})

// 3. Robotic Arm
loader.load('/arm/Robotic Arm.glb', (gltf) => {
    const model = gltf.scene
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    const pivot = new THREE.Group()
    scene.add(pivot)

    const baseGroup = new THREE.Group()
    const armGroup = new THREE.Group()
    
    pivot.add(baseGroup)
    pivot.add(armGroup)
    
    // Position groups to center the model geometry
    const centerInv = center.clone().negate()
    baseGroup.position.copy(centerInv)
    armGroup.position.copy(centerInv)
    
    state.armSegments.base = baseGroup
    state.armSegments.arm = armGroup

    // Split meshes between base and arm
    const minY = center.y - size.y / 2
    const splitY = minY + size.y * 0.4
    const meshes = []
    
    model.traverse(child => { if (child.isMesh) meshes.push(child) })
    
    meshes.forEach(mesh => {
        const mBox = new THREE.Box3().setFromObject(mesh)
        const mCenter = new THREE.Vector3()
        mBox.getCenter(mCenter)
        
        if (mCenter.y < splitY) baseGroup.add(mesh)
        else armGroup.add(mesh)
        
        mesh.castShadow = true
        mesh.receiveShadow = true
    })

    const scale = 5.0 / size.y
    pivot.scale.set(scale, scale, scale)
    pivot.position.set(5.0, (size.y * scale / 2), -1.5)
    pivot.rotation.y = -Math.PI / 4

    const armLight = new THREE.PointLight(0xff0000, 10, 8)
    armLight.position.set(5.0 - 1, 3, -1.5 + 2)
    scene.add(armLight)
})

// 4. Oscilloscope
loader.load('/scope/scene.gltf', (gltf) => {
    const model = gltf.scene
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    const pivot = new THREE.Group()
    scene.add(pivot)

    model.position.copy(center).negate()
    pivot.add(model)

    const scale = 3.5 / size.x
    pivot.scale.set(scale, scale, scale)
    pivot.position.set(0, size.y * scale / 2, -2)

    model.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
            
            // Log mesh names to help debug
            console.log('Oscilloscope mesh found:', child.name)

            if (child.name === 'Cube012_Material102_0') {
                oscilloscope.texture.center.set(0.5, 0.5);
                oscilloscope.texture.rotation = -Math.PI / 2;
                
                // Width is compressed to 25% (repeat 4x)
                // Height is compressed to 75% (repeat 1.33x)
                oscilloscope.texture.repeat.set(4, 1.33); 
                
                // Position 10% from left
                // Calculation: We want the window (0.1 to 0.35) to map to texture (0 to 1)
                // With repeat=4 and center=0.5:
                // 0 = (0.1 - 0.5) * 4 + 0.5 + offset
                // 0 = -1.6 + 0.5 + offset
                // offset = 1.1
                oscilloscope.texture.offset.set(0.1, 0);

                child.material = new THREE.MeshStandardMaterial({
                    map: oscilloscope.texture,
                    emissiveMap: oscilloscope.texture,
                    emissive: 0xffffff,
                    emissiveIntensity: 1.0,
                    roughness: 0.2,
                    metalness: 0.5,
                    color: 0x000000
                })
            }
        }
    })
})

// 5. Barrier
loader.load('/Steel Road Barrier 3D Model.glb', (gltf) => {
    const model = gltf.scene
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    const pivot = new THREE.Group()
    scene.add(pivot)

    model.position.copy(center).negate()
    pivot.add(model)

    const targetWidth = 20
    const scale = targetWidth / size.x
    pivot.scale.set(scale, scale, scale)

    // Position roughly on floor (assuming floor at y=-7 based on desk) and behind
    pivot.position.set(0, -9 + (size.y * scale) / 2, -5)
    // pivot.rotation.y = Math.PI / 12

    model.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
        }
    })

    // Create second copy to the left
    const pivot2 = pivot.clone()
    pivot2.position.x -= 20
    scene.add(pivot2)

    // Create third copy to the right
    const pivot3 = pivot.clone()
    pivot3.position.x += 20
    scene.add(pivot3)
})

// 6. Wall
loader.load('/Industrial Factory Wall 3D Model (1).glb', (gltf) => {
    const model = gltf.scene
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    const pivot = new THREE.Group()
    scene.add(pivot)

    model.position.copy(center).negate()
    pivot.add(model)

    const targetWidth = 100
    const scale = targetWidth / size.x
    pivot.scale.set(scale, scale, scale)

    // Position behind barrier (z = -5)
    pivot.position.set(0, -12 + (size.y * scale) / 2, -30)

    model.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
            if (child.material) {
                child.material.side = THREE.DoubleSide
                child.material.needsUpdate = true
            }
        }
    })

    // Create lower copy
    const pivotLower = pivot.clone()
    pivotLower.position.y -= size.y * scale
    scene.add(pivotLower)

    // Create upper copy
    const pivotUpper = pivot.clone()
    pivotUpper.position.y += size.y * scale
    scene.add(pivotUpper)

    // Create Left Wall (Corner)
    const pivotLeft = pivot.clone()
    pivotLeft.rotation.y = Math.PI / 2
    // Wall width is 100. Center is at 0. Extends +/- 50.
    // We want the "right" side (in local space, +50 X) to be at Z=-30.
    // Rotated 90deg, local X+ becomes world Z-.
    // So the wall extends from CenterZ to CenterZ - 50 = -30. => CenterZ = 20.
    pivotLeft.position.set(-50, -12 + (size.y * scale) / 2, 20)
    scene.add(pivotLeft)

    // Left Wall Lower Copy
    const pivotLeftLower = pivotLeft.clone()
    pivotLeftLower.position.y -= size.y * scale
    scene.add(pivotLeftLower)
})

// 7. Floor
loader.load('/floor.glb', (gltf) => {
    const model = gltf.scene
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    const pivot = new THREE.Group()
    scene.add(pivot)

    model.position.copy(center).negate()
    pivot.add(model)

    // Scale to be large enough
    const targetWidth = 40
    const scale = targetWidth / size.x
    pivot.scale.set(scale, scale, scale)

    // Position at y = -9 (matching barrier base)
    pivot.position.set(0, -9, 15)

    model.traverse(child => {
        if (child.isMesh) {
            child.receiveShadow = true
        }
    })

    // Create second copy to the left
    const pivot2 = pivot.clone()
    pivot2.position.x -= 40
    scene.add(pivot2)

    // Create third copy to the right
    const pivot3 = pivot.clone()
    pivot3.position.x += 40
    scene.add(pivot3)
})

// 8. Speaker
loader.load('/speaker/scene.gltf', (gltf) => {
    const model = gltf.scene
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    const pivot = new THREE.Group()
    scene.add(pivot)

    model.position.copy(center).negate()
    pivot.add(model)

    const targetHeight = 5
    const scale = targetHeight / size.y
    pivot.scale.set(scale, scale, scale)

    pivot.position.set(-45, -13 + (size.y * scale) / 2, -25)
    
    // Rotate to face room center
    pivot.rotation.z = Math.PI / 2.4
    pivot.rotation.y = Math.PI / 4
    pivot.rotation.x = Math.PI / 9

    model.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
        }
    })

    // Mirrored clone for right side
    const pivot2 = pivot.clone(true)
    pivot2.position.set(0, -13 + (size.y * scale) / 2, -25)
    
    // Mirror rotations
    pivot2.rotation.x = pivot.rotation.x
    pivot2.rotation.y = -pivot.rotation.y
    pivot2.rotation.z = -pivot.rotation.z
    
    scene.add(pivot2)
})

// 9. Mazda RX-7
loader.load("/Mazda RX-7 Akagi's White Comet Remake/scene.gltf", (gltf) => {
    const model = gltf.scene
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    const pivot = new THREE.Group()
    scene.add(pivot)

    model.position.copy(center).negate()
    pivot.add(model)

    const targetLength = 1.2
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = targetLength / maxDim
    pivot.scale.set(scale, scale, scale)

    pivot.position.set(-3, 1.4 + (size.y * scale) / 2, -0.22)
    pivot.rotation.y = -Math.PI / 2.5 // Angle it slightly

    model.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
        }
    })
})

// 10. Yamaha R1
loader.load('/Yamaha R1 3D Model.glb', (gltf) => {
    const model = gltf.scene
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    const pivot = new THREE.Group()
    scene.add(pivot)

    model.position.copy(center).negate()
    pivot.add(model)

    const targetLength = 1.0
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = targetLength / maxDim
    pivot.scale.set(scale, scale, scale)

    // Position next to the car
    // Using x = -1.8 (to the right in world space) as x < -3 is occupied by the computer
    pivot.position.set(-5.4, 1.4 + (size.y * scale) / 2, 0.6)
    pivot.rotation.y = -Math.PI / 2

    model.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
        }
    })
})

// 11. Notepad
loader.load('/Notepad/scene.gltf', (gltf) => {
    const model = gltf.scene
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    const pivot = new THREE.Group()
    state.notepadPivot = pivot
    scene.add(pivot)

    model.position.copy(center).negate()
    pivot.add(model)

    const targetWidth = 2
    const scale = targetWidth / size.x
    pivot.scale.set(scale, scale, scale)

    pivot.position.set(3, -1 + (size.y * scale) / 2, 1.6)
    pivot.rotation.y = Math.PI / 1.1
    pivot.rotation.z = Math.PI

    model.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
            
            console.log('Notepad child:', child.name)

            // The paper part of the notepad (identified as the larger mesh from GLTF inspection)
            // Name in GLTF is Torus.002_Material.002_0
            if (child.name === 'Torus002_Material002_0' || child.name.includes('Torus.002')) {
                 console.log('Applying texture to Notepad Body')
                 
                 // Adjust texture scaling/offset
                 notepad.texture.center.set(0.5, 0.5);
                 notepad.texture.rotation = 0; 
                 notepad.texture.repeat.set(1.25, 1.25);
                 notepad.texture.offset.set(0, 0);
                 
                 child.material = new THREE.MeshStandardMaterial({
                    map: notepad.texture,
                    roughness: 0.9,
                    metalness: 0.0,
                    side: THREE.DoubleSide
                })
            }
        }
    })
})

// 12. Emergency Stop Button
loader.load('/Emergency Stop Button 3D Model.glb', (gltf) => {
    const model = gltf.scene
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    const pivot = new THREE.Group()
    state.emergencyButtonPivot = pivot
    scene.add(pivot)

    model.position.copy(center).negate()
    pivot.add(model)

    const targetWidth = 0.8 
    const scale = targetWidth / size.x
    pivot.scale.set(scale, scale, scale)

    // Position to the left of the arm (arm is at x=5, z=-1.5)
    pivot.position.set(3.0, (size.y * scale / 2), -1.5)
    
    model.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
        }
    })
})

// --- POST PROCESSING ---
const composer = new EffectComposer(renderer)

const renderPass = new RenderPass(scene, camera)
renderPass.enabled = false
composer.addPass(renderPass)

const renderPixelatedPass = new RenderPixelatedPass(1.5, scene, camera)
composer.addPass(renderPixelatedPass)

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
composer.addPass(crtPass)

const outputPass = new OutputPass()
composer.addPass(outputPass)

// --- INTERACTION ---
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()

window.addEventListener('mousemove', (event) => {
    // Only check for hover if focusing on the notepad
    if (state.isFocusingOnNotepad && state.notepadPivot) {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
        
        raycaster.setFromCamera(pointer, camera)
        
        // Find the paper mesh
        let paperMesh = null
        state.notepadPivot.traverse(child => {
            if (child.name === 'Torus002_Material002_0' || child.name.includes('Torus.002')) paperMesh = child
        })

        if (paperMesh) {
            const intersects = raycaster.intersectObject(paperMesh)
            if (intersects.length > 0) {
                const uv = intersects[0].uv
                // Canvas coordinates (1024x1024)
                // UV (0,0) is bottom-left, Canvas (0,0) is top-left
                // Texture is likely flipped or rotated, need to calibrate
                // Based on standard UV mapping:
                const x = uv.x * 1024
                const y = (1 - uv.y) * 1024
                
                // Check if hovering over any blog post title
                let hoveredIndex = -1
                
                notepad.blogPosts.forEach((post, index) => {
                    // Simple bounding box check
                    // Canvas size is 1024x1448
                    // X starts at 250. Width approx 500-600.
                    // Y is post.y
                    
                    // Apply texture transform (repeat 1.25 around center)
                    const tx = (uv.x - 0.5) * 1.25 + 0.5
                    const ty = (uv.y - 0.5) * 1.25 + 0.5
                    
                    const scaledX = tx * 1024
                    const scaledY = (1 - uv.y) * 1448

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

window.addEventListener('click', (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1

    raycaster.setFromCamera(pointer, camera)

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
            state.isEmergencyStopped = !state.isEmergencyStopped
            console.log('Emergency Stop Toggled:', state.isEmergencyStopped)
        }
    }
})

window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        state.isFocusingOnScreen = false
        state.isFocusingOnNotepad = false
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
})

// --- ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate)
    controls.update()

    // Camera Animation
    if (state.isFocusingOnScreen) {
        camera.position.lerp(ZOOM_POS, 0.05)
        controls.target.lerp(ZOOM_TARGET, 0.05)
    } else if (state.isFocusingOnNotepad) {
        camera.position.lerp(NOTEPAD_POS, 0.05)
        controls.target.lerp(NOTEPAD_TARGET, 0.05)
    } else if (state.isCameraLocked) {
        if (camera.position.distanceTo(DEFAULT_POS) > 0.1 || controls.target.distanceTo(DEFAULT_TARGET) > 0.1) {
             camera.position.lerp(DEFAULT_POS, 0.05)
             controls.target.lerp(DEFAULT_TARGET, 0.05)
        }
    }

    // Update Uniforms
    const time = Date.now() * 0.001
    crtPass.uniforms['time'].value = time

    // Arm Animation
    if (state.armSegments.arm) {
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
        state.raveLights.forEach((item, index) => {
            const config = activeConfig[index]
            
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
                
                if (item.type === 'spot') {
                    // Keep spotlights stationary for strobe effect
                    item.light.target.position.x = item.targetBaseX
                    item.light.target.position.y = 10
                }
            } else {
                // Light Show 1: Original red/white alternating pattern
                const colorIndex = Math.floor(time * config.speed + config.offset) % 2
                const color = colorIndex === 0 ? 0xff0000 : 0xffffff
                const intensity = colorIndex === 0 ? 1 : 2 // Boost white intensity
                
                item.light.color.setHex(color)
                item.light.intensity = item.type === 'rect' 
                    ? (colorIndex === 0 ? 5 : 10) 
                    : (colorIndex === 0 ? 100 : 200)

                if (item.type === 'spot') {
                    // Move spotlights
                    item.light.target.position.x = item.targetBaseX + Math.sin(time * config.speed + config.offset) * 10
                    item.light.target.position.y = 10 + Math.cos(time * config.speed * 0.5) * 5
                }
            }
        })
    }

    // Light Show 3: Bouncing red light around perimeter
    if (state.currentLightShow === 'lightShow3' && state.bouncingLight && !state.isEmergencyStopped) {
        // Square path: back-left -> back-right -> front-right -> front-left -> back-left
        // Perimeter: 100 (back) + 50 (right) + 100 (front) + 50 (left) = 300 units
        const perimeterLength = 300
        const speed = 0.5 // units per second
        const cycleTime = perimeterLength / speed // Time for one full cycle
        const pathTime = (time % cycleTime) / cycleTime // 0 to 1
        
        let x, z
        
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

    // Render
    terminal.update()
    oscilloscope.update()
    composer.render()
}

// --- RESIZE ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    composer.setSize(window.innerWidth, window.innerHeight)
    crtPass.uniforms['resolution'].value.set(window.innerWidth, window.innerHeight)
})

animate()
