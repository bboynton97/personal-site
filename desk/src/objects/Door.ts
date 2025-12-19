import * as THREE from 'three'
import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { AppState } from '../types'

export function loadDoor(loader: GLTFLoader, scene: THREE.Scene, state: AppState): void {
    loader.load('/door.glb', (gltf) => {
        const model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        const pivot = new THREE.Group()
        scene.add(pivot)

        model.position.copy(center).negate()
        pivot.add(model)

        // Scale the door to a reasonable size
        const targetHeight = 20
        const scale = targetHeight / size.y
        pivot.scale.set(scale, scale, scale)

        // Position the door in front of the intro camera position
        // Intro camera is at (1, 4, 20), looking at (0, 0, 0)
        // Place door between intro camera and the scene
        pivot.position.set(0, 3, 12)
        
        // Rotate to face the camera
        pivot.rotation.y = Math.PI

        model.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })

        // Add a light in front of the door to illuminate it
        const doorLight = new THREE.SpotLight(0xffffff, 200)
        doorLight.position.set(0, 8, 16) // In front of and above the door
        doorLight.target.position.set(0, 3, 12) // Point at the door
        doorLight.angle = Math.PI / 4
        doorLight.penumbra = 0.5
        doorLight.castShadow = true
        scene.add(doorLight)
        scene.add(doorLight.target)

        state.doorPivot = pivot
        state.doorLight = doorLight

        // Calculate the door's scaled width
        const doorScaledWidth = size.x * scale

        // Load walls on either side of the door
        loader.load('/Concrete Wall 3D Model.glb', (wallGltf) => {
            const wallModel = wallGltf.scene
            const wallBox = new THREE.Box3().setFromObject(wallModel)
            const wallSize = wallBox.getSize(new THREE.Vector3())
            const wallCenter = wallBox.getCenter(new THREE.Vector3())

            // Scale wall to match door height
            const wallScale = 20 / wallSize.y
            const wallScaledWidth = wallSize.x * wallScale

            // Calculate wall offset: half door width + half wall width
            const wallOffset = (doorScaledWidth / 2) + (wallScaledWidth / 2)

            // Create left wall
            const leftWallPivot = new THREE.Group()
            scene.add(leftWallPivot)
            
            const leftWallModel = wallModel.clone()
            leftWallModel.position.copy(wallCenter).negate()
            leftWallPivot.add(leftWallModel)

            leftWallPivot.scale.set(wallScale, wallScale, wallScale)

            // Position to the left of the door
            leftWallPivot.position.set(-wallOffset, 3, 12)
            leftWallPivot.rotation.y = Math.PI

            leftWallModel.traverse(child => {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true
                    child.receiveShadow = true
                }
            })

            // Create right wall
            const rightWallPivot = new THREE.Group()
            scene.add(rightWallPivot)
            
            const rightWallModel = wallModel.clone()
            rightWallModel.position.copy(wallCenter).negate()
            rightWallPivot.add(rightWallModel)

            rightWallPivot.scale.set(wallScale, wallScale, wallScale)

            // Position to the right of the door
            rightWallPivot.position.set(wallOffset, 3, 12)
            rightWallPivot.rotation.y = Math.PI

            rightWallModel.traverse(child => {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true
                    child.receiveShadow = true
                }
            })

            state.doorWalls = [leftWallPivot, rightWallPivot]
        })
    })
}
