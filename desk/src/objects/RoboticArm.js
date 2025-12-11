import * as THREE from 'three'

export function loadRoboticArm(loader, scene, state) {
    loader.load('/arm/Robotic Arm.glb', (gltf) => {
        const model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        const pivot = new THREE.Group()
        scene.add(pivot)

        const baseGroup = new THREE.Group()
        const armGroup = new THREE.Group()
        
        pivot.add(baseGroup)
        pivot.add(armGroup)
        
        // Position groups to center the model geometry
        const centerInv = center.clone().negate()
        baseGroup.position.copy(centerInv)
        armGroup.position.copy(centerInv)
        
        state.armSegments.base = baseGroup
        state.armSegments.arm = armGroup

        // Split meshes between base and arm
        const minY = center.y - size.y / 2
        const splitY = minY + size.y * 0.4
        const meshes = []
        
        model.traverse(child => { if (child.isMesh) meshes.push(child) })
        
        meshes.forEach(mesh => {
            const mBox = new THREE.Box3().setFromObject(mesh)
            const mCenter = new THREE.Vector3()
            mBox.getCenter(mCenter)
            
            if (mCenter.y < splitY) baseGroup.add(mesh)
            else armGroup.add(mesh)
            
            mesh.castShadow = true
            mesh.receiveShadow = true
        })

        const scale = 5.0 / size.y
        pivot.scale.set(scale, scale, scale)
        pivot.position.set(5.0, (size.y * scale / 2), -1.5)
        pivot.rotation.y = -Math.PI / 4

        const armLight = new THREE.PointLight(0xff0000, 10, 8)
        armLight.position.set(5.0 - 1, 3, -1.5 + 2)
        scene.add(armLight)
        state.roomLights.push(armLight)
    })
}
