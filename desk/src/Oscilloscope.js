import * as THREE from 'three';

export class Oscilloscope {
    constructor(width = 512, height = 512) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d');

        this.texture = new THREE.CanvasTexture(this.canvas);
        this.texture.colorSpace = THREE.SRGBColorSpace;
        this.texture.flipY = false;

        this.time = 0;
        this.draw();
    }

    update() {
        this.time += 0.05;
        this.draw();
        
        if (this.texture) {
            this.texture.needsUpdate = true;
        }
    }

    draw() {
        const { ctx, canvas } = this;
        const w = canvas.width;
        const h = canvas.height;

        // Background
        ctx.fillStyle = '#001100';
        ctx.fillRect(0, 0, w, h);

        // Grid
        ctx.strokeStyle = '#003300';
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        const gridSize = 50;
        for (let x = 0; x <= w; x += gridSize) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
        }
        for (let y = 0; y <= h; y += gridSize) {
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
        }
        ctx.stroke();

        // Crosshairs
        ctx.strokeStyle = '#005500';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w / 2, 0);
        ctx.lineTo(w / 2, h);
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();

        // Sine Wave
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 10;
        ctx.beginPath();

        for (let x = 0; x < w; x++) {
            // y = amplitude * sin(frequency * x + phase)
            const normalizedX = x / w;
            const frequency = 4 * Math.PI; // 2 cycles
            const phase = -this.time;
            const amplitude = h / 3;
            
            const y = h / 2 + Math.sin(normalizedX * frequency + phase) * amplitude;

            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();

        // Reset shadow
        ctx.shadowBlur = 0;
    }
}
