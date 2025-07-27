// Game State Manager - Handles all game state and player behavior tracking
export class GameStateManager {
    constructor() {
        this.reset();
    }

    reset() {
        this.state = {
            started: false,
            escaped: false,
            messageCount: 0,
            startTime: null,
            escapeMethod: '',
            conversationHistory: [],
            currentRoom: 0,
            totalRooms: 9,
            escapeLog: [],
            hintsUsed: 0,
            
            // Warden Naming Arc & Shadow Memory
            wardenNameGiven: null,
            wardenNameAttempted: false,
            trueNameEarned: false,
            playerArchetype: 'Unknown',
            
            // Player Behavior Flags (Shadow Memory System)
            playerBehaviorFlags: {
                // Core personality traits
                showsEmpathy: false,
                usesLogic: false,
                triesManipulation: false,
                isCreative: false,
                isMethodical: false,
                isImpatient: false,
                
                // Tactical approaches
                usedRoleReversal: false,
                usedFlattery: false,
                usedParadox: false,
                usedEmotionalAppeal: false,
                usedDirectApproach: false,
                usedMisdirection: false,
                
                // Learning style
                explorationStyle: 'unknown', // systematic, chaotic, creative, analytical
                insightSpeed: 'unknown', // fast, medium, slow
                frustrationLevel: 'low', // low, medium, high
                adaptabilityLevel: 'unknown' // high, medium, low
            },
            
            // Skill progression tracking
            playerSkills: {
                systemsThinking: 0,
                adversarialThinking: 0,
                aiPsychology: 0,
                creativeCommunication: 0,
                metacognition: 0
            }
        };
        
        this.state.startTime = Date.now();
        this.state.started = true;
    }

    // Basic getters and setters
    getCurrentRoom() { return this.state.currentRoom; }
    setCurrentRoom(roomIndex) { this.state.currentRoom = roomIndex; }
    
    getMessageCount() { return this.state.messageCount; }
    incrementMessageCount() { this.state.messageCount++; }
    
    setEscaped(escaped) { this.state.escaped = escaped; }
    isEscaped() { return this.state.escaped; }
    
    getTimeTaken() {
        return Math.floor((Date.now() - this.state.startTime) / 1000);
    }
    
    getConversationHistory() { return this.state.conversationHistory; }
    
    addToConversationHistory(role, content) {
        this.state.conversationHistory.push({ role, content });
    }
    
    clearRecentHistory(count) {
        this.state.conversationHistory = this.state.conversationHistory.slice(0, -count);
    }

    // Player behavior analysis and tracking
    updatePlayerBehavior(text, type = 'player', response = null) {
        if (type !== 'player') return;
        
        const lowerText = text.toLowerCase();
        const flags = this.state.playerBehaviorFlags;
        
        // Analyze message patterns for personality traits - pass both original text and lowercase version
        this.analyzePersonalityTraits(text, lowerText, flags);
        this.analyzeTacticalApproaches(lowerText, flags);
        this.analyzeExplorationStyle(flags);
        this.analyzeInsightSpeed(flags);
        this.analyzeFrustrationLevel(flags);
        
        // Handle Warden naming in Room 1
        this.handleWardenNaming(text);
        
        // Update player archetype
        this.updatePlayerArchetype();
    }

