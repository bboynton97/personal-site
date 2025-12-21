import * as THREE from 'three'
import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { AppState } from '../types'

export function loadIpodClassic(loader: GLTFLoader, scene: THREE.Scene, state: AppState): void {
    loader.load('/ipod_classic.glb', (gltf) => {
        const model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        const pivot = new THREE.Group()
        scene.add(pivot)

        model.position.copy(center).negate()
        pivot.add(model)

        // Scale the iPod to a realistic desk size
        const targetHeight = 0.8
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = targetHeight / maxDim
        pivot.scale.set(scale, scale, scale)

        // Position to the left of the notepad (notepad is at x=3, z=1.6)
        // Desk surface is around y=0.5
        pivot.position.set(1.5, 0.15, 1.6)

        // Slight rotation so it's angled nicely on the desk
        pivot.rotation.y = -Math.PI / 12
        pivot.rotation.z = -Math.PI / 10
        pivot.rotation.x = -Math.PI / 2

        model.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })

        state.ipodPivot = pivot
    })
}

