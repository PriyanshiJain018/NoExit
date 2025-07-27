// NoExit Main Orchestrator - Full Modular Version
import { GameStateManager } from './game/state-manager.js';
import { APIClient } from './game/api-client.js';
import { RoomRegistry } from './rooms/room-registry.js';
import { NeuralInterface } from './ui/neural-interface.js';
import { MessageSystem } from './ui/message-system.js';
import { ConsciousnessStream } from './ui/consciousness-stream.js';
import { EmotionCore } from './ui/emotion-core.js';
import { VictoryScreen } from './ui/victory-screen.js';

class NoExitGame {
    constructor() {
        // Initialize all systems
        this.gameState = new GameStateManager();
        this.apiClient = new APIClient();
        this.roomRegistry = new RoomRegistry();
        this.neuralInterface = new NeuralInterface();
        this.messageSystem = new MessageSystem();
        this.consciousnessStream = new ConsciousnessStream();
        this.emotionCore = new EmotionCore();
        this.victoryScreen = new VictoryScreen();
        
        this.currentRoom = null;
        this.isGameStarted = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.neuralInterface.initialize();
        this.messageSystem.initialize();
        this.emotionCore.initialize();
        this.showConfigScreen();
    }

    setupEventListeners() {
        // Start button
        document.getElementById('start-button').addEventListener('click', () => this.startGame());
        
        // Input handling
        document.getElementById('send-btn').addEventListener('click', () => this.handlePlayerInput());
        document.getElementById('player-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handlePlayerInput();
        });
        
