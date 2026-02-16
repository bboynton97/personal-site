import * as THREE from 'three'
import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { AppState } from '../types'
import { assetUrl } from '../utils/assetUrl'

export function loadGitHubOctocat(loader: GLTFLoader, scene: THREE.Scene, state: AppState): Promise<void> {
    return new Promise((resolve, reject) => {
    loader.load(assetUrl('github-octocat/source/scene.glb'), (gltf) => {
        const model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        const pivot = new THREE.Group()
        scene.add(pivot)

        model.position.copy(center).negate()
        pivot.add(model)

        // Scale the octocat to a nice desk-sized figure
        const targetHeight = 0.8
        const scale = targetHeight / size.y
        pivot.scale.set(scale, scale, scale)

        // Position in front of the robotic arm (arm is at x:5, z:-1.5)
        // Place it on the desk surface, slightly forward and to the side
        pivot.position.set(5.4, 0.5, 0.4)
        
        // Rotate to face the camera/viewer
        pivot.rotation.y = -Math.PI / 6

        model.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })

        state.octocatPivot = pivot
        resolve()
    }, undefined, (error) => {
        console.error('Failed to load github-octocat/source/scene.glb:', error)
        // Try to fetch the file directly to diagnose
        fetch('/github-octocat/source/scene.glb', { method: 'HEAD' })
            .then(res => {
                const contentType = res.headers.get('Content-Type')
                console.error(`GLB file HTTP status: ${res.status}, Content-Type: ${contentType}, Size: ${res.headers.get('Content-Length')}`)
                if (contentType && contentType.includes('text/html')) {
                    console.error('⚠️ Server is returning HTML instead of GLB file! Check nginx configuration.')
                }
            })
            .catch(err => console.error('Could not check GLB file:', err))
        reject(error)
    })
    })
}
