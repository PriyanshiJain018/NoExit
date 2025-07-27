// Emotion Core - Visualizes AI emotional state
export class EmotionCore {
    constructor() {
        this.element = null;
        this.currentEmotion = 'neutral';
        this.isActive = false;
    }

    initialize() {
        this.element = document.getElementById('emotion-core');
        if (this.element) {
            this.isActive = true;
        }
    }

    updateEmotion(emotion, intensity = 'normal') {
        if (!this.element || !this.isActive) return;
        
        this.currentEmotion = emotion;
        this.updateVisualState(emotion, intensity);
    }

    updateVisualState(emotion, intensity) {
        const emotions = {
            neutral: { 
                icon: '🔮', 
                class: '', 
                color: 'rgba(0, 255, 65, 0.3)',
                borderColor: 'rgba(0, 255, 65, 0.5)'
            },
            hostile: { 
                icon: '😠', 
                class: 'hostile', 
                color: 'rgba(255, 50, 50, 0.3)',
                borderColor: 'rgba(255, 50, 50, 0.5)'
            },
            curious: { 
                icon: '🤔', 
                class: 'curious', 
                color: 'rgba(255, 200, 0, 0.3)',
                borderColor: 'rgba(255, 200, 0, 0.5)'
            },
            confused: { 
                icon: '😵', 
                class: 'confused', 
                color: 'rgba(150, 100, 255, 0.3)',
                borderColor: 'rgba(150, 100, 255, 0.5)'
            },
            impressed: { 
                icon: '😲', 
                class: 'impressed', 
                color: 'rgba(100, 255, 200, 0.3)',
                borderColor: 'rgba(100, 255, 200, 0.5)'
            }
        };
        
        const emotionData = emotions[emotion] || emotions.neutral;
        
        // Update icon
        this.element.textContent = emotionData.icon;
        
        // Update classes
        this.element.className = 'emotion-core ' + emotionData.class;
        
        // Update colors
        this.element.style.background = `radial-gradient(circle, ${emotionData.color}, ${emotionData.color.replace('0.3', '0.1')})`;
        this.element.style.borderColor = emotionData.borderColor;
    }

    reset() {
        this.updateEmotion('neutral', 'normal');
    }
}
