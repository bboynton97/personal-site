import * as THREE from 'three'
import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { assetUrl } from '../utils/assetUrl'

export function loadDeskChair(loader: GLTFLoader, scene: THREE.Scene): void {
    loader.load(assetUrl('Wooden Desk Chair 3D Model.glb'), (gltf) => {
        const model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        const pivot = new THREE.Group()
        scene.add(pivot)

        model.position.copy(center).negate()
        pivot.add(model)

        // Scale to appropriate size (similar to desk scale)
        const targetHeight = 8
        const scale = targetHeight / size.y
        pivot.scale.set(scale, scale, scale)

        // Position in front of desk (positive Z) and on the floor (under camera)
        // Desk is at z=0, camera is at (1, 4, 8), so chair should be at z=3-4
        pivot.position.set(0.5, -9 + (size.y * scale) / 2, 6)

        model.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
    }, undefined, (error) => {
        console.error('Failed to load Wooden Desk Chair 3D Model.glb:', error)
    })
}
