/**
 * Terminal Session Management
 * Handles E2B terminal session lifecycle with WebSocket for interactive PTY
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const WS_BASE = API_BASE.replace(/^http/, 'ws')
const SESSION_TOKEN_KEY = 'terminal_session_token'
const SESSION_EXPIRY_KEY = 'terminal_session_expiry'

interface SessionResponse {
    session_token: string
    expires_at: string
    expires_in: number
}

type OutputCallback = (data: string) => void

export class TerminalSession {
    private token: string | null = null
    private expiresAt: Date | null = null
    private ws: WebSocket | null = null
    private outputCallbacks: Set<OutputCallback> = new Set()
    private reconnectAttempts = 0
    private maxReconnectAttempts = 3
    private isConnecting = false
    private isCreatingSession = false
    private sessionPromise: Promise<boolean> | null = null
    private pendingInput: string[] = []

    constructor() {
        this.loadFromStorage()
    }

    private loadFromStorage(): void {
        const token = localStorage.getItem(SESSION_TOKEN_KEY)
        const expiry = localStorage.getItem(SESSION_EXPIRY_KEY)

        if (token && expiry) {
            const expiresAt = new Date(expiry)
            if (expiresAt > new Date()) {
                this.token = token
                this.expiresAt = expiresAt
            } else {
                // Expired, clear storage
                this.clearSession()
            }
        }
    }

    private saveToStorage(): void {
        if (this.token && this.expiresAt) {
            localStorage.setItem(SESSION_TOKEN_KEY, this.token)
            localStorage.setItem(SESSION_EXPIRY_KEY, this.expiresAt.toISOString())
        }
    }

    /**
     * Register a callback to receive terminal output
     */
    onOutput(callback: OutputCallback): () => void {
        this.outputCallbacks.add(callback)
        return () => this.outputCallbacks.delete(callback)
    }

    private notifyOutput(data: string): void {
        this.outputCallbacks.forEach(cb => {
            try {
                cb(data)
            } catch (e) {
                console.error('Output callback error:', e)
            }
        })
    }

    async initSession(): Promise<boolean> {
        // Check if already have valid session with WebSocket
        if (this.isSessionValid() && this.ws?.readyState === WebSocket.OPEN) {
            return true
        }

        // If we have a valid token but no WebSocket, try to connect
        if (this.isSessionValid() && this.token) {
            return this.connectWebSocket()
        }

        // If already creating a session, wait for that to complete
        if (this.isCreatingSession && this.sessionPromise) {
            console.log('Session creation already in progress, waiting...')
            return this.sessionPromise
        }

        // Create new session
        this.isCreatingSession = true
        this.sessionPromise = this._createSession()
        
        try {
            return await this.sessionPromise
        } finally {
            this.isCreatingSession = false
            this.sessionPromise = null
        }
    }

    private async _createSession(): Promise<boolean> {
        try {
            console.log('Creating new terminal session...')
            const response = await fetch(`${API_BASE}/api/terminal/session/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                throw new Error(`Failed to start session: ${response.statusText}`)
            }

            const data: SessionResponse = await response.json()
            this.token = data.session_token
            this.expiresAt = new Date(data.expires_at)
            this.saveToStorage()
            this.reconnectAttempts = 0

            console.log('Session created, connecting WebSocket...')
            // Connect WebSocket
            return this.connectWebSocket()
        } catch (error) {
            console.error('Failed to initialize session:', error)
            return false
        }
    }

    private connectWebSocket(): Promise<boolean> {
        return new Promise((resolve) => {
            if (!this.token) {
                resolve(false)
                return
            }

            if (this.isConnecting) {
                // Wait for existing connection attempt
                const checkInterval = setInterval(() => {
                    if (!this.isConnecting) {
                        clearInterval(checkInterval)
                        resolve(this.ws?.readyState === WebSocket.OPEN)
                    }
                }, 100)
                return
            }

            this.isConnecting = true

            // Close existing connection if any
            if (this.ws) {
                this.ws.close()
                this.ws = null
            }

            const wsUrl = `${WS_BASE}/api/terminal/ws/${this.token}`
            console.log('Connecting to WebSocket:', wsUrl)

            this.ws = new WebSocket(wsUrl)

            this.ws.onopen = () => {
                console.log('WebSocket connected')
                this.isConnecting = false
                this.reconnectAttempts = 0

                // Send any pending input
                while (this.pendingInput.length > 0) {
                    const input = this.pendingInput.shift()!
                    this.sendInput(input)
                }

                resolve(true)
            }

            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data)
                    if (message.type === 'output') {
                        this.notifyOutput(message.data)
                    } else if (message.type === 'error') {
                        console.error('Terminal error:', message.message)
                        this.notifyOutput(`\r\nError: ${message.message}\r\n`)
                    }
                } catch (e) {
                    console.error('Failed to parse WebSocket message:', e)
                }
            }

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error)
                this.isConnecting = false
            }

            this.ws.onclose = (event) => {
                console.log('WebSocket closed:', event.code, event.reason)
                this.isConnecting = false
                this.ws = null

                // Code 4001 means session not found - clear stale session
                if (event.code === 4001) {
                    console.log('Session expired or invalid, clearing...')
                    this.clearSession()
                    return
                }

                // Auto-reconnect if session still valid and not too many attempts
                if (this.isSessionValid() && this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++
                    console.log(`Reconnecting (attempt ${this.reconnectAttempts})...`)
                    setTimeout(() => {
                        this.connectWebSocket()
                    }, 1000 * this.reconnectAttempts)
                }
            }

            // Timeout for connection
            setTimeout(() => {
                if (this.isConnecting) {
                    this.isConnecting = false
                    if (this.ws?.readyState !== WebSocket.OPEN) {
                        this.ws?.close()
                        resolve(false)
                    }
                }
            }, 5000)
        })
    }

    /**
     * Send input to the terminal (for interactive PTY mode)
     */
    sendInput(data: string): boolean {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            // Queue input for when connection is ready
            this.pendingInput.push(data)
            // Try to reconnect
            if (!this.isConnecting) {
                this.initSession()
            }
            return false
        }

        try {
            this.ws.send(JSON.stringify({ type: 'input', data }))
            return true
        } catch (e) {
            console.error('Failed to send input:', e)
            return false
        }
    }

    /**
     * Resize the terminal
     */
    resize(rows: number, cols: number): boolean {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            return false
        }

        try {
            this.ws.send(JSON.stringify({ type: 'resize', rows, cols }))
            return true
        } catch (e) {
            console.error('Failed to resize:', e)
            return false
        }
    }

    /**
     * Execute a command (sends command + newline for interactive mode)
     */
    async executeCommand(command: string, isRetry = false): Promise<string> {
        // Ensure we have a WebSocket connection
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            const success = await this.initSession()
            if (!success) {
                return 'Error: Could not establish terminal session'
            }
        }

        // In PTY mode, we send the command with a newline
        // The output will come via the onOutput callback
        this.sendInput(command + '\n')
        
        // Return empty - output comes via callback
        return ''
    }

    async endSession(): Promise<void> {
        // Close WebSocket
        if (this.ws) {
            this.ws.close()
            this.ws = null
        }

        if (!this.token) return

        try {
            await fetch(`${API_BASE}/api/terminal/session/end`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    session_token: this.token,
                }),
            })
        } catch (error) {
            console.error('Failed to end session:', error)
        } finally {
            this.clearSession()
        }
    }

    clearSession(): void {
        this.token = null
        this.expiresAt = null
        this.reconnectAttempts = 0
        this.pendingInput = []
        localStorage.removeItem(SESSION_TOKEN_KEY)
        localStorage.removeItem(SESSION_EXPIRY_KEY)
        if (this.ws) {
            this.ws.close()
            this.ws = null
        }
    }

    isSessionValid(): boolean {
        return !!(this.token && this.expiresAt && this.expiresAt > new Date())
    }

    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN
    }

    getSessionToken(): string | null {
        return this.isSessionValid() ? this.token : null
    }
}

// Global singleton instance
export const terminalSession = new TerminalSession()
