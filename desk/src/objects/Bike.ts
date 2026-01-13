import * as THREE from 'three'
import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { AppState } from '../types'
import { assetUrl } from '../utils/assetUrl'

export function loadBike(loader: GLTFLoader, scene: THREE.Scene, state: AppState): void {
    loader.load(assetUrl('Yamaha R1 3D Model.glb'), (gltf) => {
        const model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        const pivot = new THREE.Group()
        state.bikePivot = pivot
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
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
    }, undefined, (error) => {
        console.error('Failed to load Yamaha R1 3D Model.glb:', error)
    })
}
