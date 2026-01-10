import * as THREE from 'three'
import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { AppState } from '../types'
import type { Notepad } from '../meshes/Notepad'

export function loadNotepad(loader: GLTFLoader, scene: THREE.Scene, state: AppState, notepad: Notepad): void {
    loader.load('/Notepad/scene.glb', (gltf) => {
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
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true

                // The paper part of the notepad (identified as the larger mesh from GLTF inspection)
                // Name in GLTF is Torus.002_Material.002_0
                if (child.name === 'Torus002_Material002_0' || child.name.includes('Torus.002')) {
                    // === TEXTURE MAPPING SETTINGS (tweak these!) ===
                    const textureSettings = {
                        centerX: 0.5,
                        centerY: 0.5,
                        rotation: 0,
                        repeatX: 1.85,
                        repeatY: 1.15,
                        offsetX: -0.5,
                        offsetY: -0.275
                    }
                    
                    notepad.texture.center.set(textureSettings.centerX, textureSettings.centerY)
                    notepad.texture.rotation = textureSettings.rotation
                    notepad.texture.repeat.set(textureSettings.repeatX, textureSettings.repeatY)
                    notepad.texture.offset.set(textureSettings.offsetX, textureSettings.offsetY)

                    child.material = new THREE.MeshStandardMaterial({
                        map: notepad.texture,
                        roughness: 0.9,
                        metalness: 0.0,
                        side: THREE.DoubleSide
                    })
                }
            }
        })
    }, undefined, (error) => {
        console.error('Failed to load Notepad/scene.glb. File may not be served correctly by the server:', error)
    })
}
