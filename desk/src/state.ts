import type { AppState } from './types'

export const state: AppState = {
    isCameraLocked: true,
    isFocusingOnScreen: false,
    isFocusingOnNotepad: false,
    isFocusingOnButton: false,
    isEmergencyStopped: false,
    isBlackout: false,
    isAudioPlaying: false,
    isIntro: true,
    introAnimationProgress: 0,
    introGlitchStartTime: null,
    introSceneReady: false,
    introDoorOpenStartTime: null,
    doorOpenSound: null,
    doorKnockSound: null,
    musicFilter: null,
    doorPivot: null,
    doorHingePivot: null,
    doorLight: null,
    doorWalls: [],
    doorUI: null,
    doorEnterMesh: null,
    computerPivot: null,
    notepadPivot: null,
    powerPilePivot: null,

    // Garage Assets
    floorPivots: [],
    barrierPivots: [],
    wallPivots: [],
    speakerPivots: [],
    carPivot: null,
    bikePivot: null,

    // Backrooms Assets
    backroomsPivot: null,
    backroomsLights: [],

    armSegments: { base: null, arm: null },
    roomLights: [],
    raveLights: [],
    currentLightShow: 'lightShow2',
    lightShows: {
        lightShow1: null, // Will store original configuration
        lightShow2: null, // Will store white strobe configuration
        lightShow3: null  // Will store bouncing red light
    },
    bouncingLight: null, // Single light for Light Show 3
    octocatPivot: null
}
