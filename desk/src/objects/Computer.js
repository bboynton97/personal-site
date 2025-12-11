import * as THREE from 'three'

export function loadComputer(loader, scene, terminal, state) {
    loader.load('/computer/scene_converted.glb', (gltf) => {
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
            if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
                if (child.material) {
                    child.material.side = THREE.DoubleSide
                    child.material.needsUpdate = true
                }

                const name = child.name.toLowerCase()

                if (name.includes('glass')) {
                    // Glass Layer (excluding convex screen)
                    child.material = child.material.clone()
                    child.material.transparent = true
                    child.material.opacity = 0.1
                    child.material.roughness = 0.1
                    child.material.metalness = 0.9
                    child.material.blending = THREE.AdditiveBlending
                } else if (name.includes('cube_screen_0')) {
                    // The Main Screen (Convex)
                    console.log('FOUND CONVEX SCREEN:', child.name)
                    
                    // 1. Compute Planar UVs to map texture onto the curved surface
                    child.geometry.computeBoundingBox();
                    const box = child.geometry.boundingBox;
                    const size = new THREE.Vector3();
                    box.getSize(size);
                    
                    // Identify the "flat" dimensions vs "depth"
                    // Assuming depth is the smallest dimension
                    const minDim = Math.min(size.x, size.y, size.z);
                    
                    const positionAttribute = child.geometry.attributes.position;
                    const uvAttribute = new THREE.BufferAttribute(new Float32Array(positionAttribute.count * 2), 2);
                    
                    for (let i = 0; i < positionAttribute.count; i++) {
                        const x = positionAttribute.getX(i);
                        const y = positionAttribute.getY(i);
                        const z = positionAttribute.getZ(i);
                        
                        let u, v;
                        
                        // Planar projection
                        if (size.x <= minDim + 0.001) {
                            // Projects along X
                            u = (z - box.min.z) / size.z;
                            v = (y - box.min.y) / size.y;
                        } else if (size.y <= minDim + 0.001) {
                            // Projects along Y
                            u = (x - box.min.x) / size.x;
                            v = (z - box.min.z) / size.z;
                        } else {
                            // Projects along Z
                            u = (x - box.min.x) / size.x;
                            v = (y - box.min.y) / size.y;
                        }
                        
                        uvAttribute.setXY(i, u, v);
                    }
                    
                    child.geometry.setAttribute('uv', uvAttribute);
                    child.geometry.attributes.uv.needsUpdate = true;

                    // Reset texture transforms to defaults first, then adjust if needed
                    // Planar mapping usually results in standard orientation
                    terminal.texture.center.set(0.5, 0.5);
                    terminal.texture.rotation = Math.PI / 2;
                    terminal.texture.repeat.set(1, 1);

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
                    child.visible = false;
                }
            }
        })
    })
}
