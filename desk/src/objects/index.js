import { loadDesk } from './Desk.js'
import { loadDeskChair } from './DeskChair.js'
import { loadRoboticArm } from './RoboticArm.js'
import { loadBarrier } from './Barrier.js'
import { loadWall } from './Wall.js'
import { loadFloor } from './Floor.js'
import { loadSpeaker } from './Speaker.js'
import { loadCar } from './Car.js'
import { loadBike } from './Bike.js'
import { loadCocainePile } from './CocainePile.js'
import { loadEmergencyButton } from './EmergencyButton.js'
import { loadBackrooms } from './Backrooms.js'

// Re-export objects that need additional parameters
export { loadComputer } from './Computer.js'
export { loadOscilloscope } from './OscilloscopeObject.js'
export { loadNotepad } from './NotepadObject.js'

// Load all simple objects that only need loader, scene, and state (or just loader and scene)
export function loadSimpleObjects(loader, scene, state) {
    loadDesk(loader, scene)
    loadDeskChair(loader, scene)
    loadRoboticArm(loader, scene, state)
    loadBarrier(loader, scene, state)
    loadWall(loader, scene, state)
    loadFloor(loader, scene, state)
    loadSpeaker(loader, scene, state)
    loadCar(loader, scene, state)
    loadBike(loader, scene, state)
    loadCocainePile(loader, scene)
    loadEmergencyButton(loader, scene, state)
    loadBackrooms(loader, scene, state)
}
