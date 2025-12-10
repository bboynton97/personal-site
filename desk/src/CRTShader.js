import { Vector2 } from 'three';

export const CRTShader = {
    name: 'CRTShader',
    uniforms: {
        'tDiffuse': { value: null },
        'time': { value: 0 },
        'resolution': { value: new Vector2() },
        'vignetteStrength': { value: 1.0 }
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
        uniform float vignetteStrength;
        varying vec2 vUv;

        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        void main() {
            vec2 uv = vUv;

            // Curve the UVs for CRT distortion effect
            vec2 center = vec2(0.5, 0.5);
            vec2 off_center = uv - center;
            off_center *= 1.0 + 0.2 * pow(length(off_center), 2.5); // Distortion amount
            vec2 uv_distorted = center + off_center;

            // Black out out-of-bounds
            if(uv_distorted.x < 0.0 || uv_distorted.x > 1.0 || uv_distorted.y < 0.0 || uv_distorted.y > 1.0) {
                gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
                return;
            }

            // Chromatic Aberration
            float shift = 0.003;
            float r = texture2D(tDiffuse, uv_distorted + vec2(shift, 0.0)).r;
            float g = texture2D(tDiffuse, uv_distorted).g;
            float b = texture2D(tDiffuse, uv_distorted - vec2(shift, 0.0)).b;
            vec3 color = vec3(r, g, b);

            // Scanlines
            float scanlineCount = resolution.y * 0.5; // Dense scanlines
            float scanline = sin(uv_distorted.y * 800.0 + time * 2.0) * 0.05;
            color -= scanline;

            // Noise / Grain
            float noise = random(uv_distorted + time) * 0.15;
            color += noise;

            // Vignette
            float dist = length(uv_distorted - 0.5);
            float vignette = smoothstep(0.6, 0.3, dist);
            color = mix(color, color * vignette, vignetteStrength);

            // Color Grading (Gritty/High Contrast)
            color = pow(color, vec3(1.2)); // Gamma/Contrast
            color *= 1.1; // Brightness boost after darkening

            gl_FragColor = vec4(color, 1.0);
        }
    `
};
