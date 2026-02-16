import * as THREE from 'three'
import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { assetUrl } from '../utils/assetUrl'

export function loadDesk(loader: GLTFLoader, scene: THREE.Scene): Promise<void> {
    return new Promise((resolve, reject) => {
    loader.load(assetUrl('metal_desk/scene.glb'), (gltf) => {
        const model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        const pivot = new THREE.Group()
        scene.add(pivot)

        model.position.copy(center).negate()
        pivot.add(model)

        const targetWidth = 14
        const scale = targetWidth / size.x
        pivot.scale.set(scale, scale, scale)
        pivot.position.set(0, -(size.y * scale) / 2, 0)

        model.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.receiveShadow = true
                child.castShadow = true
            }
        })
        resolve()
    }, undefined, (error) => {
        console.error('Failed to load metal_desk/scene.glb:', error)
        reject(error)
    })
    })
}
