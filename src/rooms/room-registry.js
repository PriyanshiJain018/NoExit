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

    validateRooms() {
        this.rooms.forEach((room, index) => {
            if (!room.name || !room.systemPrompt || !room.welcomeMessage) {
                console.warn(`Room ${index} may be missing required fields`);
            }
        });
    }
}
