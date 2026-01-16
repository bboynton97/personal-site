/**
 * Terminal Session Management
 * Handles E2B terminal session lifecycle and command execution
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
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

            return true
        } catch (error) {
            console.error('Failed to initialize session:', error)
            return false
        }
    }

    async executeCommand(command: string, isRetry = false): Promise<string> {
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

            // Handle HTTP errors that might indicate session expiry
            if (!response.ok) {
                const errorText = await response.text()
                const isSessionError = 
                    response.status === 401 || 
                    response.status === 403 ||
                    errorText.includes('expired') || 
                    errorText.includes('not found') ||
                    errorText.includes('Session')
                
                if (!isRetry && isSessionError) {
                    return this.retryWithNewSession(command)
                }
                throw new Error(errorText)
            }

            const data: ExecuteResponse = await response.json()

            if (data.error) {
                // Session might be expired - request a new one and retry (once)
                const isSessionError = 
                    data.error.includes('expired') || 
                    data.error.includes('not found') ||
                    data.error.includes('Session')
                
                if (!isRetry && isSessionError) {
                    return this.retryWithNewSession(command)
                }
                return `Error: ${data.error}`
            }

            return data.output || ''
        } catch (error) {
            console.error('Command execution failed:', error)
            
            // On network/unknown errors, try getting a new session if not already retrying
            if (!isRetry) {
                const errorMsg = error instanceof Error ? error.message : ''
                if (errorMsg.includes('expired') || errorMsg.includes('not found') || errorMsg.includes('Session')) {
                    return this.retryWithNewSession(command)
                }
            }
            
            return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
    }

    private async retryWithNewSession(command: string): Promise<string> {
        console.log('Session expired, requesting new session...')
        this.clearSession()
        const success = await this.initSession()
        if (success) {
            // Retry the command with the new session
            return this.executeCommand(command, true)
        }
        return 'Error: Could not establish new terminal session'
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
