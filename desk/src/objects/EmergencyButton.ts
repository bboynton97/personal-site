import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { AppState } from '../types'
import typeface from 'three/examples/fonts/helvetiker_regular.typeface.json'

export function loadEmergencyButton(loader: GLTFLoader, scene: THREE.Scene, state: AppState): void {
    loader.load('/Emergency Stop Button 3D Model.glb', (gltf) => {
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
        
        model.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })

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
    })
}
