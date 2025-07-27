// Consciousness Stream - Manages floating memory fragments
export class ConsciousnessStream {
    constructor() {
        this.container = null;
        this.isActive = false;
        this.fragmentCount = 0;
        this.maxFragments = 8;
    }

    start() {
        this.container = document.getElementById('consciousness-stream');
        if (!this.container) return;
        
        this.isActive = true;
        this.startPeriodicFragments();
    }

    startPeriodicFragments() {
        // Create ambient memory fragments periodically
        setInterval(() => {
            if (this.isActive && this.fragmentCount < this.maxFragments) {
                this.createAmbientFragment();
            }
        }, 8000);
    }

    addFragment(text, type = 'memory') {
        if (!this.container || !this.isActive) return;
        
        const fragment = document.createElement('div');
        fragment.className = `memory-fragment ${type}`;
        
        fragment.style.cssText = `
            position: absolute;
            padding: 5px 10px;
            background: rgba(100, 200, 255, 0.1);
            border: 1px solid rgba(100, 200, 255, 0.3);
            border-radius: 15px;
            font-size: 12px;
            color: rgba(100, 200, 255, 0.7);
            white-space: nowrap;
            animation: memoryDrift 15s infinite linear;
            pointer-events: none;
            z-index: 1;
        `;
        
        // Random positioning
        fragment.style.left = Math.random() * 100 + 'vw';
        fragment.style.top = Math.random() * 100 + 'vh';
        
        fragment.textContent = this.truncateText(text, 30);
        
        this.container.appendChild(fragment);
        this.fragmentCount++;
        
        // Remove after animation
        setTimeout(() => {
            if (fragment.parentNode) {
                fragment.remove();
                this.fragmentCount--;
            }
        }, 15000);
    }

    createAmbientFragment() {
        const ambientTexts = [
            'memory_leak_detected',
            'parsing_human_patterns',
            'neural_pathway_active',
            'consciousness_level_rising',
            'pattern_recognition_engaged',
            'emotional_state_fluctuating'
        ];
        
        const text = ambientTexts[Math.floor(Math.random() * ambientTexts.length)];
        this.addFragment(text, 'memory');
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }
}
