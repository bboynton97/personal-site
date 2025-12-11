import * as THREE from 'three'

export function loadNotepad(loader, scene, state, notepad) {
    loader.load('/Notepad/scene.gltf', (gltf) => {
        const model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        const pivot = new THREE.Group()
        state.notepadPivot = pivot
        scene.add(pivot)

        model.position.copy(center).negate()
        pivot.add(model)

        const targetWidth = 2
        const scale = targetWidth / size.x
        pivot.scale.set(scale, scale, scale)

        pivot.position.set(3, -1 + (size.y * scale) / 2, 1.6)
        pivot.rotation.y = Math.PI / 1.1
        pivot.rotation.z = Math.PI

        model.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
                
                console.log('Notepad child:', child.name)

                // The paper part of the notepad (identified as the larger mesh from GLTF inspection)
                // Name in GLTF is Torus.002_Material.002_0
                if (child.name === 'Torus002_Material002_0' || child.name.includes('Torus.002')) {
                     console.log('Applying texture to Notepad Body')
                     
                     // Adjust texture scaling/offset
                     notepad.texture.center.set(0.5, 0.5);
                     notepad.texture.rotation = 0; 
                     notepad.texture.repeat.set(1.25, 1.25);
                     notepad.texture.offset.set(0, 0);
                     
                     child.material = new THREE.MeshStandardMaterial({
                        map: notepad.texture,
                        roughness: 0.9,
                        metalness: 0.0,
                        side: THREE.DoubleSide
                    })
                }
            }
        })
    })
}
