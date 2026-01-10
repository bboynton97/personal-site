import * as THREE from 'three'
import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { AppState } from '../types'

export function loadCar(loader: GLTFLoader, scene: THREE.Scene, state: AppState): void {
    loader.load("/Mazda RX-7 Akagi's White Comet Remake/scene.glb", (gltf) => {
        const model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        const pivot = new THREE.Group()
        state.carPivot = pivot
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
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
    }, undefined, (error) => {
        console.error("Failed to load Mazda RX-7 Akagi's White Comet Remake/scene.glb:", error)
    })
}
