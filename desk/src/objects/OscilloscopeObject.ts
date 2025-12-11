import * as THREE from 'three'
import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { Oscilloscope } from '../Oscilloscope'

export function loadOscilloscope(loader: GLTFLoader, scene: THREE.Scene, oscilloscope: Oscilloscope): void {
    loader.load('/scope/scene.gltf', (gltf) => {
        const model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        const pivot = new THREE.Group()
        scene.add(pivot)

        model.position.copy(center).negate()
        pivot.add(model)

        const scale = 3.5 / size.x
        pivot.scale.set(scale, scale, scale)
        pivot.position.set(0, size.y * scale / 2, -2)

        model.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
                
                // Log mesh names to help debug
                console.log('Oscilloscope mesh found:', child.name)

                if (child.name === 'Cube012_Material102_0') {
                    oscilloscope.texture.center.set(0.5, 0.5)
                    oscilloscope.texture.rotation = -Math.PI / 2
                    
                    // Width is compressed to 25% (repeat 4x)
                    // Height is compressed to 75% (repeat 1.33x)
                    oscilloscope.texture.repeat.set(4, 1.33) 
                    
                    // Position 10% from left
                    // Calculation: We want the window (0.1 to 0.35) to map to texture (0 to 1)
                    // With repeat=4 and center=0.5:
                    // 0 = (0.1 - 0.5) * 4 + 0.5 + offset
                    // 0 = -1.6 + 0.5 + offset
                    // offset = 1.1
                    oscilloscope.texture.offset.set(0.1, 0)

                    child.material = new THREE.MeshStandardMaterial({
                        map: oscilloscope.texture,
                        emissiveMap: oscilloscope.texture,
                        emissive: 0xffffff,
                        emissiveIntensity: 1.0,
                        roughness: 0.2,
                        metalness: 0.5,
                        color: 0x000000
                    })
                }
            }
        })
    })
}
