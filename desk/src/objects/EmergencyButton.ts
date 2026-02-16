import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { AppState } from '../types'
import typeface from 'three/examples/fonts/helvetiker_regular.typeface.json'
import { assetUrl } from '../utils/assetUrl'

export function loadEmergencyButton(loader: GLTFLoader, scene: THREE.Scene, state: AppState): Promise<void> {
    return new Promise((resolve, reject) => {
    loader.load(assetUrl('Emergency Stop Button 3D Model.glb'), (gltf) => {
        const model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        const pivot = new THREE.Group()
        state.emergencyButtonPivot = pivot
        scene.add(pivot)

        model.position.copy(center).negate()
        pivot.add(model)

        const targetWidth = 0.8 
        const scale = targetWidth / size.x
        pivot.scale.set(scale, scale, scale)

        // Position to the left of the arm (arm is at x=5, z=-1.5)
        pivot.position.set(3.0, (size.y * scale / 2), -1.5)

        // Separate top 20% of meshes for press animation
        const topThreshold = box.max.y - (size.y * 0.20)
        const topPivot = new THREE.Group()
        topPivot.name = 'buttonTop'
        state.emergencyButtonTopPivot = topPivot
        
        // Collect meshes that are in the top 20%
        const meshesToMove: THREE.Mesh[] = []
        model.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
                
                // Get the mesh's world bounding box
                const meshBox = new THREE.Box3().setFromObject(child)
                // If the mesh's min Y is above the top threshold, it's in the top portion
                if (meshBox.min.y >= topThreshold) {
                    meshesToMove.push(child)
                }
            }
        })
        
        // Move top meshes to the top pivot
        meshesToMove.forEach(mesh => {
            const worldPos = new THREE.Vector3()
            mesh.getWorldPosition(worldPos)
            mesh.removeFromParent()
            topPivot.add(mesh)
            // Restore position relative to new parent
            mesh.position.copy(worldPos)
            topPivot.worldToLocal(mesh.position)
        })
        
        model.add(topPivot)

        // Add "EMERGENCY STOP" text
        const fontLoader = new FontLoader()
        const font = fontLoader.parse(typeface)
        const textGeometry = new TextGeometry('DO NOT PRESS', {
            font: font,
            size: 0.08,
            height: 0.01,
            width: 0.01,
            depth: 0.01
        })
        
        const textMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff0000, 
            emissive: 0xff0000, 
            emissiveIntensity: 0.5 
        })
        const textMesh = new THREE.Mesh(textGeometry, textMaterial)
        
        textMesh.rotation.x = -Math.PI / 2
        // Place to the left of the button
        textMesh.position.set(2.62, 0.02, -0.9)
        
        scene.add(textMesh)
        state.emergencyText = textMesh
        textMesh.visible = false
        resolve()
    }, undefined, (error) => {
        console.error('Failed to load Emergency Stop Button 3D Model.glb:', error)
        reject(error)
    })
    })
}
