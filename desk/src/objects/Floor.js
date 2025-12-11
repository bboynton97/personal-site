import * as THREE from 'three'

export function loadFloor(loader, scene, state) {
    loader.load('/floor.glb', (gltf) => {
        const model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        const pivot = new THREE.Group()
        state.floorPivots.push(pivot)
        scene.add(pivot)

        model.position.copy(center).negate()
        pivot.add(model)

        // Scale to be large enough
        const targetWidth = 40
        const scale = targetWidth / size.x
        pivot.scale.set(scale, scale, scale)

        // Position at y = -9 (matching barrier base)
        pivot.position.set(0, -9, 15)

        model.traverse(child => {
            if (child.isMesh) {
                child.receiveShadow = true
            }
        })

        // Create second copy to the left
        const pivot2 = pivot.clone()
        pivot2.position.x -= 40
        state.floorPivots.push(pivot2)
        scene.add(pivot2)

        // Create third copy to the right
        const pivot3 = pivot.clone()
        pivot3.position.x += 40
        state.floorPivots.push(pivot3)
        scene.add(pivot3)
    })
}
