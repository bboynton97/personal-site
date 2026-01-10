import * as THREE from 'three'
import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { AppState } from '../types'

const API_BASE = 'http://localhost:8000'

interface NowPlayingResponse {
    track: string
    artist: string
    album: string
    now_playing: boolean
    url: string
    image: string | null
}

// Fetch last played track from API
async function fetchLastPlayed(): Promise<{ track: string; artist: string } | null> {
    try {
        const response = await fetch(`${API_BASE}/api/lastfm/now-playing`)
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
        }
        const data: NowPlayingResponse = await response.json()
        return {
            track: data.track,
            artist: data.artist
        }
    } catch (error) {
        console.error('Failed to fetch Last.fm data:', error)
    }
    return null
}

// Truncate text to fit width
function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
    if (ctx.measureText(text).width <= maxWidth) return text
    let truncated = text
    while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
        truncated = truncated.slice(0, -1)
    }
    return truncated + '...'
}

// Create the iPod screen texture with track info
function createScreenTexture(track: string = 'loading...', artist: string = ''): THREE.CanvasTexture {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    
    canvas.width = 256
    canvas.height = 192
    
    // Classic iPod blue-ish gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#a8c8e8')
    gradient.addColorStop(1, '#6898c8')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // "Now Playing" header
    ctx.font = 'bold 22px "Chicago", "Geneva", Arial, sans-serif'
    ctx.fillStyle = '#1a1a1a'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('now listening to:', canvas.width / 2, 30)
    
    // Song title (truncate if too long)
    ctx.font = 'bold 26px "Chicago", "Geneva", Arial, sans-serif'
    ctx.fillStyle = '#000000'
    const truncatedTrack = truncateText(ctx, track, canvas.width - 20)
    ctx.fillText(truncatedTrack, canvas.width / 2, 75)
    
    // Artist (truncate if too long)
    ctx.font = '22px "Chicago", "Geneva", Arial, sans-serif'
    ctx.fillStyle = '#333333'
    const truncatedArtist = truncateText(ctx, artist, canvas.width - 20)
    ctx.fillText(truncatedArtist, canvas.width / 2, 115)
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
}

export function loadIpodClassic(loader: GLTFLoader, scene: THREE.Scene, state: AppState): void {
    loader.load('/ipod_classic.glb', (gltf) => {
        const model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        const pivot = new THREE.Group()
        scene.add(pivot)

        model.position.copy(center).negate()
        pivot.add(model)

        // Scale the iPod to a realistic desk size
        const targetHeight = 0.8
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = targetHeight / maxDim
        pivot.scale.set(scale, scale, scale)

        // Position to the left of the notepad (notepad is at x=3, z=1.6)
        // Desk surface is around y=0.5
        pivot.position.set(1.5, 0.05, 1.55)

        // Rotate to lay flat, face up
        pivot.rotation.x = -Math.PI / 2

        model.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true

                // Reduce screen glow by lowering emissive intensity
                if (child.material) {
                    const materials = Array.isArray(child.material) ? child.material : [child.material]
                    materials.forEach(mat => {
                        if (mat instanceof THREE.MeshStandardMaterial && mat.emissive) {
                            mat.emissiveIntensity = 0.2
                        }
                    })
                }
            }
        })

        // Add screen overlay with "now listening" text
        let screenTexture = createScreenTexture()
        const screenMaterial = new THREE.MeshBasicMaterial({
            map: screenTexture,
            side: THREE.DoubleSide
        })
        
        // Create a plane for the screen - use world coordinates for now
        const screenGeometry = new THREE.PlaneGeometry(0.38, 0.28)
        const screenMesh = new THREE.Mesh(screenGeometry, screenMaterial)
        
        // Position directly in world space, at iPod location, facing up
        screenMesh.position.set(1.5, 0.09, 1.34)  // On iPod screen area
        screenMesh.rotation.x = -Math.PI / 2  // Face up
        
        // Add directly to scene
        scene.add(screenMesh)
        state.ipodScreenMesh = screenMesh
        
        // Fetch Last.fm data and update texture
        fetchLastPlayed().then(data => {
            if (data) {
                screenTexture.dispose()
                screenTexture = createScreenTexture(data.track, data.artist)
                screenMaterial.map = screenTexture
                screenMaterial.needsUpdate = true
            }
        })

        state.ipodPivot = pivot
    }, undefined, (error) => {
        console.error('Failed to load ipod_classic.glb. File may not be served correctly by the server:', error)
    })
}

