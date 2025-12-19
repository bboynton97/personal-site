import * as THREE from 'three'
import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { AppState } from '../types'

export function loadHorrorMonster(loader: GLTFLoader, scene: THREE.Scene, state: AppState): void {
    // Load creepy knock sound
    const listener = new THREE.AudioListener()
    const audioLoader = new THREE.AudioLoader()
    const creepyKnockSound = new THREE.Audio(listener)
    audioLoader.load(
        '/creepy-knock.m4a',
        (buffer) => {
            creepyKnockSound.setBuffer(buffer)
            creepyKnockSound.setVolume(0.8)
            state.creepyKnockSound = creepyKnockSound
        }
    )
    
    // Load horror fade sound (plays when monster starts fading out)
    const horrorFadeSound = new THREE.Audio(listener)
    audioLoader.load(
        '/horror-sound-lurking-horror-monster-189948.mp3',
        (buffer) => {
            horrorFadeSound.setBuffer(buffer)
            horrorFadeSound.setVolume(0.7)
            state.horrorFadeSound = horrorFadeSound
        }
    )
    
    // Load jumpscare sound
    const jumpscareSound = new THREE.Audio(listener)
    audioLoader.load(
        '/jumpscare.mp3',
        (buffer) => {
            jumpscareSound.setBuffer(buffer)
            jumpscareSound.setVolume(0.8)
            state.jumpscareSound = jumpscareSound
        }
    )
    loader.load('/smily_horror_monster.glb', (gltf) => {
        const model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        const pivot = new THREE.Group()
        state.horrorMonsterPivot = pivot
        scene.add(pivot)
        
        // Hide initially - only shown in backrooms when zooming
        pivot.visible = false

        model.position.copy(center).negate()
        pivot.add(model)
        
        // Scale the monster to be visible but not too large
        // Adjust based on actual model size
        const targetHeight = 8 // Target height in scene units
        const scaleFactor = targetHeight / size.y
        pivot.scale.set(scaleFactor, scaleFactor, scaleFactor)
        
        // Position far in the background behind the desk
        // When user zooms into notepad/screen, monster appears behind them
        pivot.position.set(-10, -3.5, -110)
        
        // Make the monster face the camera/user
        pivot.rotation.y = Math.PI * 0

        model.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
                
                // Make it slightly darker/creepier and enable transparency for fading
                const material = child.material as THREE.MeshStandardMaterial
                if (material && material.isMeshStandardMaterial) {
                    material.emissive = new THREE.Color(0x110000)
                    material.emissiveIntensity = 0.1
                    material.transparent = true
                    material.opacity = 1
                }
            }
        })
    })
}
