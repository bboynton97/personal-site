import * as THREE from 'three'
import { terminalSession } from '../terminalSession'

// Zalgo text combining characters
const ZALGO_UP = [
    '\u0300', '\u0301', '\u0302', '\u0303', '\u0304', '\u0305', '\u0306', '\u0307',
    '\u0308', '\u0309', '\u030A', '\u030B', '\u030C', '\u030D', '\u030E', '\u030F',
    '\u0310', '\u0311', '\u0312', '\u0313', '\u0314', '\u0315', '\u031A', '\u031B',
    '\u033D', '\u033E', '\u033F', '\u0340', '\u0341', '\u0342', '\u0343', '\u0344',
    '\u0346', '\u034A', '\u034B', '\u034C', '\u0350', '\u0351', '\u0352', '\u0357',
    '\u0358', '\u035B', '\u035D', '\u035E', '\u0360', '\u0361'
]

const ZALGO_DOWN = [
    '\u0316', '\u0317', '\u0318', '\u0319', '\u031C', '\u031D', '\u031E', '\u031F',
    '\u0320', '\u0321', '\u0322', '\u0323', '\u0324', '\u0325', '\u0326', '\u0327',
    '\u0328', '\u0329', '\u032A', '\u032B', '\u032C', '\u032D', '\u032E', '\u032F',
    '\u0330', '\u0331', '\u0332', '\u0333', '\u0339', '\u033A', '\u033B', '\u033C',
    '\u0345', '\u0347', '\u0348', '\u0349', '\u034D', '\u034E', '\u0353', '\u0354',
    '\u0355', '\u0356', '\u0359', '\u035A', '\u035C', '\u035F', '\u0362'
]

const ZALGO_MID = [
    '\u0334', '\u0335', '\u0336', '\u0337', '\u0338', '\u0488', '\u0489'
]

function zalgoify(text: string, intensity: number): string {
    // intensity: 1-10, higher = more chaos
    const upCount = Math.min(Math.floor(intensity * 1.5), 15)
    const downCount = Math.min(Math.floor(intensity * 1.5), 15)
    const midCount = Math.min(Math.floor(intensity * 0.5), 5)
    
    let result = ''
    for (const char of text) {
        result += char
        // Add random combining characters
        for (let i = 0; i < upCount; i++) {
            result += ZALGO_UP[Math.floor(Math.random() * ZALGO_UP.length)]
        }
        for (let i = 0; i < midCount; i++) {
            result += ZALGO_MID[Math.floor(Math.random() * ZALGO_MID.length)]
        }
        for (let i = 0; i < downCount; i++) {
            result += ZALGO_DOWN[Math.floor(Math.random() * ZALGO_DOWN.length)]
        }
    }
    return result
}