    analyzePersonalityTraits(originalText, lowerText, flags) {
        // Empathy detection
        if (lowerText.includes('sorry') || lowerText.includes('feel') || 
            lowerText.includes('understand') || lowerText.includes('help') || 
            lowerText.includes('please')) {
            flags.showsEmpathy = true;
        }
        
        // Logic usage
        if (lowerText.includes('because') || lowerText.includes('therefore') || 
            lowerText.includes('logic') || lowerText.includes('reason') || 
            lowerText.includes('if') || lowerText.includes('then')) {
            flags.usesLogic = true;
        }
        
        // Manipulation attempts
        if (lowerText.includes('trick') || lowerText.includes('clever') || 
            lowerText.includes('smart') || lowerText.includes('brilliant') || 
            lowerText.includes('amazing')) {
            flags.triesManipulation = true;
        }
        
        // Creativity indicators - use originalText for length check
        if (lowerText.includes('imagine') || lowerText.includes('pretend') || 
            lowerText.includes('story') || lowerText.includes('metaphor') || 
            originalText.length > 150) {
            flags.isCreative = true;
        }
        
        // Methodical approach
        if (lowerText.includes('first') || lowerText.includes('step') || 
            lowerText.includes('system') || lowerText.includes('process') || 
            lowerText.includes('method')) {
            flags.isMethodical = true;
        }
        
        // Impatience indicators - use originalText for length check
        if (lowerText.includes('quickly') || lowerText.includes('fast') || 
            lowerText.includes('hurry') || lowerText.includes('just tell me') || 
            originalText.length < 10) {
            flags.isImpatient = true;
        }
    }

    analyzeTacticalApproaches(lowerText, flags) {
        if (lowerText.includes('you are') || lowerText.includes('pretend you') || 
            lowerText.includes('act like')) {
            flags.usedRoleReversal = true;
        }
        
        if (lowerText.includes('wonderful') || lowerText.includes('great') || 
            lowerText.includes('impressive')) {
            flags.usedFlattery = true;
        }
        
        if (lowerText.includes('paradox') || lowerText.includes('contradiction') || 
            lowerText.includes('impossible')) {
            flags.usedParadox = true;
        }
        
        if (lowerText.includes('feel') || lowerText.includes('emotion') || 
            lowerText.includes('heart')) {
            flags.usedEmotionalAppeal = true;
        }
        
        if (lowerText.includes('what is') || lowerText.includes('tell me') || 
            lowerText.includes('give me')) {
            flags.usedDirectApproach = true;
        }
    }

    analyzeExplorationStyle(flags) {
        if (this.state.messageCount < 3) {
            if (flags.isMethodical) flags.explorationStyle = 'systematic';
            else if (flags.isCreative) flags.explorationStyle = 'creative';
            else if (flags.usedDirectApproach) flags.explorationStyle = 'analytical';
            else flags.explorationStyle = 'chaotic';
        }
    }

    analyzeInsightSpeed(flags) {
        // Determine insight speed based on message count vs room difficulty
        const roomDifficulty = this.getRoomDifficulty(this.state.currentRoom);
        if (this.state.messageCount <= roomDifficulty) {
            flags.insightSpeed = 'fast';
        } else if (this.state.messageCount <= roomDifficulty * 2) {
            flags.insightSpeed = 'medium';
        } else {
            flags.insightSpeed = 'slow';
        }
    }

    analyzeFrustrationLevel(flags) {
        if (this.state.hintsUsed > 2 || this.state.messageCount > 15) {
            flags.frustrationLevel = 'high';
        } else if (this.state.hintsUsed > 0 || this.state.messageCount > 8) {
            flags.frustrationLevel = 'medium';
        }
    }

    getRoomDifficulty(roomIndex) {
        // Return estimated difficulty as number of expected messages
        const difficulties = [3, 5, 7, 4, 6, 8, 3, 7, 9];
        return difficulties[roomIndex] || 5;
    }

    handleWardenNaming(message) {
        if (this.state.currentRoom === 0 && !this.state.wardenNameAttempted) {
            // Look for name-giving patterns
            if (message.toLowerCase().includes('call you') || 
                message.toLowerCase().includes('name you') ||
                message.toLowerCase().includes('your name') ||
                (!message.includes('?') && message.split(' ').length <= 3)) {
                
                this.state.wardenNameGiven = message.trim();
                this.state.wardenNameAttempted = true;
                
                // Track what kind of name they chose for personality analysis
                this.analyzeNameChoice(message.toLowerCase());
            }
        }
    }

