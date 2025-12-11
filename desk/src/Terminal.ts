import * as THREE from 'three'

export class Terminal {
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    texture: THREE.CanvasTexture
    lines: string[]
    currentInput: string
    cursorVisible: boolean
    lastBlink: number
    isFocused: boolean
    logo: HTMLImageElement

    constructor(width = 1024, height = 768) {
        this.canvas = document.createElement('canvas')
        this.canvas.width = width
        this.canvas.height = height
        const ctx = this.canvas.getContext('2d')
        if (!ctx) throw new Error('Could not get 2d context')
        this.ctx = ctx

        this.texture = new THREE.CanvasTexture(this.canvas)
        this.texture.colorSpace = THREE.SRGBColorSpace
        this.texture.flipY = false

        this.lines = [
            '> System initialized...',
            '> Accordion AI loaded.',
            '> Ready for input.'
        ]
        this.currentInput = ''
        this.cursorVisible = true
        this.lastBlink = 0
        this.isFocused = false

        // Load Logo
        this.logo = new Image()
        this.logo.src = '/accordion-wide-logo.svg'
        this.logo.onload = () => {
            this.draw()
            this.texture.needsUpdate = true
        }

        this.setupInput()
        this.draw()
    }

    setupInput(): void {
        window.addEventListener('keydown', (e: KeyboardEvent) => {
            if (!this.isFocused) return

            if (e.key === 'Enter') {
                this.handleCommand(this.currentInput)
                this.currentInput = ''
            } else if (e.key === 'Backspace') {
                this.currentInput = this.currentInput.slice(0, -1)
            } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                this.currentInput += e.key
            }
        })
    }

    handleCommand(input: string): void {
        this.lines.push(`> ${input}`)
        const cmd = input.trim().toLowerCase()

        if (cmd === 'clear') {
            this.lines = ['> System cleared.']
        } else if (cmd === 'help') {
            this.lines.push('> Commands: help, clear, about')
        } else if (cmd === 'about') {
            this.lines.push('> Accordion AI Lab: Building the future.')
        } else if (cmd !== '') {
            this.lines.push(`> Command not found: ${cmd}`)
        }

        // Keep history limited
        if (this.lines.length > 14) {
            this.lines = this.lines.slice(this.lines.length - 14)
        }
    }

    setFocused(focused: boolean): void {
        this.isFocused = focused
    }

    update(): void {
        const time = Date.now()

        // Blink cursor
        if (time - this.lastBlink > 500) {
            this.cursorVisible = !this.cursorVisible
            this.lastBlink = time
        }

        this.draw()
        
        if (this.texture) {
            this.texture.needsUpdate = true
        }
    }

    draw(): void {
        const { ctx, canvas } = this

        // Background
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Header
        ctx.fillStyle = '#00ff00'
        ctx.font = 'bold 32px monospace'
        ctx.fillText('ACCORDION AI TERMINAL v1.0', 40, 50)
        
        // Header Line
        ctx.strokeStyle = '#00ff00'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(40, 60)
        ctx.lineTo(984, 60)
        ctx.stroke()

        // Content
        ctx.font = '24px monospace'
        let y = 100
        this.lines.forEach(line => {
            ctx.fillText(line, 40, y)
            y += 35
        })

        // Input Line
        const inputLine = `> ${this.currentInput}${this.cursorVisible ? '_' : ''}`
        ctx.fillText(inputLine, 40, y)

        // Logo
        if (this.logo.complete && this.logo.naturalWidth !== 0) {
            // Draw logo at top right
            const width = 200 // Slightly smaller to fit header area
            const height = 200
            // Position to align with header
            ctx.drawImage(this.logo, canvas.width - width - 20, -60, width, height)
        }
    }
}
