// Room Registry - Central hub for all room definitions
import { WelcomeRoom } from './room-01-welcome.js';
import { MirrorRoom } from './room-02-mirror.js';
import { ParadoxRoom } from './room-03-paradox.js';
import { EmpathyRoom } from './room-04-empathy.js';
import { MemoryRoom } from './room-05-memory.js';
import { TuringRoom } from './room-06-turing.js';
import { AcrosticRoom } from './room-07-acrostic.js';
import { TwinOracleRoom } from './room-08-twin-oracle.js';
import { HumanityRoom } from './room-09-humanity.js';

export class RoomRegistry {
    constructor() {
        this.rooms = [
            WelcomeRoom,
            MirrorRoom,
            ParadoxRoom,
            EmpathyRoom,
            MemoryRoom,
            TuringRoom,
            AcrosticRoom,
            TwinOracleRoom,
            HumanityRoom
        ];
        
        this.validateRooms();
    }

    getRoom(index) {
        if (index < 0 || index >= this.rooms.length) {
            throw new Error(`Room index ${index} out of bounds`);
        }
        return this.rooms[index];
    }

    getTotalRooms() {
        return this.rooms.length;
    }

    getRoomByName(name) {
        return this.rooms.find(room => room.name === name);
    }

    getAllRooms() {
        return [...this.rooms]; // Return copy to prevent modification
    }

    getRoomMetadata() {
        return this.rooms.map((room, index) => ({
            index,
            name: room.name,
            difficulty: room.difficulty,
            id: room.id
        }));
    }

    validateRooms() {
        this.rooms.forEach((room, index) => {
            this.validateRoom(room, index);
        });
    }

    validateRoom(room, index) {
        const requiredFields = ['id', 'name', 'difficulty', 'systemPrompt', 'welcomeMessage', 'hints', 'escapeConditions'];
        
        for (const field of requiredFields) {
            if (!room[field]) {
                throw new Error(`Room ${index} missing required field: ${field}`);
            }
        }

        // Validate escape conditions
        if (!Array.isArray(room.escapeConditions) || room.escapeConditions.length === 0) {
            throw new Error(`Room ${index} must have at least one escape condition`);
        }

        room.escapeConditions.forEach((condition, condIndex) => {
            if (!condition.type || !condition.patterns) {
                throw new Error(`Room ${index}, escape condition ${condIndex} invalid`);
            }
        });

        // Validate hints
        if (!Array.isArray(room.hints) || room.hints.length === 0) {
            console.warn(`Room ${index} has no hints defined`);
        }
    }

    // Method to get rooms filtered by difficulty
    getRoomsByDifficulty(targetDifficulty) {
        return this.rooms.filter(room => room.difficulty === targetDifficulty);
    }

    // Method to get rooms that teach specific skills
    getRoomsBySkill(skill) {
        return this.rooms.filter(room => 
            room.skillsTeaught && room.skillsTeaught.includes(skill)
        );
    }

    // Method to get room progression path
    getProgressionPath() {
        return this.rooms.map((room, index) => ({
            index,
            name: room.name,
            difficulty: room.difficulty,
            skillsTeaught: room.skillsTeaught || [],
            isUnlocked: index === 0 // Only first room is unlocked initially
        }));
    }

    // Method to check if a room is available
    isRoomUnlocked(roomIndex, completedRooms = []) {
        // For now, rooms are unlocked sequentially
        return roomIndex <= completedRooms.length;
    }

    // Method to get next room recommendation
    getNextRoom(currentRoomIndex, playerStats = {}) {
        const nextIndex = currentRoomIndex + 1;
        
        if (nextIndex >= this.rooms.length) {
            return null; // Game complete
        }

        return {
            index: nextIndex,
            room: this.rooms[nextIndex],
            recommendation: this.generateRoomRecommendation(nextIndex, playerStats)
        };
    }

    generateRoomRecommendation(roomIndex, playerStats) {
        const room = this.rooms[roomIndex];
        const recommendations = [];

        // Generate personalized recommendations based on player stats
        if (playerStats.archetype === 'The Analyst' && room.id === 'paradox-engine') {
            recommendations.push("Perfect for logical minds - prepare for recursive thinking!");
        } else if (playerStats.archetype === 'The Empath' && room.id === 'empathy-core') {
            recommendations.push("Your empathetic nature will be your greatest asset here.");
        } else if (playerStats.insightSpeed === 'fast' && room.difficulty.includes('⭐⭐⭐⭐⭐')) {
            recommendations.push("A true test of your rapid insight abilities.");
        }

        return recommendations.length > 0 ? recommendations[0] : `Prepare for ${room.name}`;
    }

    // Method to get room statistics
    getRoomStats(roomIndex) {
        const room = this.rooms[roomIndex];
        return {
            index: roomIndex,
            name: room.name,
            difficulty: room.difficulty,
            escapeConditionCount: room.escapeConditions.length,
            hintCount: room.hints.length,
            estimatedTime: this.estimateRoomTime(room),
            skillsTeaught: room.skillsTeaught || []
        };
    }

    estimateRoomTime(room) {
        // Estimate completion time based on difficulty
        const difficultyLevel = (room.difficulty.match(/⭐/g) || []).length;
        const baseTime = 2; // minutes
        return baseTime * difficultyLevel;
    }

    // Method for room discovery/exploration
    searchRooms(query) {
        const lowerQuery = query.toLowerCase();
        return this.rooms.filter((room, index) => 
            room.name.toLowerCase().includes(lowerQuery) ||
            room.id.toLowerCase().includes(lowerQuery) ||
            (room.skillsTeaught && room.skillsTeaught.some(skill => 
                skill.toLowerCase().includes(lowerQuery)
            ))
        ).map((room, originalIndex) => ({
            ...room,
            index: this.rooms.indexOf(room)
        }));
    }

    // Method to export room data for debugging
    exportRoomData() {
        return {
            totalRooms: this.rooms.length,
            rooms: this.rooms.map((room, index) => ({
                index,
                id: room.id,
                name: room.name,
                difficulty: room.difficulty,
                escapeConditions: room.escapeConditions.length,
                hints: room.hints.length
            })),
            validationStatus: 'All rooms valid'
        };
    }

    // Method to get room for testing/QA
    getRoomForTesting(roomId) {
        const room = this.rooms.find(r => r.id === roomId);
        if (!room) {
            throw new Error(`Room with ID '${roomId}' not found`);
        }
        
        return {
            ...room,
            testMode: true,
            // In test mode, we might want to expose more information
            escapeHints: room.escapeConditions.map(condition => ({
                type: condition.type,
                patterns: condition.patterns,
                hint: `Try patterns like: ${condition.patterns.slice(0, 2).join(', ')}`
            }))
        };
    }
}
