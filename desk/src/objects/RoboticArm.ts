import * as THREE from 'three'
import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { AppState } from '../types'
import { assetUrl } from '../utils/assetUrl'

export function loadRoboticArm(loader: GLTFLoader, scene: THREE.Scene, state: AppState): void {
    loader.load(assetUrl('arm/Robotic Arm.glb'), (gltf) => {
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
        const meshes: THREE.Mesh[] = []
        
        model.traverse(child => { if (child instanceof THREE.Mesh) meshes.push(child) })
        
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
    }, undefined, (error) => {
        console.error('Failed to load arm/Robotic Arm.glb:', error)
    })
}
