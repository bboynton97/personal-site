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
import { CRTShader } from './shaders/CRTShader'
import { WhiteOutShader } from './shaders/WhiteOutShader'
import { Terminal } from './meshes/Terminal'
import { Oscilloscope } from './meshes/Oscilloscope'
import { Notepad } from './meshes/Notepad'
import { loadSimpleObjects, loadComputer, loadOscilloscope, loadNotepad, loadDoor } from './objects/index'
import { createAnimationLoop } from './animate'

// New Modules
import { state } from './state'
import { loadAnimatedGIF } from './utils/gifLoader'
import { setupLights } from './setup/lights'
import { setupInteractions } from './interaction'
import { setupInputListeners } from './input'
import { createDeathOverlay } from './utils/deathScreen'

// --- CONSTANTS ---
const DEFAULT_POS = new THREE.Vector3(1, 4, 8)
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0)
const INTRO_POS = new THREE.Vector3(1, 4, 20)
const INTRO_TARGET = new THREE.Vector3(0, 0, 0)

// --- SCENE SETUP ---
const scene = new THREE.Scene()
scene.fog = new THREE.FogExp2(0x050505, 0.02)
RectAreaLightUniformsLib.init()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
// Start camera at intro position (further back, behind the door)
camera.position.copy(INTRO_POS)
camera.lookAt(INTRO_TARGET)

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
setupLights(scene, state)

// --- TERMINAL ---
const terminal = new Terminal()
const oscilloscope = new Oscilloscope()
const notepad = new Notepad()

// --- ASSET LOADING ---
const loader = new GLTFLoader()

// Load door and walls first, then load everything else
loadDoor(loader, scene, state).then(() => {
    // Load simple objects (only need loader, scene, state)
    loadSimpleObjects(loader, scene, state)

    // Load objects that need additional parameters
    loadComputer(loader, scene, terminal, state)
    loadOscilloscope(loader, scene, oscilloscope)
    loadNotepad(loader, scene, state, notepad)
    
    // Mark scene as ready after a minimum delay to ensure assets load
    setTimeout(() => {
        state.introSceneReady = true
    }, 1500)
})

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

// Load potentially async assets
loadAnimatedGIF(whiteOutPass)

// Create death screen overlay
createDeathOverlay()

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
setupInteractions(camera, scene, state, notepad, terminal, crtPass)
setupInputListeners(
    state,
    terminal,
    renderPixelatedPass,
    crtPass,
    bloomPass,
    renderPass,
    controls,
    camera,
    DEFAULT_POS,
    DEFAULT_TARGET
)

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
