import * as THREE from 'three'
import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { AppState } from '../types'
import { assetUrl } from '../utils/assetUrl'

export function loadCessna(loader: GLTFLoader, scene: THREE.Scene, state: AppState): void {
    loader.load(assetUrl('cessna172.glb'), (gltf) => {
        const model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        const pivot = new THREE.Group()
        state.cessnaPivot = pivot
        scene.add(pivot)

        model.position.copy(center).negate()
        pivot.add(model)

        // Scale the plane to a small desk model size
        const targetLength = 1.2
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = targetLength / maxDim
        pivot.scale.set(scale, scale, scale)

        // Position next to the notepad
        pivot.position.set(4.0, 0.2, -0.5)

        model.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
    }, undefined, (error) => {
        console.error('Failed to load cessna172.glb:', error)
    })
}
