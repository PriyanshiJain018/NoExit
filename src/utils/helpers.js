// src/utils/helpers.js - General utility functions
export class GameHelpers {
    // Time formatting utilities
    static formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else if (minutes > 0) {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${secs}s`;
        }
    }
    
    static formatTimeShort(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    }
    
    // Text processing utilities
    static truncateText(text, maxLength, suffix = '...') {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - suffix.length) + suffix;
    }
    
    static sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        
        return input
            .trim()
            .substring(0, 2000) // Hard limit
            .replace(/\u0000/g, '') // Remove null bytes
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control characters
    }
    
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Random utilities
    static randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    static randomBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    static shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    // URL and sharing utilities
    static generateShareURL(stats) {
        const baseURL = window.location.origin + window.location.pathname;
        const params = new URLSearchParams({
            room: stats.roomName,
            time: stats.timeTaken,
            messages: stats.messageCount,
            archetype: stats.playerStats?.archetype || 'Unknown'
        });
        return `${baseURL}?share=${btoa(params.toString())}`;
    }
    
    static copyToClipboard(text) {
        return navigator.clipboard.writeText(text).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        });
    }
    
    // Analytics utilities
    static calculateWPM(messageCount, timeInSeconds) {
        const averageWordsPerMessage = 8; // Rough estimate
        const totalWords = messageCount * averageWordsPerMessage;
        const timeInMinutes = timeInSeconds / 60;
        return Math.round(totalWords / timeInMinutes);
    }
    
    static calculateDifficulty(room) {
        if (!room.difficulty) return 1;
        return (room.difficulty.match(/⭐/g) || []).length;
    }
    
    static generateInsight(playerStats) {
        const insights = [
            `Your ${playerStats.archetype} approach shows strong analytical thinking.`,
            `With ${playerStats.insightSpeed} insight speed, you adapt quickly to new challenges.`,
            `Your ${playerStats.explorationStyle} exploration style reveals methodical problem-solving.`,
            `The combination of logic and creativity in your approach is impressive.`
        ];
        
        return GameHelpers.randomChoice(insights);
    }
    
    // Storage utilities
    static saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.warn('Could not save to localStorage:', e);
            return false;
        }
    }
    
    static loadFromLocalStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('Could not load from localStorage:', e);
            return defaultValue;
        }
    }
    
    // Animation utilities
    static createFadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease-in-out`;
        
        setTimeout(() => {
            element.style.opacity = '1';
        }, 10);
        
        return new Promise(resolve => {
            setTimeout(resolve, duration);
        });
    }
    
    static createSlideIn(element, direction = 'up', duration = 300) {
        const transforms = {
            up: 'translateY(20px)',
            down: 'translateY(-20px)',
            left: 'translateX(20px)',
            right: 'translateX(-20px)'
        };
        
        element.style.transform = transforms[direction];
        element.style.opacity = '0';
        element.style.transition = `all ${duration}ms ease-out`;
        
        setTimeout(() => {
            element.style.transform = 'translateY(0)';
            element.style.opacity = '1';
        }, 10);
        
        return new Promise(resolve => {
            setTimeout(resolve, duration);
        });
    }
    
    // Debug utilities
    static debugLog(message, data = null) {
        if (window.location.hostname === 'localhost' || window.location.search.includes('debug=true')) {
            console.log(`[NoExit Debug] ${message}`, data || '');
        }
    }
    
    static createDebugInfo(gameState) {
        return {
            currentRoom: gameState.getCurrentRoom(),
            messageCount: gameState.getMessageCount(),
            playerArchetype: gameState.state.playerArchetype,
            behaviorFlags: gameState.state.playerBehaviorFlags,
            timePlayed: gameState.getTimeTaken()
        };
    }
}
