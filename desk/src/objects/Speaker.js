import * as THREE from 'three'

export function loadSpeaker(loader, scene, state) {
    loader.load('/speaker/scene.gltf', (gltf) => {
        const model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        const pivot = new THREE.Group()
        state.speakerPivots.push(pivot)
        scene.add(pivot)

        model.position.copy(center).negate()
        pivot.add(model)

        const targetHeight = 5
        const scale = targetHeight / size.y
        pivot.scale.set(scale, scale, scale)

        pivot.position.set(-45, -13 + (size.y * scale) / 2, -25)
        
        // Rotate to face room center
        pivot.rotation.z = Math.PI / 2.4
        pivot.rotation.y = Math.PI / 4
        pivot.rotation.x = Math.PI / 9

        model.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })

        // Mirrored clone for right side
        const pivot2 = pivot.clone(true)
        pivot2.position.set(0, -13 + (size.y * scale) / 2, -25)
        
        // Mirror rotations
        pivot2.rotation.x = pivot.rotation.x
        pivot2.rotation.y = -pivot.rotation.y
        pivot2.rotation.z = -pivot.rotation.z
        
        state.speakerPivots.push(pivot2)
        scene.add(pivot2)
    })
}
