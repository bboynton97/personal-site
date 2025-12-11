import { Vector2 } from 'three'
import type { Shader } from 'three'

export const CRTTurnOnShader: Shader = {
    name: 'CRTTurnOnShader',
    uniforms: {
        'tDiffuse': { value: null },
        'time': { value: 0 },
        'resolution': { value: new Vector2() },
        'fadeAmount': { value: 0.0 } // 0 = no fade, 1 = fully faded to white
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float time;
        uniform vec2 resolution;
        uniform float fadeAmount;
        varying vec2 vUv;

        void main() {
            vec2 uv = vUv;
            
            // Sample the original texture
            vec3 originalColor = texture2D(tDiffuse, uv).rgb;
            
            // White background
            vec3 whiteColor = vec3(1.0, 1.0, 1.0);
            
            // Fade between original and white
            vec3 finalColor = mix(originalColor, whiteColor, fadeAmount);
            
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `
}