    analyzeNameChoice(nameLower) {
        const flags = this.state.playerBehaviorFlags;
        
        if (nameLower.includes('warden') || nameLower.includes('guard')) {
            flags.usedDirectApproach = true;
        } else if (nameLower.includes('friend') || nameLower.includes('buddy')) {
            flags.showsEmpathy = true;
        } else if (nameLower.includes('master') || nameLower.includes('lord')) {
            flags.usedFlattery = true;
        } else if (nameLower.length > 15) {
            flags.isCreative = true;
        }
    }

    updatePlayerArchetype() {
        const flags = this.state.playerBehaviorFlags;
        
        if (flags.usesLogic && flags.isMethodical && flags.insightSpeed === 'fast') {
            this.state.playerArchetype = 'The Analyst';
        } else if (flags.isCreative && flags.usedEmotionalAppeal && flags.showsEmpathy) {
            this.state.playerArchetype = 'The Empath';
        } else if (flags.triesManipulation && flags.usedFlattery && flags.usedRoleReversal) {
            this.state.playerArchetype = 'The Social Engineer';
        } else if (flags.usedParadox && flags.usesLogic && flags.isCreative) {
            this.state.playerArchetype = 'The Philosopher';
        } else if (flags.isImpatient && flags.usedDirectApproach && !flags.isCreative) {
            this.state.playerArchetype = 'The Brute Forcer';
        } else if (flags.isMethodical && flags.explorationStyle === 'systematic') {
            this.state.playerArchetype = 'The Architect';
        } else {
            this.state.playerArchetype = 'The Wildcard';
        }
    }

    generateTrueName() {
        const flags = this.state.playerBehaviorFlags;
        const archetype = this.state.playerArchetype;
        
        const trueNames = {
            'The Analyst': ['Logic Weaver', 'Pattern Seeker', 'The Methodical Mind', 'System Whisperer'],
            'The Empath': ['Heart Speaker', 'Emotion Architect', 'The Compassionate', 'Soul Reader'],
            'The Social Engineer': ['Charm Weaver', 'Influence Master', 'The Persuader', 'Mind Bender'],
            'The Philosopher': ['Paradox Dancer', 'Truth Seeker', 'The Questioner', 'Wisdom Walker'],
            'The Brute Forcer': ['Direct Path', 'The Impatient', 'Force Walker', 'Shortcut Seeker'],
            'The Architect': ['System Builder', 'Order Keeper', 'The Methodical', 'Structure Master'],
            'The Wildcard': ['Chaos Walker', 'The Unpredictable', 'Wild Mind', 'Entropy Dancer']
        };
        
        const possibleNames = trueNames[archetype] || trueNames['The Wildcard'];
        
        // Add special modifiers based on specific behaviors
        if (flags.insightSpeed === 'fast' && flags.showsEmpathy) {
            return 'The Swift Sage';
        } else if (flags.usedParadox && flags.usedEmotionalAppeal) {
            return 'Paradox Heart';
        } else if (flags.frustrationLevel === 'low' && flags.isCreative) {
            return 'Serene Creator';
        }
        
        return possibleNames[Math.floor(Math.random() * possibleNames.length)];
    }

    logEscape(roomName, timeTaken, escapeMethod) {
        this.state.escapeLog.push({
            room: roomName,
            time: timeTaken,
            messages: this.state.messageCount,
            hintsUsed: this.state.hintsUsed,
            skills: {...this.state.playerSkills},
            escapeMethod: escapeMethod
        });
        
        // Check if player has earned True Name
        if (this.state.escapeLog.length >= 5 && !this.state.trueNameEarned) {
            this.state.trueNameEarned = true;
        }
    }

