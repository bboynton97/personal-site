import { Vector2 } from 'three'
import type { Shader } from 'three'

export const WhiteOutShader: Shader = {
    name: 'WhiteOutShader',
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

        // Color palette function - returns a color based on index
        vec3 getColor(float index) {
            float hue = mod(index * 0.14 + time * 0.15, 1.0);
            float sat = 0.9 + sin(index * 2.1) * 0.1; // Very high saturation
            float val = 0.8 + cos(index * 1.5) * 0.2; // Bright values
            
            // Convert HSV to RGB
            vec3 c = vec3(1.0, 1.0, 1.0);
            vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
            vec3 p = abs(fract(vec3(hue) + K.xyz) * 6.0 - K.www);
            c = val * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), sat);
            return c;
        }

        // Draw a line segment
        float line(vec2 p, vec2 a, vec2 b, float width) {
            vec2 pa = p - a;
            vec2 ba = b - a;
            float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
            float dist = length(pa - ba * h);
            return smoothstep(width, width * 0.5, dist);
        }

        // Generate nested rectangles with perspective
        vec3 generatePattern(vec2 uv) {
            // Start with a light background that will show colored lines
            vec3 color = vec3(0.88, 0.90, 0.92); // Light gray background for contrast
            
            // Center and normalize UV
            vec2 centered = (uv - 0.5) * 2.0;
            float aspect = resolution.x / resolution.y;
            centered.x *= aspect;
            
            // Strong perspective transformation - create vanishing point effect
            float distFromCenter = length(centered);
            float depth = distFromCenter * 0.8;
            vec2 perspective = centered / (1.0 + depth * 3.0);
            
            // Animation - traveling through the structure
            float travel = time * 0.25;
            float zoom = 1.0 + sin(travel * 0.7) * 0.15;
            vec2 animated = perspective * zoom;
            
            // Create dense grid of lines with perspective
            float lineWidth = 0.004; // Even thicker lines for visibility
            
            // Dense horizontal lines with perspective
            for (int i = 0; i < 60; i++) {
                float y = (float(i) / 60.0 - 0.5) * 3.5;
                // Apply perspective - lines get closer together in distance
                float perspectiveY = y / (1.0 + abs(y) * 0.5);
                perspectiveY += sin(travel + float(i) * 0.12) * 0.08;
                
                float dist = abs(animated.y - perspectiveY);
                float lineAlpha = smoothstep(0.006, 0.001, dist);
                
                if (lineAlpha > 0.005) {
                    vec3 lineColor = getColor(float(i) * 0.18 + travel * 0.5);
                    // Make lines very prominent - mix with high opacity
                    color = mix(color, lineColor, lineAlpha * 0.95);
                }
            }
            
            // Dense vertical lines with perspective
            for (int i = 0; i < 60; i++) {
                float x = (float(i) / 60.0 - 0.5) * 3.5 * aspect;
                // Apply perspective
                float perspectiveX = x / (1.0 + abs(x) * 0.5);
                perspectiveX += cos(travel + float(i) * 0.12) * 0.08;
                
                float dist = abs(animated.x - perspectiveX);
                float lineAlpha = smoothstep(0.006, 0.001, dist);
                
                if (lineAlpha > 0.005) {
                    vec3 lineColor = getColor(float(i) * 0.18 + travel * 0.5 + 0.3);
                    // Make lines very prominent
                    color = mix(color, lineColor, lineAlpha * 0.95);
                }
            }
            
            // Add nested rectangles for depth
            float maxSize = 2.5;
            for (int i = 0; i < 18; i++) {
                float layer = float(i);
                float size = maxSize * exp(-layer * 0.18);
                
                if (size < 0.12) break;
                
                // Perspective-adjusted size
                float perspectiveSize = size / (1.0 + distFromCenter * 1.5);
                float halfSize = perspectiveSize * 0.5;
                
                // Rectangle coordinates with slight rotation
                float angle = layer * 0.08 + travel * 0.2;
                float cosA = cos(angle);
                float sinA = sin(angle);
                
                vec2 corners[4];
                corners[0] = vec2(-halfSize, halfSize); // top-left
                corners[1] = vec2(halfSize, halfSize);  // top-right
                corners[2] = vec2(halfSize, -halfSize); // bottom-right
                corners[3] = vec2(-halfSize, -halfSize); // bottom-left
                
                // Rotate corners
                for (int j = 0; j < 4; j++) {
                    float x = corners[j].x;
                    float y = corners[j].y;
                    corners[j].x = x * cosA - y * sinA;
                    corners[j].y = x * sinA + y * cosA;
                }
                
                // Draw rectangle edges
                float lineAlpha = 0.0;
                lineAlpha += line(animated, corners[0], corners[1], lineWidth);
                lineAlpha += line(animated, corners[1], corners[2], lineWidth);
                lineAlpha += line(animated, corners[2], corners[3], lineWidth);
                lineAlpha += line(animated, corners[3], corners[0], lineWidth);
                
                // Get color for this layer
                vec3 layerColor = getColor(layer * 0.35 + travel);
                
                // Blend with existing color - make very visible
                float alpha = clamp(lineAlpha, 0.0, 1.0);
                color = mix(color, layerColor, alpha * 0.95);
            }
            
            return color;
        }

        void main() {
            vec2 uv = vUv;
            
            // Sample the original texture
            vec3 originalColor = texture2D(tDiffuse, uv).rgb;
            
            // When fadeAmount is high enough, show the animated pattern instead of white
            vec3 finalColor;
            
            // Show pattern when fadeAmount is high enough
            if (fadeAmount > 0.85) {
                // Generate the pattern
                vec3 patternColor = generatePattern(uv);
                
                if (fadeAmount >= 1.0) {
                    // Fully white - show pattern directly
                    finalColor = patternColor;
                } else {
                    // Transitioning (0.85-1.0), blend between white and pattern
                    float patternBlend = (fadeAmount - 0.85) / 0.15; // 0 to 1 as fadeAmount goes from 0.85 to 1.0
                    vec3 whiteColor = vec3(1.0, 1.0, 1.0);
                    vec3 blendedWhite = mix(whiteColor, patternColor, patternBlend);
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
