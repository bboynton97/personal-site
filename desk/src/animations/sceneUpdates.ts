import type { AppState } from '../types'

export function updateScene(state: AppState, time: number): void {
    // Check if in backrooms (used to disable animations)
    const isInBackrooms = state.backroomsPivot && state.backroomsPivot.visible

    // Arm Animation (disabled in backrooms)
    if (state.armSegments.arm && !isInBackrooms) {
        const rawTriangle = (2 / Math.PI) * Math.asin(Math.sin(time * 0.7))
        const clamped = Math.max(-1, Math.min(1, rawTriangle * 1.02))
        state.armSegments.arm.rotation.x = clamped * 0.1
    }

    // Show/hide lights based on active show
    const showRaveLights = state.currentLightShow !== 'lightShow3' && !state.isEmergencyStopped
    state.raveLights.forEach(item => {
        item.light.visible = showRaveLights
    })
    if (state.bouncingLight) {
        state.bouncingLight.visible = state.currentLightShow === 'lightShow3' && !state.isEmergencyStopped
    }

    // Emergency Text Flashing
    if (state.emergencyText) {
        if (state.isFocusingOnButton && !isInBackrooms) {
            state.emergencyText.visible = Math.floor(time * 2) % 2 === 0
        } else {
            state.emergencyText.visible = false
        }
    }

    // Emergency Button Press Animation
    if (state.emergencyButtonTopPivot && state.emergencyButtonPressTime) {
        const elapsed = Date.now() - state.emergencyButtonPressTime
        const pressDuration = 150 // Quick press down in 150ms
        const pressDepth = 0.15 // How far down the top moves (in local units)
        
        if (elapsed < pressDuration) {
            // Ease out for snappy press feel
            const progress = elapsed / pressDuration
            const eased = 1 - Math.pow(1 - progress, 3)
            state.emergencyButtonTopPivot.position.y = -pressDepth * eased
        } else {
            // Keep pressed down
            state.emergencyButtonTopPivot.position.y = -pressDepth
        }
    }
}