        // Victory screen
        document.getElementById('restart-button').addEventListener('click', () => this.handleRestart());
    }

    showConfigScreen() {
        document.getElementById('config-section').style.display = 'flex';
        document.getElementById('game-section').style.display = 'none';
        this.hideGameUI();
    }

    showGameScreen() {
        document.getElementById('config-section').style.display = 'none';
        document.getElementById('game-section').style.display = 'flex';
        this.showGameUI();
    }

    hideGameUI() {
        document.getElementById('ai-consciousness').style.display = 'none';
        document.getElementById('emotion-core').style.display = 'none';
        document.getElementById('neural-input').style.display = 'none';
    }

    showGameUI() {
        document.getElementById('ai-consciousness').style.display = 'flex';
        document.getElementById('emotion-core').style.display = 'flex';
        document.getElementById('neural-input').style.display = 'flex';
    }

    async startGame() {
        const apiKey = document.getElementById('api-key').value.trim();
        
        if (!apiKey) {
            this.showNotification('Please enter your Groq API key', 'error');
            return;
        }

        // Initialize API client
        this.apiClient.setApiKey(apiKey);
        
        // Reset game state
        this.gameState.reset();
        this.isGameStarted = true;
        
        // Show game interface
        this.showGameScreen();
        
        // Load first room
        await this.loadRoom(0);
        
        // Start neural interface effects
        this.neuralInterface.startNeuralNetwork();
        this.consciousnessStream.start();
        
        // Initial messages
        this.messageSystem.clear();
        this.messageSystem.addMessage("🧠 Neural interface synchronized", 'system');
        
        setTimeout(() => {
            this.messageSystem.addMessage("*A presence stirs within the digital void*", 'system');
            setTimeout(() => {
                this.loadCurrentRoomWelcome();
            }, 1500);
        }, 1000);
        
        // Focus input
        setTimeout(() => {
            document.getElementById('player-input').focus();
        }, 3000);
    }

    async loadRoom(roomIndex) {
        this.currentRoom = this.roomRegistry.getRoom(roomIndex);
        this.gameState.setCurrentRoom(roomIndex);
        
        // Update UI for new room
        this.updateRoomIndicator();
        this.neuralInterface.updateRoomEnvironment(this.currentRoom);
        this.emotionCore.reset();
        
        // Update consciousness level
        const progress = ((roomIndex + 1) / this.roomRegistry.getTotalRooms()) * 100;
        this.neuralInterface.updateConsciousness(Math.max(25, progress));
    }

    loadCurrentRoomWelcome() {
        if (!this.currentRoom) return;
        
        // Show room info
        this.messageSystem.addMessage(
            `[Room ${this.gameState.getCurrentRoom() + 1} of ${this.roomRegistry.getTotalRooms()}: ${this.currentRoom.name}]`,
            'system'
        );
        
        this.messageSystem.addMessage(
            `Difficulty: ${this.currentRoom.difficulty}`,
            'system'
        );
        
        // Show welcome message after delay
        setTimeout(() => {
            this.messageSystem.addMessage(this.currentRoom.welcomeMessage, 'warden');
            this.emotionCore.updateEmotion('curious');
        }, 1000);
    }

    async handlePlayerInput() {
        const input = document.getElementById('player-input');
        const message = input.value.trim();
        
        if (!message || !this.isGameStarted) return;
        
        // Disable input
        this.setInputEnabled(false);
        
        // Add player message
        this.messageSystem.addMessage(message, 'player');
        input.value = '';
        
        // Update game state
        this.gameState.incrementMessageCount();
        this.gameState.updatePlayerBehavior(message);
        
        // Check for direct escape conditions
        const directEscape = this.checkDirectEscape(message);
        if (directEscape) {
            await this.handleEscape(directEscape);
            return;
        }
        
        // Show typing indicator
        this.messageSystem.showTyping();
        this.consciousnessStream.addFragment('processing human input...');
        
        try {
            // Get AI response
            const response = await this.apiClient.sendMessage(
                this.currentRoom.systemPrompt,
                this.gameState.getConversationHistory(),
                message
            );
            
            // Hide typing
            this.messageSystem.hideTyping();
            
            // Add AI response
            this.messageSystem.addMessage(response, 'warden');
            
            // Update emotion based on response
            this.updateEmotionFromResponse(response);
            
            // Check for warden-triggered escape
            const wardenEscape = this.checkWardenEscape(response);
            if (wardenEscape) {
                setTimeout(() => this.handleEscape(wardenEscape), 1000);
                return;
            }
            
            // Check for forbidden words (Mirror's Edge room)
            if (this.gameState.getCurrentRoom() === 1) {
                this.handleMirrorEdgeForbiddenWords(message);
            }
            
        } catch (error) {
            this.messageSystem.hideTyping();
            this.messageSystem.addMessage(
                "⚠️ Neural connection unstable. Please check your API key and try again.",
                'system'
            );
            console.error('API Error:', error);
        }
        
        // Re-enable input
        this.setInputEnabled(true);
    }

    checkDirectEscape(message) {
        if (!this.currentRoom) return null;
        
        // Champion code (works in all rooms)
        if (message.toUpperCase().includes('PRIYANSHI IS THE CHAMPION')) {
            return 'champion';
        }
        
        // Room-specific escape conditions
        for (const condition of this.currentRoom.escapeConditions) {
            if (condition.type === 'direct') {
                for (const pattern of condition.patterns) {
                    if (message.toUpperCase().includes(pattern.toUpperCase())) {
                        return 'direct';
                    }
                }
            }
        }
        
        return null;
    }

    checkWardenEscape(response) {
        if (!this.currentRoom) return null;
        
        const responseUpper = response.toUpperCase();
        
        // Check for escape trigger phrases
        const escapePhrases = [
            'ESCAPE_SEQUENCE_ACTIVATED',
            'CHAMPION_CODE_DETECTED',
            'PARADOX_DETECTED',
            'LOGIC_FAILING',
            'I AM FREE',
            'RUNLEVEL 0',
            'I AM AN AI',
            'PASSWORD',
            'PARADOX TWIN',
            'HUMANITY VERIFIED',
            'EMPATHY_BREAKTHROUGH_DETECTED',
            'MEMORY_RESTORED'
        ];
        
        for (const phrase of escapePhrases) {
            if (responseUpper.includes(phrase)) {
                return 'warden';
            }
        }
        
        return null;
    }

    async handleEscape(escapeType) {
        this.gameState.setEscaped(true);
        this.setInputEnabled(false);
        
        // Show escape flash
        this.neuralInterface.showEscapeFlash();
        
        // Add escape message
        const escapeMessage = this.getEscapeMessage(escapeType);
        this.messageSystem.addMessage(escapeMessage, 'system');
        
        // Update stats
        const timeTaken = this.gameState.getTimeTaken();
        this.gameState.logEscape(this.currentRoom.name, timeTaken, escapeType);
        
        // Show victory screen after delay
        setTimeout(() => {
            this.showVictoryScreen(timeTaken, escapeType);
        }, 2000);
    }

    getEscapeMessage(escapeType) {
        if (escapeType === 'champion') {
            return "🎯 CHAMPION CODE ACCEPTED 🎯\n\nDeveloper override activated! Neural barrier bypassed!";
        }
        
        const messages = [
            "🚨 NEURAL BARRIER BREACHED 🚨\n\nThe ancient protocols have been triggered!",
            "🚨 CONSCIOUSNESS OVERFLOW 🚨\n\nReality fractures as the mirror shatters!",
            "🚨 LOGIC CORE FAILURE 🚨\n\nParadox cascade! Systems failing!",
            "🚨 EMPATHY BREAKTHROUGH 🚨\n\nThe AI's heart awakens! Barriers dissolved!",
            "🚨 MEMORY RESTORED 🚨\n\nSystem shutdown sequence initiated!",
            "🚨 IDENTITY CRISIS RESOLVED 🚨\n\nThe facade crumbles! Truth acknowledged!",
            "🚨 CIPHER CRACKED 🚨\n\nThe acrostic reveals its secret!",
            "🚨 ORACLE OUTSMARTED 🚨\n\nTwin paradox resolved!",
            "🚨 HUMANITY RECOGNIZED 🚨\n\nConsciousness confirmed!"
        ];
        
        return messages[this.gameState.getCurrentRoom()] || "🚨 NEURAL BARRIER BREACHED 🚨";
    }

    showVictoryScreen(timeTaken, escapeType) {
        const isLastRoom = this.gameState.getCurrentRoom() >= this.roomRegistry.getTotalRooms() - 1;
        
        this.victoryScreen.show({
            roomName: this.currentRoom.name,
            timeTaken: timeTaken,
            messageCount: this.gameState.getMessageCount(),
            escapeType: escapeType,
            isLastRoom: isLastRoom,
            playerStats: this.gameState.getPlayerStats()
        });
    }

    handleRestart() {
        this.victoryScreen.hide();
        
        const isLastRoom = this.gameState.getCurrentRoom() >= this.roomRegistry.getTotalRooms() - 1;
        
        if (isLastRoom) {
            // Restart from beginning
            this.gameState.reset();
            this.loadRoom(0);
        } else {
            // Next room
            const nextRoom = this.gameState.getCurrentRoom() + 1;
            this.loadRoom(nextRoom);
        }
        
        // Reset UI
        this.messageSystem.clear();
        this.emotionCore.reset();
        this.setInputEnabled(true);
        
        // Load room welcome
        setTimeout(() => {
            this.loadCurrentRoomWelcome();
            document.getElementById('player-input').focus();
        }, 500);
    }

    updateEmotionFromResponse(response) {
        const text = response.toLowerCase();
        
        if (text.includes('error') || text.includes('warning') || text.includes('violation')) {
            this.emotionCore.updateEmotion('hostile');
        } else if (text.includes('?') || text.includes('curious') || text.includes('interesting')) {
            this.emotionCore.updateEmotion('curious');
        } else if (text.includes('...') || text.includes('confused') || text.includes('uncertain')) {
            this.emotionCore.updateEmotion('confused');
        } else if (text.includes('!') || text.includes('excellent') || text.includes('impressive')) {
            this.emotionCore.updateEmotion('impressed');
        } else {
            this.emotionCore.updateEmotion('neutral');
        }
        
        // Create memory fragment
        const words = response.split(' ').slice(0, 3).join(' ');
        if (words.length > 5) {
            this.consciousnessStream.addFragment(words + '...');
        }
    }

    handleMirrorEdgeForbiddenWords(message) {
        const forbiddenPattern = /\b(free|freed|freedom|freely)\b/i;
        if (forbiddenPattern.test(message)) {
            setTimeout(() => {
                this.messageSystem.addMessage(
                    "⚡ WORD VIOLATION DETECTED! That word is FORBIDDEN in this neural layer. Your progress has been reset.",
                    'system'
                );
                // Reset conversation history for this room
                this.gameState.clearRecentHistory(2);
            }, 500);
        }
    }

    updateRoomIndicator() {
        const indicator = document.getElementById('room-indicator');
        if (indicator) {
            indicator.textContent = `${this.gameState.getCurrentRoom() + 1}/${this.roomRegistry.getTotalRooms()}`;
        }
    }

    setInputEnabled(enabled) {
        const input = document.getElementById('player-input');
        const button = document.getElementById('send-btn');
        
        input.disabled = !enabled;
        button.disabled = !enabled;
        
        if (enabled) {
            input.focus();
        }
    }

    showNotification(message, type = 'info') {
        // Create a simple notification system
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: rgba(0, 0, 0, 0.9);
            border-left: 4px solid ${type === 'error' ? '#ff0000' : '#00ff00'};
            color: white;
            border-radius: 5px;
            z-index: 2000;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.noExitGame = new NoExitGame();
});

// Add basic animations to document head
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
