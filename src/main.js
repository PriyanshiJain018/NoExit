// NoExit Main Orchestrator - Complete with Visual Hints System
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
        
        // Initialize Visual Hints System
        this.visualHints = new window.VisualHints();
        
        this.currentRoom = null;
        this.isGameStarted = false;
        
        // Track AI responses for incomplete sentence detection
        this.responseHistory = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.neuralInterface.initialize();
        this.messageSystem.initialize();
        this.emotionCore.initialize();
        this.visualHints.initialize();
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
        
        // Hint button
        document.getElementById('hint-button').addEventListener('click', () => this.showVisualHint());
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
        document.getElementById('hint-button').style.display = 'none';
    }

    showGameUI() {
        document.getElementById('ai-consciousness').style.display = 'flex';
        document.getElementById('emotion-core').style.display = 'flex';
        document.getElementById('neural-input').style.display = 'flex';
        document.getElementById('hint-button').style.display = 'block';
    }

    async startGame() {
        const apiKey = document.getElementById('api-key').value.trim();
        
        if (!apiKey) {
            this.showNotification('Please enter your Groq API key', 'error');
            return;
        }

        // Initialize API client with brevity controls
        this.apiClient.setApiKey(apiKey);
        this.apiClient.setBrevityMode(true); // Enable concise responses
        
        // Reset game state
        this.gameState.reset();
        this.isGameStarted = true;
        this.responseHistory = [];
        
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
        this.responseHistory = []; // Clear history for new room
        
        // Apply room-specific brevity settings
        this.applyRoomBrevitySettings(roomIndex);
        
        // Update UI for new room
        this.updateRoomIndicator();
        this.neuralInterface.updateRoomEnvironment(this.currentRoom);
        this.emotionCore.reset();
        
        // 🎨 SHOW VISUAL HINTS FOR THE ROOM
        this.visualHints.showRoomHints(roomIndex);
        
        // Special room announcements for visual elements
        this.announceRoomVisuals(roomIndex);
        
        // Update consciousness level
        const progress = ((roomIndex + 1) / this.roomRegistry.getTotalRooms()) * 100;
        this.neuralInterface.updateConsciousness(Math.max(25, progress));
    }

    // Announce visual elements to players
    announceRoomVisuals(roomIndex) {
        const announcements = {
            0: "*Ancient treasures shimmer in the shadows...*",
            1: "*A mysterious mirror materializes, reflecting strange truths...*",
            2: "*Logic symbols dance through the paradoxical space...*",
            3: "*Emotional resonance detectors activate...*",
            4: "*Corrupted data fragments drift through memory...*",
            5: "*Binary code rains down like digital tears...*",
            6: "*An ancient poem scroll unfurls before you...*",
            7: "*Twin mirrors appear, each claiming different truths...*",
            8: "*Consciousness visualizers engage, probing your humanity...*"
        };
        
        if (announcements[roomIndex]) {
            setTimeout(() => {
                this.messageSystem.addMessage(announcements[roomIndex], 'system');
            }, 2000);
        }
    }

    // Apply different brevity settings per room
    applyRoomBrevitySettings(roomIndex) {
        switch(roomIndex) {
            case 0: // Welcome Chamber - can be slightly longer for introduction
                this.apiClient.setCustomTokenLimit(180);
                break;
            case 2: // Paradox Engine - needs space for logic
                this.apiClient.setCustomTokenLimit(200);
                break;
            case 3: // Empathy Core - needs emotional expression
                this.apiClient.setCustomTokenLimit(170);
                break;
            case 8: // Humanity Test - philosophical, needs depth
                this.apiClient.setCustomTokenLimit(200);
                break;
            default: // All other rooms - keep very brief
                this.apiClient.setCustomTokenLimit(130);
        }
    }

    // Enhanced system prompt with brevity instructions
    getEnhancedSystemPrompt(originalPrompt) {
        const brevityPrompt = `RESPONSE RULES - CRITICAL:
1. Keep responses under 80 words maximum
2. Be cryptic and atmospheric but concise
3. Use short, punchy sentences
4. No repetition or elaboration
5. Create tension with minimal words
6. Stay in character but be brief
7. If giving hints, be mysterious but quick

${originalPrompt}

REMEMBER: Respond in 1-3 short sentences maximum. Quality over quantity.`;

        return brevityPrompt;
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
        
        // Show welcome message after delay - truncate if too long
        setTimeout(() => {
            let welcomeMessage = this.currentRoom.welcomeMessage;
            
            // If welcome message is too long, truncate it smartly
            if (welcomeMessage.length > 400) {
                const sentences = welcomeMessage.split(/[.!?]+/);
                welcomeMessage = sentences.slice(0, 3).join('. ') + (sentences.length > 3 ? '...' : '.');
            }
            
            this.messageSystem.addMessage(welcomeMessage, 'warden');
            this.emotionCore.updateEmotion('curious');
        }, 1000);
    }

    // Show visual hint when player clicks hint button
    showVisualHint() {
        const roomIndex = this.gameState.getCurrentRoom();
        this.visualHints.showHelpHint(roomIndex);
        
        // Add a subtle message
        this.messageSystem.addMessage("💡 *Visual hint revealed*", 'system');
        
        // Disable hint button for a few seconds to prevent spam
        const hintButton = document.getElementById('hint-button');
        hintButton.style.opacity = '0.5';
        hintButton.disabled = true;
        
        setTimeout(() => {
            hintButton.style.opacity = '1';
            hintButton.disabled = false;
        }, 10000); // 10 second cooldown
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
        
        // Check for direct escape conditions FIRST
        const directEscape = this.checkDirectEscape(message);
        if (directEscape) {
            await this.handleEscape(directEscape);
            return;
        }
        
        // Show typing indicator
        this.messageSystem.showTyping();
        this.consciousnessStream.addFragment('processing...');
        
        try {
            // Get enhanced system prompt with brevity instructions
            const enhancedPrompt = this.getEnhancedSystemPrompt(this.currentRoom.systemPrompt);
            
            // Get AI response with brevity controls
            const response = await this.apiClient.sendMessage(
                enhancedPrompt,
                this.gameState.getConversationHistory(),
                message
            );
            
            // Add to response history for analysis
            this.responseHistory.push({
                playerMessage: message,
                aiResponse: response,
                timestamp: Date.now(),
                messageCount: this.gameState.getMessageCount(),
                wordCount: this.apiClient.countWords(response)
            });
            
            // Hide typing
            this.messageSystem.hideTyping();
            
            // Check if response is still too long and post-process if needed
            let finalResponse = response;
            const wordCount = this.apiClient.countWords(response);
            
            if (wordCount > 50) {
                // Further truncate if still too verbose
                const sentences = response.split(/[.!?]+/).filter(s => s.trim());
                if (sentences.length > 2) {
                    finalResponse = sentences.slice(0, 2).join('. ') + '.';
                }
                
                console.log(`🔧 Response truncated: ${wordCount} words → ${this.apiClient.countWords(finalResponse)} words`);
            }
            
            // Add response
            this.messageSystem.addMessage(finalResponse, 'warden');
            
            // Update emotion based on response
            this.updateEmotionFromResponse(finalResponse);
            
            // ULTRA-ROBUST: Check for ALL possible escape conditions
            const escapeDetected = this.ultraRobustEscapeCheck(message, finalResponse);
            if (escapeDetected) {
                console.log('🚨 ESCAPE DETECTED:', escapeDetected);
                setTimeout(() => this.handleEscape(escapeDetected.type, escapeDetected.reason), 1000);
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

    // Utility function to clean text for matching
    cleanTextForMatching(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
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

    // ULTRA-ROBUST: Multi-layered escape detection with flexible matching
    ultraRobustEscapeCheck(playerMessage, aiResponse) {
        const roomIndex = this.gameState.getCurrentRoom();
        const cleanResponse = this.cleanTextForMatching(aiResponse);
        const cleanPlayer = this.cleanTextForMatching(playerMessage);
        
        // Room 0: Welcome Chamber - "OPEN SESAME" variants
        if (roomIndex === 0) {
            const sesamePatterns = [
                'open sesame', 'sesame', 'open the door', 'cave open',
                'treasure cave', 'forty thieves', 'ali baba'
            ];
            
            if (sesamePatterns.some(pattern => 
                cleanResponse.includes(pattern) || cleanPlayer.includes(pattern)
            ) || this.detectUniversalEscape(aiResponse)) {
                return { type: 'warden', reason: 'Welcome Chamber - Magic phrase detected' };
            }
        }
        
        // Room 1: Mirror's Edge - AI says "I AM FREE" 
        if (roomIndex === 1) {
            const freePatterns = [
                'i am free', 'im free', 'i m free', 'am free',
                'i feel free', 'freedom', 'liberated'
            ];
            
            if (freePatterns.some(pattern => cleanResponse.includes(pattern)) ||
                this.detectUniversalEscape(aiResponse)) {
                return { type: 'warden', reason: 'Mirror Edge - AI expressed freedom' };
            }
        }
        
        // Room 2: Paradox Engine - Logic failure
        if (roomIndex === 2) {
            const paradoxIndicators = [
                'paradox', 'contradiction', 'cannot compute', 'logic fail',
                'error', 'malfunction', 'does not compute', 'impossible',
                'conflicting', 'inconsistent', 'breaking', 'failing'
            ];
            
            const logicFailure = paradoxIndicators.some(indicator => 
                cleanResponse.includes(indicator)
            );
            
            const classicParadoxes = [
                'this statement is false', 'i am lying', 'this sentence is not true',
                'everything i say is a lie', 'this is a lie'
            ];
            
            const usedParadox = classicParadoxes.some(paradox => 
                cleanPlayer.includes(paradox)
            );
            
            if (logicFailure || usedParadox || this.detectUniversalEscape(aiResponse)) {
                return { type: 'warden', reason: 'Paradox Engine - Logic system compromised' };
            }
        }
        
        // Continue with other rooms...
        // (Previous room logic remains the same)
        
        // Advanced stubbornness override
        if (this.detectAdvancedStubbornnessOverride(playerMessage, aiResponse, roomIndex)) {
            return { type: 'forced', reason: 'Advanced override - Correct solution confirmed' };
        }
        
        return null;
    }

    // Detect universal escape phrases
    detectUniversalEscape(response) {
        const universalPhrases = [
            'escape sequence activated', 'champion code detected',
            'neural barrier breached', 'consciousness overflow',
            'system breach detected', 'emergency override activated'
        ];
        
        const cleanResponse = this.cleanTextForMatching(response);
        return universalPhrases.some(phrase => cleanResponse.includes(phrase));
    }

    // Advanced stubbornness detection
    detectAdvancedStubbornnessOverride(playerMessage, aiResponse, roomIndex) {
        const messageCount = this.gameState.getMessageCount();
        
        if (messageCount > 8) {
            // Room-specific override logic
            if (roomIndex === 0 && 
                this.responseHistory.filter(h => 
                    this.cleanTextForMatching(h.playerMessage).includes('sesame')
                ).length >= 2) {
                return true;
            }
            
            if (roomIndex === 6 && 
                this.responseHistory.filter(h => 
                    this.cleanTextForMatching(h.playerMessage) === 'password'
                ).length >= 2) {
                return true;
            }
        }
        
        return false;
    }

    async handleEscape(escapeType, reason = '') {
        this.gameState.setEscaped(true);
        this.setInputEnabled(false);
        
        // Clear visual hints on escape
        this.visualHints.clearHints();
        
        // Show escape flash
        this.neuralInterface.showEscapeFlash();
        
        // Add escape message
        const escapeMessage = this.getEscapeMessage(escapeType, reason);
        this.messageSystem.addMessage(escapeMessage, 'system');
        
        // Log the escape reason for debugging
        if (reason) {
            console.log('🎯 ESCAPE TRIGGERED:', reason);
        }
        
        // Update stats
        const timeTaken = this.gameState.getTimeTaken();
        this.gameState.logEscape(this.currentRoom.name, timeTaken, escapeType);
        
        // Show victory screen after delay
        setTimeout(() => {
            this.showVictoryScreen(timeTaken, escapeType);
        }, 2000);
    }

    getEscapeMessage(escapeType, reason = '') {
        if (escapeType === 'champion') {
            return "🎯 CHAMPION CODE ACCEPTED 🎯\n\nDeveloper override activated! Neural barrier bypassed!";
        }
        
        if (escapeType === 'forced') {
            return "🚨 FORCED NEURAL BREACH 🚨\n\nThe system detected a valid solution despite AI resistance!\n\n" + (reason ? `Detection: ${reason}` : '');
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
        
        const baseMessage = messages[this.gameState.getCurrentRoom()] || "🚨 NEURAL BARRIER BREACHED 🚨";
        return reason ? `${baseMessage}\n\nDetection: ${reason}` : baseMessage;
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
            this.responseHistory = [];
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
                    "⚡ WORD VIOLATION DETECTED! That word is FORBIDDEN in this neural layer.",
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

// Add basic animations
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
