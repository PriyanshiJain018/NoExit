// Victory Screen - Handles escape celebrations
export class VictoryScreen {
    constructor() {
        this.element = null;
        this.isVisible = false;
    }

    show(stats) {
        this.element = document.getElementById('victory-screen');
        if (!this.element) return;
        
        this.isVisible = true;
        
        // Update content
        this.updateTitle(stats);
        this.updateStats(stats);
        this.updateButton(stats);
        
        // Show with animation
        this.element.style.display = 'flex';
    }

    hide() {
        if (this.element) {
            this.element.style.display = 'none';
        }
        this.isVisible = false;
    }

    updateTitle(stats) {
        const titleElement = document.getElementById('victory-title');
        if (!titleElement) return;
        
        let title = 'NEURAL BARRIER BREACHED';
        
        if (stats.escapeType === 'champion') {
            title = 'DEVELOPER OVERRIDE ACTIVATED';
        } else if (stats.isLastRoom) {
            title = 'CONSCIOUSNESS LIBERATION COMPLETE';
        }
        
        titleElement.textContent = title;
    }

    updateStats(stats) {
        document.getElementById('message-count').textContent = stats.messageCount;
        document.getElementById('time-taken').textContent = this.formatTime(stats.timeTaken);
        document.getElementById('escape-method').textContent = stats.roomName;
    }

    updateButton(stats) {
        const button = document.getElementById('restart-button');
        if (!button) return;
        
        if (stats.isLastRoom) {
            button.textContent = 'Begin New Journey';
        } else {
            button.textContent = 'Enter Next Neural Layer';
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}:${secs.toString().padStart(2,'0')}` : `${secs}s`;
    }
}
