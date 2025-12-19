import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type * as THREE from 'three'
import type { AppState } from '../types'


import { loadDesk } from './Desk'
import { loadDeskChair } from './DeskChair'
import { loadRoboticArm } from './RoboticArm'
import { loadBarrier } from './Barrier'
import { loadWall } from './Wall'
import { loadFloor } from './Floor'
import { loadSpeaker } from './Speaker'
import { loadCar } from './Car'
import { loadBike } from './Bike'
import { loadCocainePile } from './CocainePile'
import { loadEmergencyButton } from './EmergencyButton'
import { loadBackrooms } from './Backrooms'
import { loadGitHubOctocat } from './GitHubOctocat'
// Re-export objects that need additional parameters
export { loadComputer } from './Computer'
export { loadOscilloscope } from './OscilloscopeObject'
export { loadNotepad } from './NotepadObject'
export { loadDoor } from './Door'

// Load all simple objects that only need loader, scene, and state (or just loader and scene)
// Note: Door is loaded separately in main.ts to ensure it loads first
export function loadSimpleObjects(loader: GLTFLoader, scene: THREE.Scene, state: AppState): void {
    loadDesk(loader, scene)
    loadDeskChair(loader, scene)
    loadRoboticArm(loader, scene, state)
    loadBarrier(loader, scene, state)
    loadWall(loader, scene, state)
    loadFloor(loader, scene, state)
    loadSpeaker(loader, scene, state)
    loadCar(loader, scene, state)
    loadBike(loader, scene, state)
    loadCocainePile(loader, scene, state)
    loadEmergencyButton(loader, scene, state)
    loadBackrooms(loader, scene, state)
    loadGitHubOctocat(loader, scene, state)
}
