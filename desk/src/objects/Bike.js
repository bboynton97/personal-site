import * as THREE from 'three'

export function loadBike(loader, scene, state) {
    loader.load('/Yamaha R1 3D Model.glb', (gltf) => {
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
            if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
    })
}
