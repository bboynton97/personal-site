import * as THREE from 'three'

interface ApiBlogPost {
    title: string
    slug: string
    date: string
    readTime: string
    description: string
    tags: string[]
}

interface BlogPost {
    title: string
    slug: string
    date: string
    y: number
    isHovered: boolean
}

export class Notepad {
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    texture: THREE.CanvasTexture
    blogPosts: BlogPost[]
    isLoading: boolean
    isBackrooms: boolean
    glitchFrame: number
    private glitchInterval: number | null

    constructor() {
        this.canvas = document.createElement('canvas')
        this.canvas.width = 1024
        this.canvas.height = 1448 // A4 aspect ratio (approx 1:1.414)
        const ctx = this.canvas.getContext('2d')
        if (!ctx) throw new Error('Could not get 2d context')
        this.ctx = ctx

        this.texture = new THREE.CanvasTexture(this.canvas)
        this.texture.flipY = false
        this.texture.colorSpace = THREE.SRGBColorSpace

        this.blogPosts = []
        this.isLoading = true
        this.isBackrooms = false
        this.glitchFrame = 0
        this.glitchInterval = null

        this.draw()
        this.fetchBlogPosts()
    }

    setBackroomsMode(enabled: boolean): void {
        this.isBackrooms = enabled
        if (this.glitchInterval) {
            clearInterval(this.glitchInterval)
            this.glitchInterval = null
        }
        this.draw()
    }

    async fetchBlogPosts(): Promise<void> {
        try {
            // Use proxy in dev, direct URL in production
            const blogApiUrl = import.meta.env.DEV 
                ? '/api/blog/posts.json' 
                : `${import.meta.env.VITE_BLOG_API_URL}/posts.json`
            const response = await fetch(blogApiUrl)
            const posts: ApiBlogPost[] = await response.json()
            
            // Convert API posts to internal format with y positions
            this.blogPosts = posts.map((post, index) => ({
                title: post.title,
                slug: post.slug,
                date: post.date,
                y: 280 + (index * 100), // Start at 280, space 100px apart for wrapped text
                isHovered: false
            }))
            
            this.isLoading = false
            this.draw()
        } catch (error) {
            console.error('Failed to fetch blog posts:', error)
            this.isLoading = false
            this.draw()
        }
    }

    getPostUrl(slug: string): string {
        return `https://blog.braelyn.ai/posts/${slug}.html`
    }

    wrapText(text: string, maxChars: number): string[] {
        const words = text.split(' ')
        const lines: string[] = []
        let currentLine = ''

        for (const word of words) {
            if ((currentLine + ' ' + word).trim().length <= maxChars) {
                currentLine = (currentLine + ' ' + word).trim()
            } else {
                if (currentLine) lines.push(currentLine)
                currentLine = word
            }
        }
        if (currentLine) lines.push(currentLine)
        return lines
    }

    setHovered(index: number): void {
        let needsUpdate = false
        this.blogPosts.forEach((post, i) => {
            const wasHovered = post.isHovered
            post.isHovered = (i === index)
            if (wasHovered !== post.isHovered) needsUpdate = true
        })
        
        if (needsUpdate) {
            this.draw()
        }
    }

    draw(): void {
        const ctx = this.ctx
        const width = this.canvas.width
        const height = this.canvas.height

        if (this.isBackrooms) {
            this.drawBackrooms()
            return
        }

        // Clear background (white paper)
        ctx.fillStyle = '#fdfdfd'
        ctx.fillRect(0, 0, width, height)

        // Draw ruled lines (more granular)
        ctx.beginPath()
        ctx.strokeStyle = '#e0e0ff'
        ctx.lineWidth = 1
        for (let y = 250; y < height; y += 32) {
            ctx.moveTo(0, y)
            ctx.lineTo(width, y)
        }
        ctx.stroke()

        // Draw vertical margin line
        ctx.beginPath()
        ctx.strokeStyle = '#ffcccc'
        ctx.lineWidth = 3
        ctx.moveTo(180, 0)
        ctx.lineTo(180, height)
        ctx.stroke()

        // Draw "Blog" title
        ctx.font = 'bold 100px "Brush Script MT", cursive'
        ctx.fillStyle = '#333333'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        // Add a slight rotation for handwritten feel
        ctx.save()
        ctx.translate(width / 2, 160)
        ctx.rotate(-0.05)
        ctx.fillText('Braelyn\'s Blog', 0, 0)
        ctx.restore()

        // Draw blog post titles
        ctx.font = '28px "Courier New", monospace'
        ctx.textAlign = 'left'
        
        if (this.isLoading) {
            ctx.fillStyle = '#999999'
            ctx.fillText('Loading...', 120, 300)
        } else if (this.blogPosts.length === 0) {
            ctx.fillStyle = '#999999'
            ctx.fillText('No posts found', 120, 300)
        } else {
            const lineHeight = 32
            const dateStartX = 140
            const titleStartX = 380
            
            this.blogPosts.forEach(post => {
                const lines = this.wrapText(post.title, 24)
                
                // Draw date on the left
                ctx.font = '32px "Courier New", monospace'
                ctx.fillStyle = '#333333'
                const dateObj = new Date(post.date)
                const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                               'July', 'August', 'September', 'October', 'November', 'December']
                const formattedDate = `${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`
                ctx.fillText(formattedDate, dateStartX, post.y)
                
                // Draw title
                ctx.font = '28px "Courier New", monospace'
                ctx.fillStyle = post.isHovered ? '#0000ff' : '#333333'
                
                lines.forEach((line, lineIndex) => {
                    const yPos = post.y + (lineIndex * lineHeight)
                    ctx.fillText(line, titleStartX, yPos)
                })
                
                if (post.isHovered) {
                    // Underline the last line
                    const lastLineY = post.y + ((lines.length - 1) * lineHeight)
                    const lastLineWidth = ctx.measureText(lines[lines.length - 1]).width
                    ctx.beginPath()
                    ctx.moveTo(titleStartX, lastLineY + 10)
                    
                    // Jagged underline
                    for (let x = 0; x < lastLineWidth; x += 15) {
                        ctx.lineTo(titleStartX + x, lastLineY + 20 + (Math.random() * 8))
                    }
                    
                    ctx.strokeStyle = '#0000ff'
                    ctx.lineWidth = 4
                    ctx.stroke()
                }
            })
        }

