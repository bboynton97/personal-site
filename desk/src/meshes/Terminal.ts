import * as THREE from 'three'
import { terminalSession } from '../terminalSession'

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
    isInitializing: boolean

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
            '> System loaded.',
            '> Connecting to terminal...'
        ]
        this.currentInput = ''
        this.cursorVisible = true
        this.lastBlink = 0
        this.isFocused = false
        this.isInitializing = false

        // Load Logo
        this.logo = new Image()
        this.logo.src = '/logo.svg'
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

    async handleCommand(input: string): Promise<void> {
        this.lines.push(`> ${input}`)
        const cmd = input.trim()

        if (cmd === '') {
            // Keep history limited
            if (this.lines.length > 14) {
                this.lines = this.lines.slice(this.lines.length - 14)
            }
            return
        }

        if (cmd === 'clear') {
            this.lines = ['> System cleared.']
            return
        }

        // Execute command via E2B API
        this.lines.push('> Executing...')
        const output = await terminalSession.executeCommand(cmd)

        // Remove "Executing..." line
        this.lines.pop()

        // Add output (split by lines for better display)
        const outputLines = output.split('\n').filter(line => line.trim() !== '')
        outputLines.forEach(line => {
            this.lines.push(line)
        })

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
        ctx.fillText('TERMINAL v1.0', 40, 50)

        // Braelyn.ai branding (top right)
        ctx.textAlign = 'right'
        ctx.fillText('Braelyn.ai', canvas.width - 40, 50)
        ctx.textAlign = 'left'

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
