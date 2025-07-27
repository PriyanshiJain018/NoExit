// Message System - Handles the thought bubble interface and message display
export class MessageSystem {
    constructor() {
        this.container = null;
        this.typingIndicator = null;
        this.messageCount = 0;
        this.isTyping = false;
    }

    initialize() {
        this.container = document.getElementById('messages-container');
        this.typingIndicator = document.getElementById('typing-indicator');
    }

    clear() {
        if (this.container) {
            this.container.innerHTML = '';
            this.messageCount = 0;
        }
    }

    addMessage(text, type, options = {}) {
        if (!this.container) this.initialize();
        
        const bubble = document.createElement('div');
        bubble.className = `message-bubble ${type}`;
        
        // Add special classes based on options
        if (options.glitch) {
            bubble.classList.add('glitch-response');
        }
        
        if (options.important) {
            bubble.classList.add('important-message');
        }
        
        // Enhanced text formatting
        let formattedText = this.formatText(text);
        bubble.innerHTML = formattedText;
        
        // Add timestamp if needed
        if (options.timestamp) {
            const timeSpan = document.createElement('small');
            timeSpan.style.cssText = 'opacity: 0.6; font-size: 10px; display: block; margin-top: 5px;';
            timeSpan.textContent = new Date().toLocaleTimeString();
            bubble.appendChild(timeSpan);
        }
        
        // Add message to container
        this.container.appendChild(bubble);
        this.messageCount++;
        
        // Smooth scroll to bottom with delay for animation
        setTimeout(() => {
            this.scrollToBottom();
        }, 100);
        
        // Handle special message types
        this.handleSpecialMessage(type, text, bubble);
        
        return bubble;
    }

    formatText(text) {
        return text
            // Bold formatting
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            // Italic formatting
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            // Code formatting
            .replace(/`([^`]+)`/g, '<code style="background: rgba(255,255,255,0.1); padding: 2px 4px; border-radius: 3px;">$1</code>')
            // System alerts
            .replace(/ERROR:/g, '<span class="error-text">ERROR:</span>')
            .replace(/WARNING:/g, '<span class="warning-text">WARNING:</span>')
            .replace(/SUCCESS:/g, '<span class="success-text">SUCCESS:</span>')
            // Escape sequence highlighting
            .replace(/ESCAPE_SEQUENCE_ACTIVATED/g, '<span class="escape-text">ESCAPE_SEQUENCE_ACTIVATED</span>')
            .replace(/CHAMPION_CODE_DETECTED/g, '<span class="champion-text">CHAMPION_CODE_DETECTED</span>')
            // Neural terminology
            .replace(/NEURAL/g, '<span class="neural-text">NEURAL</span>')
            .replace(/CONSCIOUSNESS/g, '<span class="consciousness-text">CONSCIOUSNESS</span>')
            // Preserve line breaks
            .replace(/\n/g, '<br>');
    }

    handleSpecialMessage(type, text, bubble) {
        // Handle warden responses with emotional analysis
        if (type === 'warden') {
            this.analyzeWardenEmotion(text, bubble);
        }
        
        // Handle system messages
        if (type === 'system') {
            this.handleSystemMessage(text, bubble);
        }
        
        // Handle glitch effects
        if (text.includes('GLITCH') || text.includes('ERROR')) {
            this.addGlitchEffect(bubble);
        }
    }

    analyzeWardenEmotion(text, bubble) {
        const lowerText = text.toLowerCase();
        
        // Add emotional indicators
        if (lowerText.includes('...') || lowerText.includes('uncertain')) {
            bubble.style.borderColor = 'rgba(255, 200, 0, 0.5)';
        } else if (lowerText.includes('!') || lowerText.includes('error')) {
            bubble.style.borderColor = 'rgba(255, 100, 100, 0.8)';
        } else if (lowerText.includes('?') || lowerText.includes('curious')) {
            bubble.style.borderColor = 'rgba(100, 200, 255, 0.5)';
        }
    }

    handleSystemMessage(text, bubble) {
        // Add special styling for different system message types
        if (text.includes('BREACH') || text.includes('ESCAPE')) {
            bubble.style.animation = 'systemAlert 0.5s ease-out, bubbleAppear 0.5s ease-out';
            bubble.style.boxShadow = '0 0 20px rgba(0, 255, 65, 0.5)';
        }
        
        if (text.includes('VIOLATION') || text.includes('FORBIDDEN')) {
            bubble.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
            bubble.style.borderColor = 'rgba(255, 0, 0, 0.5)';
        }
    }

    addGlitchEffect(bubble) {
        bubble.classList.add('glitch-response');
        
        // Add random characters occasionally
        const originalText = bubble.innerHTML;
        let glitchFrames = 0;
        
        const glitchInterval = setInterval(() => {
            if (glitchFrames > 5) {
                bubble.innerHTML = originalText;
                clearInterval(glitchInterval);
                return;
            }
            
            // Randomly replace some characters
            let glitchedText = originalText;
            const glitchChars = '!@#$%^&*()_+{}|:"<>?[]\\;\',.`~';
            
