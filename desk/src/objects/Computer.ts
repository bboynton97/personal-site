import * as THREE from 'three'
import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { AppState } from '../types'
import type { Terminal } from '../meshes/Terminal'
import { assetUrl } from '../utils/assetUrl'

export function loadComputer(loader: GLTFLoader, scene: THREE.Scene, terminal: Terminal, state: AppState): Promise<void> {
    return new Promise((resolve, reject) => {
    loader.load(assetUrl('computer/scene_converted.glb'), (gltf) => {
        const model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        const pivot = new THREE.Group()
        state.computerPivot = pivot
        scene.add(pivot)

        model.position.copy(center).negate()
        pivot.add(model)

        const maxDim = Math.max(size.x, size.y, size.z)
        const targetSize = 3 * 1.875
        const scale = targetSize / maxDim
        pivot.scale.set(scale, scale, scale)
        pivot.position.set(-4, (size.y * scale / 2) - 0.4, 0)
        pivot.rotation.y = 0.3 - Math.PI / 2

        model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => {
                            mat.side = THREE.DoubleSide
                            mat.needsUpdate = true
                        })
                    } else {
                        child.material.side = THREE.DoubleSide
                        child.material.needsUpdate = true
                    }
                }

                const name = child.name.toLowerCase()

                if (name.includes('glass')) {
                    // Glass Layer (excluding convex screen)
                    const material = Array.isArray(child.material) ? child.material[0] : child.material
                    child.material = material.clone()
                    if (child.material instanceof THREE.MeshStandardMaterial) {
                        child.material.transparent = true
                        child.material.opacity = 0.1
                        child.material.roughness = 0.1
                        child.material.metalness = 0.9
                        child.material.blending = THREE.AdditiveBlending
                    }
                } else if (name.includes('cube_screen_0')) {
                    // The Main Screen (Convex)

                    // 1. Compute Planar UVs to map texture onto the curved surface
                    child.geometry.computeBoundingBox()
                    const box = child.geometry.boundingBox
                    if (!box) return
                    const size = new THREE.Vector3()
                    box.getSize(size)

                    // Identify the "flat" dimensions vs "depth"
                    // Assuming depth is the smallest dimension
                    const minDim = Math.min(size.x, size.y, size.z)

                    const positionAttribute = child.geometry.attributes.position
                    const uvAttribute = new THREE.BufferAttribute(new Float32Array(positionAttribute.count * 2), 2)

                    for (let i = 0; i < positionAttribute.count; i++) {
                        const x = positionAttribute.getX(i)
                        const y = positionAttribute.getY(i)
                        const z = positionAttribute.getZ(i)

                        let u: number, v: number

                        // Planar projection
                        if (size.x <= minDim + 0.001) {
                            // Projects along X
                            u = (z - box.min.z) / size.z
                            v = (y - box.min.y) / size.y
                        } else if (size.y <= minDim + 0.001) {
                            // Projects along Y
                            u = (x - box.min.x) / size.x
                            v = (z - box.min.z) / size.z
                        } else {
                            // Projects along Z
                            u = (x - box.min.x) / size.x
                            v = (y - box.min.y) / size.y
                        }

                        uvAttribute.setXY(i, u, v)
                    }

                    child.geometry.setAttribute('uv', uvAttribute)
                    child.geometry.attributes.uv.needsUpdate = true

                    // Reset texture transforms to defaults first, then adjust if needed
                    // Planar mapping usually results in standard orientation
                    terminal.texture.center.set(0.5, 0.5)
                    terminal.texture.rotation = Math.PI / 2
                    terminal.texture.repeat.set(1, 1)

                    // Use MeshStandardMaterial for reflections + glowing text
                    child.material = new THREE.MeshStandardMaterial({
                        map: terminal.texture,
                        emissiveMap: terminal.texture,
                        emissive: 0xffffff,
                        emissiveIntensity: 1.1,
                        roughness: 0.2,
                        metalness: 0.8,
                        color: 0x000000
                    })
                } else if (name.includes('monitor_screen_0')) {
                    // Hide old flat screen
                    child.visible = false
                }
            }
        })
        resolve()
    }, undefined, (error) => {
        console.error('Failed to load computer/scene_converted.glb. File may not be served correctly by the server:', error)
        reject(error)
    })
    })
}
