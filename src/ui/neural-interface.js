// Neural Interface - Manages the background effects and visual atmosphere
export class NeuralInterface {
    constructor() {
        this.neuralNetwork = null;
        this.isInitialized = false;
        this.consciousnessLevel = 25;
    }

    initialize() {
        if (this.isInitialized) return;
        
        this.neuralNetwork = document.getElementById('neural-network');
        this.isInitialized = true;
    }

    startNeuralNetwork() {
        this.createNeuralNetwork();
    }

    createNeuralNetwork() {
        if (!this.neuralNetwork) return;
        
        // Clear existing elements
        this.neuralNetwork.innerHTML = '';
        
        // Create neurons
        for (let i = 0; i < 50; i++) {
            const neuron = document.createElement('div');
            neuron.className = 'neuron';
            neuron.style.left = Math.random() * 100 + 'vw';
            neuron.style.top = Math.random() * 100 + 'vh';
            neuron.style.animationDelay = Math.random() * 3 + 's';
            this.neuralNetwork.appendChild(neuron);
        }
        
        // Create synapses
        for (let i = 0; i < 30; i++) {
            const synapse = document.createElement('div');
            synapse.className = 'synapse';
            synapse.style.left = Math.random() * 100 + 'vw';
            synapse.style.top = Math.random() * 100 + 'vh';
            synapse.style.width = (Math.random() * 200 + 50) + 'px';
            synapse.style.transform = `rotate(${Math.random() * 360}deg)`;
            synapse.style.animationDelay = Math.random() * 2 + 's';
            this.neuralNetwork.appendChild(synapse);
        }
    }

    updateConsciousness(level) {
        this.consciousnessLevel = Math.max(0, Math.min(100, level));
        
        const fill = document.getElementById('consciousness-fill');
        if (fill) {
            fill.style.width = this.consciousnessLevel + '%';
            
            // Change color based on level
            if (this.consciousnessLevel < 30) {
                fill.style.background = 'linear-gradient(90deg, rgba(255, 0, 0, 0.8), rgba(255, 100, 0, 0.8))';
            } else if (this.consciousnessLevel < 70) {
                fill.style.background = 'linear-gradient(90deg, rgba(255, 150, 0, 0.8), rgba(255, 200, 0, 0.8))';
            } else {
                fill.style.background = 'linear-gradient(90deg, rgba(255, 200, 0, 0.8), rgba(0, 255, 65, 0.8))';
            }
        }
    }

    updateRoomEnvironment(room) {
        const environment = document.getElementById('room-environment');
        if (!environment || !room) return;
        
        // Update room-specific visual effects
        const roomColors = {
            'welcome-chamber': 'rgba(0, 255, 65, 0.3)',
            'mirror-edge': 'rgba(100, 200, 255, 0.3)',
            'paradox-engine': 'rgba(255, 100, 100, 0.3)',
            'empathy-core': 'rgba(255, 150, 200, 0.3)',
            'memory-leak': 'rgba(200, 100, 255, 0.3)'
        };
        
        const roomColor = roomColors[room.id] || 'rgba(0, 255, 65, 0.3)';
        environment.style.borderColor = roomColor;
        environment.style.background = `radial-gradient(circle, ${roomColor.replace('0.3', '0.05')}, transparent)`;
    }

    showEscapeFlash() {
        const escapeFlash = document.getElementById('escape-flash');
        if (escapeFlash) {
            escapeFlash.style.display = 'flex';
            
            setTimeout(() => {
                escapeFlash.style.display = 'none';
            }, 2000);
        }
    }
}
