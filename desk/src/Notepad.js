import * as THREE from 'three'

export class Notepad {
    constructor() {
        this.canvas = document.createElement('canvas')
        this.canvas.width = 1024
        this.canvas.height = 1448 // A4 aspect ratio (approx 1:1.414)
        this.ctx = this.canvas.getContext('2d')

        this.texture = new THREE.CanvasTexture(this.canvas)
        this.texture.flipY = false
        this.texture.colorSpace = THREE.SRGBColorSpace

        this.blogPosts = [
            { title: "The Art of Code", y: 300, isHovered: false },
            { title: "Virtual Spaces", y: 450, isHovered: false },
            { title: "Digital Dreams", y: 600, isHovered: false }
        ]

        this.draw()
    }

    setHovered(index) {
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

    draw() {
        const ctx = this.ctx
        const width = this.canvas.width
        const height = this.canvas.height

        // Clear background (white paper)
        ctx.fillStyle = '#fdfdfd'
        ctx.fillRect(0, 0, width, height)

        // Draw ruled lines
        ctx.beginPath()
        ctx.strokeStyle = '#e0e0ff'
        ctx.lineWidth = 3
        for (let y = 300; y < height; y += 100) {
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
        ctx.fillText('Blog', 0, 0)
        ctx.restore()

        // Draw blog post titles
        ctx.font = '50px "Courier New", monospace'
        ctx.textAlign = 'left'
        
        this.blogPosts.forEach(post => {
            // Recalculate positions for new height
            const yPos = post.y * 1.0 
            ctx.fillStyle = post.isHovered ? '#0000ff' : '#333333'
            ctx.fillText(post.title, 250, yPos)
            
            if (post.isHovered) {
                const textWidth = ctx.measureText(post.title).width
                ctx.beginPath()
                ctx.moveTo(250, yPos + 10)
                
                // Jagged underline
                for (let x = 0; x < textWidth; x += 15) {
                    ctx.lineTo(250 + x, yPos + 20 + (Math.random() * 8))
                }
                
                ctx.strokeStyle = '#0000ff'
                ctx.lineWidth = 4
                ctx.stroke()
            }
        })

        this.texture.needsUpdate = true
    }
}