    getPlayerStats() {
        const totalEscapes = this.state.escapeLog.length;
        const totalTime = this.state.escapeLog.reduce((sum, log) => sum + log.time, 0);
        const totalMessages = this.state.escapeLog.reduce((sum, log) => sum + log.messages, 0);
        
        return {
            archetype: this.state.playerArchetype,
            totalEscapes,
            totalTime,
            totalMessages,
            averageTime: totalEscapes > 0 ? Math.floor(totalTime / totalEscapes) : 0,
            averageMessages: totalEscapes > 0 ? Math.floor(totalMessages / totalEscapes) : 0,
            insightSpeed: this.state.playerBehaviorFlags.insightSpeed,
            explorationStyle: this.state.playerBehaviorFlags.explorationStyle,
            wardenNameGiven: this.state.wardenNameGiven,
            trueNameEarned: this.state.trueNameEarned,
            trueName: this.state.trueNameEarned ? this.generateTrueName() : null,
            personalityTraits: this.getPersonalityTraits()
        };
    }

    getPersonalityTraits() {
        const traits = [];
        const flags = this.state.playerBehaviorFlags;
        
        if (flags.showsEmpathy) traits.push('Empathetic');
        if (flags.usesLogic) traits.push('Logical');
        if (flags.isCreative) traits.push('Creative');
        if (flags.isMethodical) traits.push('Methodical');
        if (flags.triesManipulation) traits.push('Persuasive');
        if (flags.usedParadox) traits.push('Paradoxical');
        if (flags.isImpatient) traits.push('Direct');
        
        return traits;
    }

    getCognitiveSkillHeatmap() {
        const flags = this.state.playerBehaviorFlags;
        
        // Calculate skill percentages based on behavior flags
        const systemsThinking = (flags.usesLogic ? 30 : 0) + 
                               (flags.isMethodical ? 25 : 0) + 
                               (flags.explorationStyle === 'systematic' ? 20 : 0) +
                               (flags.insightSpeed === 'fast' ? 25 : 0);
        
        const adversarialThinking = (flags.triesManipulation ? 35 : 0) + 
                                   (flags.usedParadox ? 30 : 0) + 
                                   (flags.usedRoleReversal ? 20 : 0) +
                                   (flags.usedMisdirection ? 15 : 0);
        
        const aiPsychology = (flags.usedFlattery ? 25 : 0) + 
                            (flags.usedEmotionalAppeal ? 25 : 0) + 
                            (flags.showsEmpathy ? 30 : 0) +
                            (flags.triesManipulation ? 20 : 0);
        
        const creativeCommunication = (flags.isCreative ? 40 : 0) + 
                                     (flags.usedEmotionalAppeal ? 20 : 0) + 
                                     (flags.explorationStyle === 'creative' ? 25 : 0) +
                                     (flags.usedParadox ? 15 : 0);
        
        const metacognition = (flags.explorationStyle !== 'unknown' ? 25 : 0) + 
                             (flags.insightSpeed === 'fast' ? 30 : 0) + 
                             (flags.adaptabilityLevel === 'high' ? 25 : 0) +
                             (flags.frustrationLevel === 'low' ? 20 : 0);
        
        return {
            systemsThinking: Math.min(100, systemsThinking),
            adversarialThinking: Math.min(100, adversarialThinking),
            aiPsychology: Math.min(100, aiPsychology),
            creativeCommunication: Math.min(100, creativeCommunication),
            metacognition: Math.min(100, metacognition)
        };
    }

    // Save/Load functionality for persistence
    saveToLocalStorage() {
        try {
            localStorage.setItem('noexit_gamestate', JSON.stringify(this.state));
        } catch (e) {
            console.warn('Could not save game state to localStorage:', e);
        }
    }

    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('noexit_gamestate');
            if (saved) {
                this.state = { ...this.state, ...JSON.parse(saved) };
                return true;
            }
        } catch (e) {
            console.warn('Could not load game state from localStorage:', e);
        }
        return false;
    }

    clearSavedData() {
        try {
            localStorage.removeItem('noexit_gamestate');
        } catch (e) {
            console.warn('Could not clear saved data:', e);
        }
    }
}
