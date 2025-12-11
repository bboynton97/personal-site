import * as THREE from 'three'

export function loadDesk(loader, scene) {
    loader.load('/metal_desk/scene.gltf', (gltf) => {
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
            if (child.isMesh) {
                child.receiveShadow = true
                child.castShadow = true
            }
        })
    })
}