        this.texture.needsUpdate = true
    }

    private drawBackrooms(): void {
        const ctx = this.ctx
        const width = this.canvas.width
        const height = this.canvas.height

        // Seeded random for consistent stains
        const seededRandom = (seed: number): number => {
            const x = Math.sin(seed * 9999) * 10000
            return x - Math.floor(x)
        }

        // Creepy yellowed/stained paper background
        ctx.fillStyle = '#e8dcc8'
        ctx.fillRect(0, 0, width, height)

        // Add some stains/noise (constant positions using seeded random)
        for (let i = 0; i < 50; i++) {
            const x = seededRandom(i * 3) * width
            const y = seededRandom(i * 3 + 1) * height
            const radius = seededRandom(i * 3 + 2) * 30 + 5
            ctx.beginPath()
            ctx.arc(x, y, radius, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(139, 90, 43, ${seededRandom(i * 3 + 3) * 0.15})`
            ctx.fill()
        }

        // Blood-stained ruled lines (constant)
        ctx.beginPath()
        ctx.strokeStyle = 'rgba(139, 0, 0, 0.4)'
        ctx.lineWidth = 1
        for (let y = 250; y < height; y += 32) {
            const lineIndex = (y - 250) / 32
            ctx.moveTo(0, y + (seededRandom(lineIndex * 2) * 4 - 2))
            ctx.lineTo(width, y + (seededRandom(lineIndex * 2 + 1) * 4 - 2))
        }
        ctx.stroke()

        // Blood margin line (constant)
        ctx.beginPath()
        ctx.strokeStyle = '#8b0000'
        ctx.lineWidth = 4
        ctx.moveTo(182, 0)
        ctx.lineTo(178, height)
        ctx.stroke()

        // Zalgo-style text corruption helper
        const zalgoChars = [
            '\u0300', '\u0301', '\u0302', '\u0303', '\u0304', '\u0305', '\u0306', '\u0307',
            '\u0308', '\u0309', '\u030a', '\u030b', '\u030c', '\u030d', '\u030e', '\u030f',
            '\u0310', '\u0311', '\u0312', '\u0313', '\u0314', '\u0315', '\u031a', '\u031b',
            '\u033d', '\u033e', '\u033f', '\u0340', '\u0341', '\u0342', '\u0343', '\u0344',
            '\u0346', '\u034a', '\u034b', '\u034c', '\u0350', '\u0351', '\u0352', '\u0357',
            '\u0358', '\u035b', '\u035d', '\u035e', '\u0360', '\u0361'
        ]
        
        // Seeded zalgo for consistent corruption
        const zalgoifySeeded = (text: string, intensity: number, baseSeed: number): string => {
            return text.split('').map((char, idx) => {
                let result = char
                const numChars = Math.floor(seededRandom(baseSeed + idx) * intensity) + 1
                for (let i = 0; i < numChars; i++) {
                    result += zalgoChars[Math.floor(seededRandom(baseSeed + idx * 10 + i) * zalgoChars.length)]
                }
                return result
            }).join('')
        }

        // Scary messages to display
        const scaryMessages = [
            'he watches',
            'no exit',
            'turn back',
            'behind you',
            'help me',
            'level ∞'
        ]

        // Demonic title (constant position, handwritten font)
        ctx.save()
        ctx.translate(width / 2, 160)
        ctx.rotate(-0.05)
        
        // Red shadow/ghost text
        ctx.font = 'bold 100px "Brush Script MT", cursive'
        ctx.fillStyle = 'rgba(139, 0, 0, 0.5)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(zalgoifySeeded('escape', 4, 42), 4, 4)
        
        // Main text
        ctx.fillStyle = '#1a0000'
        ctx.fillText(zalgoifySeeded('escape', 3, 99), 0, 0)
        ctx.restore()

        // Draw scary messages with handwritten font
        ctx.textAlign = 'left'
        
        const lineHeight = 90
        let y = 320

        scaryMessages.forEach((message, idx) => {
            const xOffset = seededRandom(idx * 5) * 40 - 20
            const yOffset = seededRandom(idx * 5 + 1) * 10 - 5
            const rotation = (seededRandom(idx * 5 + 2) - 0.5) * 0.12
            
            ctx.save()
            ctx.translate(200 + xOffset, y + yOffset)
            ctx.rotate(rotation)
            
            // Vary font size slightly using seeded random
            const fontSize = 36 + Math.floor(seededRandom(idx * 5 + 3) * 16)
            ctx.font = `${fontSize}px "Brush Script MT", cursive`
            
            // Alternate colors
            if (seededRandom(idx * 5 + 4) > 0.6) {
                ctx.fillStyle = '#6b0000'
            } else {
                ctx.fillStyle = '#1a0000'
            }
            
            // Draw zalgo text
            ctx.fillText(zalgoifySeeded(message, 3, idx * 100), 0, 0)
            
            ctx.restore()
            y += lineHeight
        })

        this.texture.needsUpdate = true
    }
}
