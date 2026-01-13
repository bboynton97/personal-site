import * as THREE from 'three'
import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { AppState } from '../types'
import { assetUrl } from '../utils/assetUrl'

export function loadEverythingBagel(loader: GLTFLoader, scene: THREE.Scene, state: AppState): void {
    loader.load(assetUrl('everything_bagel.glb'), (gltf) => {
        const model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        const pivot = new THREE.Group()
        scene.add(pivot)

        model.position.copy(center).negate()
        pivot.add(model)

        // Scale the bagel to a nice desk-sized object
        const targetWidth = 0.9
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = targetWidth / maxDim
        pivot.scale.set(scale, scale, scale)

        // Position on the desk - near the notepad area, slightly to the right
        // Desk surface is at y=0.5
        pivot.position.set(5.5, 0.2, 2)

        // Slight rotation for visual interest
        pivot.rotation.y = Math.PI / 8

        // Darken the bagel materials
        const darkenFactor = 1 // Lower = darker (0.0 to 1.0)
        model.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
                
                // Darken the material - handle all material types
                if (child.material) {
                    const materials = Array.isArray(child.material) ? child.material : [child.material]
                    const newMaterials = materials.map(mat => {
                        // Get the texture from the original material
                        const map = (mat as any).map as THREE.Texture | null
                        
                        // Create a new darker MeshStandardMaterial
                        const newMat = new THREE.MeshStandardMaterial({
                            map: map,
                            color: new THREE.Color(darkenFactor, darkenFactor, darkenFactor),
                            roughness: 0.8,
                            metalness: 0.0,
                        })
                        
                        return newMat
                    })
                    
                    child.material = newMaterials.length === 1 ? newMaterials[0] : newMaterials
                }
            }
        })

        state.bagelPivot = pivot
    }, undefined, (error) => {
        console.error('Failed to load everything_bagel.glb:', error)
    })
}