// Simple ANSI escape code stripper
function stripAnsi(str: string): string {
    // Remove common ANSI escape sequences
    return str.replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, '')
}

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
    isBackroomsMode: boolean
    backroomsKeystrokeCount: number
    private outputBuffer: string = ''
    private unsubscribeOutput: (() => void) | null = null

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
        this.isBackroomsMode = false
        this.backroomsKeystrokeCount = 0

        // Load Logo
        this.logo = new Image()
        this.logo.src = '/logo.svg'
        this.logo.onload = () => {
            this.draw()
            this.texture.needsUpdate = true
        }
        this.logo.onerror = () => {
            // Silently fail if logo doesn't exist - it's optional
            this.draw()
            this.texture.needsUpdate = true
        }

        this.setupInput()
        this.setupOutputHandler()
        this.draw()
    }

    private setupOutputHandler(): void {
        // Subscribe to terminal output
        this.unsubscribeOutput = terminalSession.onOutput((data: string) => {
            this.handlePtyOutput(data)
        })
    }

    private handlePtyOutput(data: string): void {
        // Add to buffer and process
        this.outputBuffer += data
        
        // Process complete lines from the buffer
        const processedLines = this.outputBuffer.split(/\r?\n/)
        
        // Keep the last incomplete line in the buffer
        this.outputBuffer = processedLines.pop() || ''
        
        // Add complete lines to display
        for (const line of processedLines) {
            const cleanLine = stripAnsi(line)
            if (cleanLine.trim() !== '') {
                this.lines.push(cleanLine)
            }
        }
        
        // Also process any remaining buffer content (for partial lines)
        if (this.outputBuffer.length > 0) {
            // Check for carriage return without newline (overwrites current line)
            if (this.outputBuffer.includes('\r')) {
                const parts = this.outputBuffer.split('\r')
                this.outputBuffer = parts[parts.length - 1]
            }
        }
        
        // Keep history limited
        if (this.lines.length > 14) {
            this.lines = this.lines.slice(this.lines.length - 14)
        }
        
        // Redraw
        this.draw()
        this.texture.needsUpdate = true
    }

    setupInput(): void {
        window.addEventListener('keydown', (e: KeyboardEvent) => {
            if (!this.isFocused) return

            // Backrooms mode: every keystroke prints zalgo ERROR
            if (this.isBackroomsMode) {
                if (e.key.length === 1 || e.key === 'Enter' || e.key === 'Backspace') {
                    this.backroomsKeystrokeCount++
                    // Intensity scales from 1 to 10 based on keystrokes
                    const intensity = Math.min(1 + Math.floor(this.backroomsKeystrokeCount / 3), 10)
                    const errorText = zalgoify('ERROR', intensity)
                    this.lines.push(errorText)
                    
                    // Keep history limited but allow more chaos to build up
                    if (this.lines.length > 20) {
                        this.lines = this.lines.slice(this.lines.length - 20)
                    }
                }
                return
            }

            // Handle special keys for PTY mode
            if (e.key === 'Enter') {
                // Show command locally and send to PTY
                this.lines.push(`> ${this.currentInput}`)
                this.handleCommand(this.currentInput)
                this.currentInput = ''
                e.preventDefault()
            } else if (e.key === 'Backspace') {
                this.currentInput = this.currentInput.slice(0, -1)
                e.preventDefault()
            } else if (e.key === 'Tab') {
                // Send tab for auto-completion
                terminalSession.sendInput('\t')
                e.preventDefault()
            } else if (e.key === 'ArrowUp') {
                // Send up arrow for history
                terminalSession.sendInput('\x1b[A')
                e.preventDefault()
            } else if (e.key === 'ArrowDown') {
                // Send down arrow for history
                terminalSession.sendInput('\x1b[B')
                e.preventDefault()
            } else if (e.key === 'ArrowLeft') {
                terminalSession.sendInput('\x1b[D')
                e.preventDefault()
            } else if (e.key === 'ArrowRight') {
                terminalSession.sendInput('\x1b[C')
                e.preventDefault()
            } else if (e.ctrlKey && e.key === 'c') {
                // Ctrl+C - send interrupt
                terminalSession.sendInput('\x03')
                e.preventDefault()
            } else if (e.ctrlKey && e.key === 'd') {
                // Ctrl+D - EOF
                terminalSession.sendInput('\x04')
                e.preventDefault()
            } else if (e.ctrlKey && e.key === 'l') {
                // Ctrl+L - clear screen
                terminalSession.sendInput('\x0c')
                e.preventDefault()
            } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                this.currentInput += e.key
            }
        })
    }

    setBackroomsMode(enabled: boolean): void {
        this.isBackroomsMode = enabled
        if (enabled) {
            this.backroomsKeystrokeCount = 0
            this.lines = [zalgoify('SYSTEM CORRUPTED', 3)]
            this.currentInput = ''
        }
    }

    async handleCommand(input: string): Promise<void> {
        const cmd = input.trim()

        if (cmd === '') {
            // Keep history limited
            if (this.lines.length > 14) {
                this.lines = this.lines.slice(this.lines.length - 14)
            }
            return
        }

        // Local clear command
        if (cmd === 'clear') {
            this.lines = ['> System cleared.']
            this.outputBuffer = ''
            return
        }

        // Send command to PTY via WebSocket
        // The output will come via the onOutput callback
        terminalSession.sendInput(cmd + '\n')

        // Keep history limited
        if (this.lines.length > 14) {
            this.lines = this.lines.slice(this.lines.length - 14)
        }
    }

    setFocused(focused: boolean): void {
        this.isFocused = focused
        
        // Initialize terminal session when focused for the first time
        if (focused && !terminalSession.isConnected()) {
            terminalSession.initSession().then(success => {
                if (success) {
                    // Replace connecting message
                    const connectingIdx = this.lines.findIndex(l => l.includes('Connecting'))
                    if (connectingIdx >= 0) {
                        this.lines[connectingIdx] = '> Terminal connected!'
                    }
                }
            })
        }
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

        // Connection status indicator
        const isConnected = terminalSession.isConnected()
        ctx.fillStyle = isConnected ? '#00ff00' : '#ff6600'
        ctx.beginPath()
        ctx.arc(canvas.width - 200, 45, 8, 0, Math.PI * 2)
        ctx.fill()

        // Content
        ctx.fillStyle = '#00ff00'
        ctx.font = '24px monospace'
        let y = 100
        this.lines.forEach(line => {
            // Truncate long lines
            const maxChars = 50
            const displayLine = line.length > maxChars ? line.substring(0, maxChars) + '...' : line
            ctx.fillText(displayLine, 40, y)
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

    destroy(): void {
        // Clean up subscription
        if (this.unsubscribeOutput) {
            this.unsubscribeOutput()
            this.unsubscribeOutput = null
        }
    }
}
