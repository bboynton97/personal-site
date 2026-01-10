import * as THREE from 'three'
import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { AppState } from '../types'

export function loadNapkin(loader: GLTFLoader, scene: THREE.Scene, state: AppState): void {
    loader.load('/napkin.glb', (gltf) => {
        const model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        const pivot = new THREE.Group()
        scene.add(pivot)

        model.position.copy(center).negate()
        pivot.add(model)

        // Scale the napkin to fit under the bagel
        const targetWidth = 1.2
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = targetWidth / maxDim
        pivot.scale.set(scale, scale, scale)

        // Position directly under the bagel (bagel is at 5.5, 0.2, 2)
        // Napkin sits on desk surface
        pivot.position.set(5.5, 0.1, 2)

        // Match bagel rotation
        pivot.rotation.y = Math.PI / 8

        model.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })

        state.napkinPivot = pivot
    }, undefined, (error) => {
        console.error('Failed to load napkin.glb:', error)
    })
}

