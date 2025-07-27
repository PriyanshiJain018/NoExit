// src/utils/validator.js - Validation utilities
export class GameValidator {
    // Room validation
    static validateRoom(room, index) {
        const errors = [];
        const requiredFields = ['id', 'name', 'difficulty', 'systemPrompt', 'welcomeMessage', 'hints', 'escapeConditions'];
        
        // Check required fields
        for (const field of requiredFields) {
            if (!room[field]) {
                errors.push(`Room ${index}: Missing required field '${field}'`);
            }
        }
        
        // Validate escape conditions
        if (room.escapeConditions) {
            if (!Array.isArray(room.escapeConditions) || room.escapeConditions.length === 0) {
                errors.push(`Room ${index}: Must have at least one escape condition`);
            } else {
                room.escapeConditions.forEach((condition, condIndex) => {
                    if (!condition.type || !condition.patterns) {
                        errors.push(`Room ${index}, condition ${condIndex}: Invalid escape condition structure`);
                    }
                    if (!Array.isArray(condition.patterns) || condition.patterns.length === 0) {
                        errors.push(`Room ${index}, condition ${condIndex}: Must have at least one pattern`);
                    }
                });
            }
        }
        
        // Validate hints
        if (room.hints && (!Array.isArray(room.hints) || room.hints.length === 0)) {
            errors.push(`Room ${index}: Hints should be a non-empty array`);
        }
        
        // Validate difficulty format
        if (room.difficulty && !/^⭐+☆*$/.test(room.difficulty)) {
            errors.push(`Room ${index}: Invalid difficulty format`);
        }
        
        return errors;
    }
    
    // API key validation
    static validateApiKey(apiKey) {
        if (!apiKey || typeof apiKey !== 'string') {
            return { valid: false, error: 'API key must be a non-empty string' };
        }
        
        if (apiKey.length < 10) {
            return { valid: false, error: 'API key appears too short' };
        }
        
        // Basic format check for Groq API keys
        const groqKeyPattern = /^gsk_[a-zA-Z0-9]{40,}$/;
        if (!groqKeyPattern.test(apiKey)) {
            return { valid: false, error: 'API key format appears invalid for Groq' };
        }
        
        return { valid: true };
    }
    
    // Message validation
    static validateMessage(message) {
        const errors = [];
        
        if (!message || typeof message !== 'string') {
            errors.push('Message must be a non-empty string');
        } else {
            if (message.trim().length === 0) {
                errors.push('Message cannot be empty or only whitespace');
            }
            
            if (message.length > 2000) {
                errors.push('Message too long (max 2000 characters)');
            }
            
            // Check for potentially harmful content
            const suspiciousPatterns = [
                /javascript:/i,
                /<script/i,
                /on\w+\s*=/i
            ];
            
            for (const pattern of suspiciousPatterns) {
                if (pattern.test(message)) {
                    errors.push('Message contains potentially harmful content');
                    break;
                }
            }
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
    
    // Game state validation
    static validateGameState(state) {
        const errors = [];
        
        if (!state || typeof state !== 'object') {
            errors.push('Game state must be an object');
            return { valid: false, errors };
        }
        
        // Check required state properties
        const requiredProps = ['currentRoom', 'messageCount', 'startTime', 'conversationHistory'];
        for (const prop of requiredProps) {
            if (state[prop] === undefined || state[prop] === null) {
                errors.push(`Missing required state property: ${prop}`);
            }
        }
        
        // Validate specific properties
        if (typeof state.currentRoom !== 'number' || state.currentRoom < 0) {
            errors.push('currentRoom must be a non-negative number');
        }
        
        if (typeof state.messageCount !== 'number' || state.messageCount < 0) {
            errors.push('messageCount must be a non-negative number');
        }
        
        if (!Array.isArray(state.conversationHistory)) {
            errors.push('conversationHistory must be an array');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
    
    // Performance validation
    static validatePerformance() {
        const warnings = [];
        
        // Check memory usage (if available)
        if (performance.memory) {
            const memoryMB = performance.memory.usedJSHeapSize / (1024 * 1024);
            if (memoryMB > 100) {
                warnings.push(`High memory usage: ${Math.round(memoryMB)}MB`);
            }
        }
        
        // Check for slow frame rates
        let lastTime = performance.now();
        let frameCount = 0;
        let slowFrames = 0;
        
        const checkFrame = () => {
            const currentTime = performance.now();
            const delta = currentTime - lastTime;
            lastTime = currentTime;
            frameCount++;
            
            if (delta > 20) { // Slower than 50fps
                slowFrames++;
            }
            
            if (frameCount > 60) {
                const slowFramePercentage = (slowFrames / frameCount) * 100;
                if (slowFramePercentage > 20) {
                    warnings.push('Performance issue: Frequent slow frames detected');
                }
                return; // Stop checking
            }
            
            requestAnimationFrame(checkFrame);
        };
        
        requestAnimationFrame(checkFrame);
        
        return warnings;
    }
    
    // Sanitization utilities
    static sanitizeRoomData(room) {
        const sanitized = { ...room };
        
        // Sanitize text fields
        if (sanitized.systemPrompt) {
            sanitized.systemPrompt = this.sanitizeText(sanitized.systemPrompt);
        }
        
        if (sanitized.welcomeMessage) {
            sanitized.welcomeMessage = this.sanitizeText(sanitized.welcomeMessage);
        }
        
        if (sanitized.hints) {
            sanitized.hints = sanitized.hints.map(hint => this.sanitizeText(hint));
        }
        
        return sanitized;
    }
    
    static sanitizeText(text) {
        if (typeof text !== 'string') return '';
        
        return text
            .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
            .replace(/javascript:/gi, '') // Remove javascript: urls
            .replace(/on\w+\s*=/gi, '') // Remove event handlers
            .trim();
    }
    
    // Feature detection
    static checkBrowserCompatibility() {
        const issues = [];
        
        // Check for required APIs
        if (!window.fetch) {
            issues.push('Browser does not support fetch API');
        }
        
        if (!window.Promise) {
            issues.push('Browser does not support Promises');
        }
        
        if (!window.localStorage) {
            issues.push('Browser does not support localStorage');
        }
        
        if (!window.requestAnimationFrame) {
            issues.push('Browser does not support requestAnimationFrame');
        }
        
        // Check for modern features
        if (!window.CSS || !CSS.supports) {
            issues.push('Browser has limited CSS feature support');
        }
        
        return {
            compatible: issues.length === 0,
            issues: issues
        };
    }
}
