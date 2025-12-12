import { Vector2 } from 'three'
import type { Shader } from 'three'

export const WhiteOutShader: Shader = {
    name: 'WhiteOutShader',
    uniforms: {
        'tDiffuse': { value: null },
        'tImage': { value: null }, // The k.webp image
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
        uniform sampler2D tImage;
        uniform float time;
        uniform vec2 resolution;
        uniform float fadeAmount;
        varying vec2 vUv;

        void main() {
            vec2 uv = vUv;
            
            // Sample the original texture
            vec3 originalColor = texture2D(tDiffuse, uv).rgb;
            
            // When fadeAmount is high enough, show the image burn effect
            vec3 finalColor;
            
            // Show burned image when fadeAmount is high enough
            if (fadeAmount > 0.85) {
                // Sample the image texture
                vec3 imageColor = texture2D(tImage, uv).rgb;
                
                // Calculate luminance of the image
                float luminance = dot(imageColor, vec3(0.299, 0.587, 0.114));
                
                // Create burn effect: darker parts of image create darker burned areas in white
                // Invert luminance so dark areas become burned (darker)
                float burnAmount = 1.0 - luminance;
                
                // Create burned white - darker areas show more burn
                vec3 burnedWhite = vec3(1.0, 1.0, 1.0) - burnAmount * 0.4; // Burn effect (darker)
                
                // Add subtle color from the image to the burned areas
                vec3 burnColor = mix(burnedWhite, imageColor * 0.3 + burnedWhite * 0.7, 0.6);
                
                if (fadeAmount >= 1.0) {
                    // Fully white - show burned image at peak intensity
                    finalColor = burnColor;
                } else {
                    // Transitioning (0.85-1.0), blend between white and burned image
                    float imageBlend = (fadeAmount - 0.85) / 0.15; // 0 to 1 as fadeAmount goes from 0.85 to 1.0
                    vec3 whiteColor = vec3(1.0, 1.0, 1.0);
                    vec3 blendedWhite = mix(whiteColor, burnColor, imageBlend);
                    finalColor = mix(originalColor, blendedWhite, fadeAmount);
                }
            } else {
                // Normal fade to white
                vec3 whiteColor = vec3(1.0, 1.0, 1.0);
                finalColor = mix(originalColor, whiteColor, fadeAmount);
            }
            
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `
}
