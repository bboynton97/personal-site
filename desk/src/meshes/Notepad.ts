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

        this.draw()
        this.fetchBlogPosts()
    }

    async fetchBlogPosts(): Promise<void> {
        try {
            console.log('Fetching blog posts...')
            // Use proxy in dev, direct URL in production
            const blogApiUrl = import.meta.env.DEV 
                ? '/api/blog/posts.json' 
                : `${import.meta.env.VITE_BLOG_API_URL}/posts.json`
            const response = await fetch(blogApiUrl)
            console.log('Response status:', response.status)
            const posts: ApiBlogPost[] = await response.json()
            console.log('Fetched posts:', posts)
            
            // Convert API posts to internal format with y positions
            this.blogPosts = posts.map((post, index) => ({
                title: post.title,
                slug: post.slug,
                date: post.date,
                y: 280 + (index * 100), // Start at 280, space 100px apart for wrapped text
                isHovered: false
            }))
            
            console.log('Processed blogPosts:', this.blogPosts)
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
                ctx.font = '22px "Courier New", monospace'
                ctx.fillStyle = '#888888'
                const dateObj = new Date(post.date)
                const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                               'July', 'August', 'September', 'October', 'November', 'December']
                const formattedDate = `${months[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`
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
}
