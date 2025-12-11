import * as THREE from 'three'

export function loadWall(loader, scene, state) {
    loader.load('/Industrial Factory Wall 3D Model (1).glb', (gltf) => {
        const model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        const pivot = new THREE.Group()
        state.wallPivots.push(pivot)
        scene.add(pivot)

        model.position.copy(center).negate()
        pivot.add(model)

        const targetWidth = 100
        const scale = targetWidth / size.x
        pivot.scale.set(scale, scale, scale)

        // Position behind barrier (z = -5)
        pivot.position.set(0, -12 + (size.y * scale) / 2, -30)

        model.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
                if (child.material) {
                    child.material.side = THREE.DoubleSide
                    child.material.needsUpdate = true
                }
            }
        })

        // Create lower copy
        const pivotLower = pivot.clone()
        pivotLower.position.y -= size.y * scale
        state.wallPivots.push(pivotLower)
        scene.add(pivotLower)

        // Create upper copy
        const pivotUpper = pivot.clone()
        pivotUpper.position.y += size.y * scale
        state.wallPivots.push(pivotUpper)
        scene.add(pivotUpper)

        // Create Left Wall (Corner)
        const pivotLeft = pivot.clone()
        pivotLeft.rotation.y = Math.PI / 2
        // Wall width is 100. Center is at 0. Extends +/- 50.
        // We want the "right" side (in local space, +50 X) to be at Z=-30.
        // Rotated 90deg, local X+ becomes world Z-.
        // So the wall extends from CenterZ to CenterZ - 50 = -30. => CenterZ = 20.
        pivotLeft.position.set(-50, -12 + (size.y * scale) / 2, 20)
        state.wallPivots.push(pivotLeft)
        scene.add(pivotLeft)

        // Left Wall Lower Copy
        const pivotLeftLower = pivotLeft.clone()
        pivotLeftLower.position.y -= size.y * scale
        state.wallPivots.push(pivotLeftLower)
        scene.add(pivotLeftLower)
    })
}
