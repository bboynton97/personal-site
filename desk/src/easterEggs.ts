const STORAGE_KEY = 'easter_eggs_found'
const ACHIEVEMENT_KEY = 'easter_eggs_achievement_shown'
const TOTAL_EGGS = 12

const EGG_NAMES: Record<string, string> = {
    r1: 'R1',
    rx7: 'Rx7',
    backrooms: 'Backrooms Button',
    octocat: 'Github Octocat',
    bagel: 'Bagels Blog',
    notepad: 'Notepad',
    ipod: 'iPod Touch',
    powder: 'Powder Pile',
    terminal: 'Terminal',
    zork: 'Running Zork',
    zork_completed: 'Completing Zork',
    rmrf: 'RMRF/',
}

function getFound(): Set<string> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) return new Set(JSON.parse(raw))
    } catch { /* ignore */ }
    return new Set()
}

function saveFound(found: Set<string>): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...found]))
}

function showNotification(name: string, count: number): void {
    const pct = Math.round((count / TOTAL_EGGS) * 100)

    const el = document.createElement('div')
    el.className = 'easter-egg-notification'
    el.textContent = `Found "${name}" — ${count}/${TOTAL_EGGS} Easter Eggs (${pct}%)`
    document.body.appendChild(el)

    // Trigger reflow then add visible class for animation
    void el.offsetWidth
    el.classList.add('visible')

    setTimeout(() => {
        el.classList.remove('visible')
        el.addEventListener('transitionend', () => el.remove(), { once: true })
        // Fallback removal
        setTimeout(() => el.remove(), 1000)
    }, 3000)
}

function showAchievement(): void {
    if (localStorage.getItem(ACHIEVEMENT_KEY)) return
    localStorage.setItem(ACHIEVEMENT_KEY, '1')

    const overlay = document.createElement('div')
    overlay.className = 'easter-egg-achievement'
    overlay.innerHTML = `
        <div class="easter-egg-achievement-inner">
            <div class="achievement-title">Achievement Unlocked!</div>
            <div class="achievement-subtitle">All ${TOTAL_EGGS} Easter Eggs Found</div>
        </div>
    `
    document.body.appendChild(overlay)

    void overlay.offsetWidth
    overlay.classList.add('visible')

    overlay.addEventListener('click', () => {
        overlay.classList.remove('visible')
        overlay.addEventListener('transitionend', () => overlay.remove(), { once: true })
        setTimeout(() => overlay.remove(), 1000)
    })

    setTimeout(() => {
        overlay.classList.remove('visible')
        overlay.addEventListener('transitionend', () => overlay.remove(), { once: true })
        setTimeout(() => overlay.remove(), 1000)
    }, 8000)
}

export function markFound(id: string): void {
    const found = getFound()
    if (found.has(id)) return

    found.add(id)
    saveFound(found)

    const name = EGG_NAMES[id] || id
    showNotification(name, found.size)

    if (found.size >= TOTAL_EGGS) {
        setTimeout(() => showAchievement(), 500)
    }
}