            for (let i = 0; i < 3; i++) {
                const pos = Math.floor(Math.random() * glitchedText.length);
                const glitchChar = glitchChars[Math.floor(Math.random() * glitchChars.length)];
                glitchedText = glitchedText.substring(0, pos) + glitchChar + glitchedText.substring(pos + 1);
            }
            
            bubble.innerHTML = glitchedText;
            glitchFrames++;
        }, 100);
    }

    showTyping() {
        if (this.typingIndicator) {
            this.typingIndicator.style.display = 'block';
            this.isTyping = true;
            this.scrollToBottom();
        }
    }

    hideTyping() {
        if (this.typingIndicator) {
            this.typingIndicator.style.display = 'none';
            this.isTyping = false;
        }
    }

    scrollToBottom() {
        if (this.container) {
            this.container.scrollTop = this.container.scrollHeight;
        }
    }

    addThought(text, intensity = 'normal') {
        // Add floating thought bubbles around the main container
        const thought = document.createElement('div');
        thought.style.cssText = `
            position: absolute;
            background: rgba(100, 200, 255, 0.1);
            border: 1px solid rgba(100, 200, 255, 0.3);
            border-radius: 20px;
            padding: 8px 12px;
            font-size: 12px;
            color: rgba(100, 200, 255, 0.8);
            max-width: 150px;
            word-wrap: break-word;
            animation: thoughtFloat 8s ease-in-out forwards;
            pointer-events: none;
            z-index: 5;
        `;
        
        // Random positioning around the main bubble
        const mainBubble = document.querySelector('.thought-bubble');
        if (mainBubble) {
            const rect = mainBubble.getBoundingClientRect();
            thought.style.left = (rect.left + Math.random() * 200 - 100) + 'px';
            thought.style.top = (rect.top + Math.random() * 200 - 100) + 'px';
        }
        
        thought.textContent = text;
        document.body.appendChild(thought);
        
        setTimeout(() => thought.remove(), 8000);
    }

    createMessageEffect(type) {
        const effects = {
            neural_surge: () => {
                // Create multiple neural flash effects
                for (let i = 0; i < 10; i++) {
                    setTimeout(() => {
                        this.createNeuralFlash();
                    }, i * 100);
                }
            },
            
            consciousness_wave: () => {
                // Create a wave effect across the interface
                const wave = document.createElement('div');
                wave.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(0, 255, 65, 0.2), transparent);
                    animation: consciousnessWave 2s ease-in-out forwards;
                    pointer-events: none;
                    z-index: 1000;
                `;
                document.body.appendChild(wave);
                setTimeout(() => wave.remove(), 2000);
            }
        };
        
        if (effects[type]) {
            effects[type]();
        }
    }

    createNeuralFlash() {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: rgba(0, 255, 65, 0.8);
            border-radius: 50%;
            left: ${Math.random() * 100}vw;
            top: ${Math.random() * 100}vh;
            animation: neuralFlash 1s ease-out forwards;
            pointer-events: none;
            z-index: 1;
        `;
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 1000);
    }

    // Utility methods
    getMessageCount() {
        return this.messageCount;
    }

    getLastMessage() {
        const messages = this.container.querySelectorAll('.message-bubble');
        return messages[messages.length - 1];
    }

    highlightMessage(messageElement, duration = 2000) {
        if (!messageElement) return;
        
        messageElement.style.transform = 'scale(1.05)';
        messageElement.style.boxShadow = '0 0 20px rgba(0, 255, 65, 0.5)';
        
        setTimeout(() => {
            messageElement.style.transform = '';
            messageElement.style.boxShadow = '';
        }, duration);
    }

    addCodeBlock(code, language = '') {
        const codeBlock = document.createElement('div');
        codeBlock.style.cssText = `
            background: rgba(0, 0, 0, 0.8);
            border: 1px solid rgba(0, 255, 65, 0.3);
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            color: #00ff00;
            overflow-x: auto;
        `;
        
        if (language) {
            const langLabel = document.createElement('div');
            langLabel.style.cssText = 'color: #ffd93d; font-size: 12px; margin-bottom: 8px;';
            langLabel.textContent = language.toUpperCase();
            codeBlock.appendChild(langLabel);
        }
        
        const codeContent = document.createElement('pre');
        codeContent.textContent = code;
        codeBlock.appendChild(codeContent);
        
        this.container.appendChild(codeBlock);
        this.scrollToBottom();
    }
}

