import * as THREE from 'three'
import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { AppState } from '../types'

// Helper to create text texture
function createTextTexture(text: string, fontSize: number = 64, color: string = '#ffffff'): THREE.CanvasTexture {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    
    canvas.width = 512
    canvas.height = 128
    
    ctx.fillStyle = 'transparent'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    ctx.font = `bold ${fontSize}px Arial, sans-serif`
    ctx.fillStyle = color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, canvas.width / 2, canvas.height / 2)
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
}

// Social media URLs
const SOCIAL_URLS = {
    x: 'https://x.com/braelyn_ai',
    instagram: 'https://instagram.com/braelyn.b__',
    linkedin: 'https://www.linkedin.com/in/braelyn-ai/',
    onlyfans: 'https://www.youtube.com/watch?v=xvFZjo5PgG0'
}

export function loadDoor(loader: GLTFLoader, scene: THREE.Scene, state: AppState): Promise<void> {
    return new Promise((resolve) => {
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
                // Make door material not reflect lights
                if (child.material) {
                    const mat = child.material as THREE.MeshStandardMaterial
                    if (mat.metalness !== undefined) {
                        mat.metalness = 0
                        mat.roughness = 1
                    }
                }
            }
        })

        // Create door UI group (positioned in front of door, facing camera)
        const doorUI = new THREE.Group()
        doorUI.position.set(0, 2.5, 13) // In front of door
        scene.add(doorUI)

        // "braelyn.ai" title
        const titleTexture = createTextTexture('braelyn.ai', 72)
        const titleMaterial = new THREE.MeshBasicMaterial({ 
            map: titleTexture, 
            transparent: true,
            side: THREE.DoubleSide
        })
        const titleGeom = new THREE.PlaneGeometry(4, 1)
        const titleMesh = new THREE.Mesh(titleGeom, titleMaterial)
        titleMesh.position.set(0, 2.5, 0)
        doorUI.add(titleMesh)

        // Social links as text in 2x2 grid
        const linkSpacingX = 1.5
        const linkSpacingY = 0.6
        const linksBaseY = 1

        // Top row
        // X (Twitter) - top left
        const xTexture = createTextTexture('x', 48)
        const xMaterial = new THREE.MeshBasicMaterial({ map: xTexture, transparent: true, side: THREE.DoubleSide })
        const xMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.5), xMaterial)
        xMesh.position.set(-linkSpacingX / 2, linksBaseY, 0)
        xMesh.name = 'social_x'
        xMesh.userData.url = SOCIAL_URLS.x
        doorUI.add(xMesh)

        // Instagram - top right
        const igTexture = createTextTexture('instagram', 48)
        const igMaterial = new THREE.MeshBasicMaterial({ map: igTexture, transparent: true, side: THREE.DoubleSide })
        const igMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.5), igMaterial)
        igMesh.position.set(linkSpacingX / 2, linksBaseY, 0)
        igMesh.name = 'social_instagram'
        igMesh.userData.url = SOCIAL_URLS.instagram
        doorUI.add(igMesh)

        // Bottom row
        // LinkedIn - bottom left
        const liTexture = createTextTexture('linkedin', 48)
        const liMaterial = new THREE.MeshBasicMaterial({ map: liTexture, transparent: true, side: THREE.DoubleSide })
        const liMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.5), liMaterial)
        liMesh.position.set(-linkSpacingX / 2, linksBaseY - linkSpacingY, 0)
        liMesh.name = 'social_linkedin'
        liMesh.userData.url = SOCIAL_URLS.linkedin
        doorUI.add(liMesh)

        // OnlyFans - bottom right
        const ofTexture = createTextTexture('onlyfans', 48)
        const ofMaterial = new THREE.MeshBasicMaterial({ map: ofTexture, transparent: true, side: THREE.DoubleSide })
        const ofMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.5), ofMaterial)
        ofMesh.position.set(linkSpacingX / 2, linksBaseY - linkSpacingY, 0)
        ofMesh.name = 'social_onlyfans'
        ofMesh.userData.url = SOCIAL_URLS.onlyfans
        doorUI.add(ofMesh)

        // "enter" button
        const enterTexture = createTextTexture('enter', 72)
        const enterMaterial = new THREE.MeshBasicMaterial({ 
            map: enterTexture, 
            transparent: true,
            side: THREE.DoubleSide
        })
        const enterGeom = new THREE.PlaneGeometry(3, 1)
        const enterMesh = new THREE.Mesh(enterGeom, enterMaterial)
        enterMesh.position.set(0, -1.5, 0)
        enterMesh.name = 'door_enter'
        doorUI.add(enterMesh)

        state.doorUI = doorUI

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
            resolve()
        })
    })
    })
}
