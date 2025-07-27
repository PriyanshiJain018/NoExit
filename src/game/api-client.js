// API Client for Groq communication - Enhanced with brevity controls
export class APIClient {
    constructor() {
        this.apiKey = null;
        this.baseURL = 'https://api.groq.com/openai/v1/chat/completions';
        this.model = 'llama-3.1-8b-instant';
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 second
        
        // Response length controls
        this.maxTokens = 150; // Reduced from 500 to keep responses concise
        this.brevityMode = true;
    }

    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    // Enable/disable brevity mode
    setBrevityMode(enabled) {
        this.brevityMode = enabled;
        this.maxTokens = enabled ? 150 : 300;
    }

    async sendMessage(systemPrompt, conversationHistory, userMessage) {
        if (!this.apiKey) {
            throw new Error('API key not set');
        }

        // Enhance system prompt with brevity instructions
        const enhancedSystemPrompt = this.addBrevityInstructions(systemPrompt);

        // Build the messages array
        const messages = [
            {
                role: "system",
                content: enhancedSystemPrompt
            },
            ...conversationHistory,
            {
                role: "user",
                content: userMessage
            }
        ];

        // Add user message to history for next call
        conversationHistory.push({
            role: "user", 
            content: userMessage
        });

        let lastError = null;
        
        // Retry logic
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                const response = await this.makeAPICall(messages);
                let aiResponse = response.choices[0].message.content;
                
                // Post-process response for brevity if needed
                if (this.brevityMode) {
                    aiResponse = this.ensureBrevity(aiResponse);
                }
                
                // Add AI response to history
                conversationHistory.push({
                    role: "assistant",
                    content: aiResponse
                });
                
                return aiResponse;
                
            } catch (error) {
                lastError = error;
                console.warn(`API call attempt ${attempt} failed:`, error.message);
                
                // Don't retry on certain errors
                if (error.status === 401 || error.status === 403) {
                    throw new Error('Invalid API key. Please check your Groq API key.');
                }
                
                if (error.status === 429) {
                    throw new Error('Rate limit exceeded. Please wait a moment and try again.');
                }
                
                // Wait before retry (except on last attempt)
                if (attempt < this.maxRetries) {
                    await this.sleep(this.retryDelay * attempt);
                }
            }
        }
        
        // If all retries failed
        throw new Error(`API call failed after ${this.maxRetries} attempts: ${lastError.message}`);
    }

    // Add brevity instructions to system prompt
    addBrevityInstructions(originalPrompt) {
        const brevityInstructions = `
CRITICAL RESPONSE GUIDELINES:
- Keep responses under 100 words
- Be concise but stay in character
- Avoid repetition and unnecessary elaboration
- Focus on the core interaction
- Use short, punchy sentences
- Create atmosphere with minimal words
- If asked about rules or hints, be cryptic but brief

${originalPrompt}`;

        return brevityInstructions;
    }

    // Post-process response to ensure brevity
    ensureBrevity(response) {
        // If response is already short, return as-is
        if (response.length <= 400) {
            return response;
        }

        // Split into sentences and take first few that make sense
        const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
        
        if (sentences.length <= 2) {
            return response;
        }

        // Take first 2-3 sentences depending on length
        let result = sentences[0].trim();
        let currentLength = result.length;
        
        for (let i = 1; i < sentences.length && i < 3; i++) {
            const nextSentence = sentences[i].trim();
            if (currentLength + nextSentence.length < 350) {
                result += '. ' + nextSentence;
                currentLength += nextSentence.length + 2;
            } else {
                break;
            }
        }

        // Ensure it ends properly
        if (!result.match(/[.!?]$/)) {
            result += '.';
        }

        return result;
    }

    async makeAPICall(messages) {
        const requestBody = {
            model: this.model,
            messages: messages,
            temperature: 0.7,
            max_tokens: this.maxTokens, // Now dynamically controlled
            top_p: 0.9,
            frequency_penalty: 0.3, // Increased to reduce repetition
            presence_penalty: 0.2,
            stop: ["\n\n\n", "***", "---"] // Stop on excessive formatting
        };

        const response = await fetch(this.baseURL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const error = new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
            error.status = response.status;
            error.response = response;
            throw error;
        }

        const data = await response.json();
        
        // Validate response structure
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid response structure from API');
        }

        return data;
    }

    async testConnection() {
        if (!this.apiKey) {
            throw new Error('API key not set');
        }

        try {
            const testMessages = [
                {
                    role: "system",
                    content: "You are a helpful assistant. Respond with exactly 'Connection test successful.' in 4 words or less."
                },
                {
                    role: "user",
                    content: "Test connection"
                }
            ];

            await this.makeAPICall(testMessages);
            return true;
        } catch (error) {
            console.error('Connection test failed:', error);
            throw error;
        }
    }

    // Utility function for delays
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get API usage statistics (if available)
    getLastResponseStats() {
        // This would be populated by the last API response
        return this.lastStats || null;
    }

    // Enhanced error handling
    handleAPIError(error) {
        if (error.status === 401) {
            return 'Invalid API key. Please check your Groq API key and try again.';
        } else if (error.status === 429) {
            return 'Rate limit exceeded. Please wait a moment before trying again.';
        } else if (error.status === 500) {
            return 'Server error. The AI service is temporarily unavailable.';
        } else if (error.status === 503) {
            return 'Service unavailable. Please try again in a few moments.';
        } else if (!navigator.onLine) {
            return 'No internet connection. Please check your network and try again.';
        } else {
            return `Connection error: ${error.message}. Please try again.`;
        }
    }

    // Method to estimate token usage (rough approximation)
    estimateTokens(text) {
        // Rough approximation: 1 token ≈ 4 characters for English text
        return Math.ceil(text.length / 4);
    }

    // Method to validate message before sending
    validateMessage(message) {
        if (!message || typeof message !== 'string') {
            throw new Error('Message must be a non-empty string');
        }
        
        if (message.length > 8000) { // Conservative limit
            throw new Error('Message too long. Please keep messages under 2000 characters.');
        }
        
        return true;
    }

    // Method to clean up conversation history if it gets too long
    trimConversationHistory(history, maxTokens = 1500) { // Reduced from 2000
        if (!history || history.length === 0) return history;
        
        let totalTokens = 0;
        const trimmedHistory = [];
        
        // Count from the end (most recent messages)
        for (let i = history.length - 1; i >= 0; i--) {
            const messageTokens = this.estimateTokens(history[i].content);
            
            if (totalTokens + messageTokens > maxTokens) {
                break;
            }
            
            totalTokens += messageTokens;
            trimmedHistory.unshift(history[i]);
        }
        
        return trimmedHistory;
    }

    // Method to check if API key format looks valid
    validateApiKey(apiKey) {
        if (!apiKey || typeof apiKey !== 'string') {
            return false;
        }
        
        // Basic format check for Groq API keys
        // Groq API keys typically start with 'gsk_' and are around 50+ characters
        const groqKeyPattern = /^gsk_[a-zA-Z0-9]{40,}$/;
        return groqKeyPattern.test(apiKey);
    }

    // Method to sanitize user input before sending to API
    sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        
        // Remove potential harmful content while preserving puzzle-solving attempts
        return input
            .trim()
            .substring(0, 1000) // Reduced limit for user input
            .replace(/\u0000/g, '') // Remove null bytes
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control characters except newlines
    }

    // Utility method to count words in response
    countWords(text) {
        return text.trim().split(/\s+/).length;
    }

    // Method to set custom token limits for specific scenarios
    setCustomTokenLimit(tokens) {
        this.maxTokens = tokens;
    }

    // Reset to default settings
    resetToDefaults() {
        this.maxTokens = 150;
        this.brevityMode = true;
    }
}
