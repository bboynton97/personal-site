/**
 * Terminal Session Management
 * Handles E2B terminal session lifecycle and command execution
 */

const API_BASE = 'http://localhost:8000'
const SESSION_TOKEN_KEY = 'terminal_session_token'
const SESSION_EXPIRY_KEY = 'terminal_session_expiry'

interface SessionResponse {
    session_token: string
    expires_at: string
    expires_in: number
}

interface ExecuteResponse {
    output: string
    exit_code?: number
    error?: string
}

export class TerminalSession {
    private token: string | null = null
    private expiresAt: Date | null = null

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

    async initSession(): Promise<boolean> {
        // Check if already have valid session
        if (this.isSessionValid()) {
            return true
        }

        try {
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

            console.log('Terminal session started:', {
                token: this.token,
                expiresAt: this.expiresAt,
            })

            return true
        } catch (error) {
            console.error('Failed to initialize session:', error)
            return false
        }
    }

    async executeCommand(command: string): Promise<string> {
        if (!this.isSessionValid()) {
            // Try to reinitialize
            const success = await this.initSession()
            if (!success) {
                return 'Error: Could not establish terminal session'
            }
        }

        try {
            const response = await fetch(`${API_BASE}/api/terminal/session/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    session_token: this.token,
                    command: command,
                }),
            })

            if (!response.ok) {
                const error = await response.text()
                throw new Error(error)
            }

            const data: ExecuteResponse = await response.json()

            if (data.error) {
                // Session might be expired
                if (data.error.includes('expired') || data.error.includes('not found')) {
                    this.clearSession()
                    return 'Session expired. Please try again.'
                }
                return `Error: ${data.error}`
            }

            return data.output || ''
        } catch (error) {
            console.error('Command execution failed:', error)
            return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
    }

    async endSession(): Promise<void> {
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
        localStorage.removeItem(SESSION_TOKEN_KEY)
        localStorage.removeItem(SESSION_EXPIRY_KEY)
    }

    isSessionValid(): boolean {
        return !!(this.token && this.expiresAt && this.expiresAt > new Date())
    }

    getSessionToken(): string | null {
        return this.isSessionValid() ? this.token : null
    }
}

// Global singleton instance
export const terminalSession = new TerminalSession()
