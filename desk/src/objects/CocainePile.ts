import * as THREE from 'three'
import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export function loadCocainePile(loader: GLTFLoader, scene: THREE.Scene): void {
    loader.load('/Cocaine Pile 3D Model.glb', (gltf) => {
        const model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        const pivot = new THREE.Group()
        scene.add(pivot)

        model.position.copy(center).negate()
        pivot.add(model)

        // Small size - target width of 0.4 units
        const targetWidth = 0.4
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = targetWidth / maxDim
        pivot.scale.set(scale, scale, scale)

        // Position in left front corner of desk
        // Desk is 14 units wide (x: -7 to +7), so left front corner is around x=-6, z=6
        pivot.position.set(-5, ((size.y * scale) / 2) + 0.5, 1.9)

        model.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
    })
}
