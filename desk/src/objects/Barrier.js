import * as THREE from 'three'

export function loadBarrier(loader, scene, state) {
    loader.load('/Steel Road Barrier 3D Model.glb', (gltf) => {
        const model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        const pivot = new THREE.Group()
        state.barrierPivots.push(pivot)
        scene.add(pivot)

        model.position.copy(center).negate()
        pivot.add(model)

        const targetWidth = 20
        const scale = targetWidth / size.x
        pivot.scale.set(scale, scale, scale)

        // Position roughly on floor (assuming floor at y=-7 based on desk) and behind
        pivot.position.set(0, -9 + (size.y * scale) / 2, -5)
        // pivot.rotation.y = Math.PI / 12

        model.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })

        // Create second copy to the left
        const pivot2 = pivot.clone()
        pivot2.position.x -= 20
        state.barrierPivots.push(pivot2)
        scene.add(pivot2)

        // Create third copy to the right
        const pivot3 = pivot.clone()
        pivot3.position.x += 20
        state.barrierPivots.push(pivot3)
        scene.add(pivot3)
    })
}