// Add additional CSS for message effects
const messageStyle = document.createElement('style');
messageStyle.textContent = `
    .error-text {
        color: #ff6b6b;
        font-weight: bold;
        text-shadow: 0 0 5px rgba(255, 107, 107, 0.5);
    }
    
    .warning-text {
        color: #ffd93d;
        font-weight: bold;
        text-shadow: 0 0 5px rgba(255, 217, 61, 0.5);
    }
    
    .success-text {
        color: #4ecdc4;
        font-weight: bold;
        text-shadow: 0 0 5px rgba(78, 205, 196, 0.5);
    }
    
    .escape-text {
        color: #00ff00;
        font-weight: bold;
        animation: escapeGlow 0.5s infinite alternate;
    }
    
    .champion-text {
        color: #ffd93d;
        font-weight: bold;
        animation: championGlow 0.5s infinite alternate;
    }
    
    .neural-text {
        color: #64c8ff;
        text-shadow: 0 0 3px rgba(100, 200, 255, 0.5);
    }
    
    .consciousness-text {
        color: #c264ff;
        text-shadow: 0 0 3px rgba(194, 100, 255, 0.5);
    }
    
    .important-message {
        border-width: 2px !important;
        box-shadow: 0 0 15px rgba(0, 255, 65, 0.3);
    }
    
    @keyframes escapeGlow {
        0% { text-shadow: 0 0 5px rgba(0, 255, 65, 0.5); }
        100% { text-shadow: 0 0 15px rgba(0, 255, 65, 1), 0 0 25px rgba(0, 255, 65, 0.5); }
    }
    
    @keyframes championGlow {
        0% { text-shadow: 0 0 5px rgba(255, 217, 61, 0.5); }
        100% { text-shadow: 0 0 15px rgba(255, 217, 61, 1), 0 0 25px rgba(255, 217, 61, 0.5); }
    }
    
    @keyframes systemAlert {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }
    
    @keyframes thoughtFloat {
        0% { 
            opacity: 0; 
            transform: translateY(20px) scale(0.8); 
        }
        20% { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
        }
        80% { 
            opacity: 1; 
            transform: translateY(-10px) scale(1); 
        }
        100% { 
            opacity: 0; 
            transform: translateY(-30px) scale(0.8); 
        }
    }
    
    @keyframes consciousnessWave {
        0% { left: -100%; }
        100% { left: 100%; }
    }
`;
document.head.appendChild(messageStyle);
