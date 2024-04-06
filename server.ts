import { } from "./src/types.js";
import { createServer } from "http";
import { Server } from "socket.io";

const port = 3000;
const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "*"
    }
});

const rooms: Room[] = [];
const games: Map<string, GameData> = new Map();

function generateUniqueRoomId(): string {
    let room = "room-";
    for (let i = 0; i < 4; i++) {
        room += Math.floor(Math.random() * 10);
    }
    return room;
}

function removePlayerFromGameData(player_id: string, room_id: string) {
    if (games.has(room_id)) {
        const game = games.get(room_id)!;
        if (game.players.length === 1) {
            games.delete(room_id);
        } else {
            game.players = game.players.filter(p => p.id !== player_id);
        }
    }
}

function getAvailableRooms(): Room[] {
    return rooms.filter(r => !r.game_started);
}

function updateLobby() {
    io.emit("update_lobby", getAvailableRooms());
}

function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
}

function getRandomPositionWithinLimits(limits: GameLimits): { x: number, y: number } {
    return {
        x: getRandomInt(limits.minX + 1, limits.maxX - 50),
        y: limits.maxY - 60,
    };
}

io.on("connection", (socket) => {
    let username = "";
    let interval: NodeJS.Timeout | undefined = undefined;
    console.log("connection", socket.id);

    function leaveRoom(room_id: string): void {
        for (let i = 0; i < rooms.length; i++) {
            const room = rooms[i];
            if (room.id === room_id) {
                socket.leave(room_id);
                if (room.players.length === 1) {
                    // The player is the only one in his room,
                    // so just delete the room.
                    rooms.splice(i, 1);
                } else {
                    // The player is not alone in the room,
                    // so just remove him from the list of players.
                    let playerIdx = room.players.findIndex(p => p.id === socket.id);
                    room.players.splice(playerIdx, 1);
                }
                return;
            }
        }
    }

    function createRoom(): string {
        // Leave the other rooms where the already player was.
        if (socket.rooms.size > 1) {
            for (const room_id of socket.rooms) {
                leaveRoom(room_id);
            }
        }
        const roomId = generateUniqueRoomId();
        socket.join(roomId);
        rooms.push({
            id: roomId,
            game_started: false,
            players: [{
                id: socket.id,
                username,
            }],
        });
        return roomId;
    }

    function getRoom(): string | null {
        for (const room of rooms) {
            if (room.players.map(p => p.id).includes(socket.id)) {
                return room.id;
            }
        }
        return null;
    }

    function joinExistingRoom(room_id: string): boolean {
        // Basically checking if the user is already in another room.
        // If he is in another room, then leave it.
        // Also make sure that if the room he's already in is the
        // given one (`room_id`) then don't leave it and return a failure.
        let current_room = getRoom();
        if (current_room != null) {
            if (current_room == room_id) {
                return false;
            }
            leaveRoom(current_room);
        }
        for (const room of rooms) {
            if (room.id === room_id) {
                room.players.push({
                    id: socket.id,
                    username,
                });
                socket.join(room_id);
                return true;
            }
        }
        return false;
    }

    socket.on("username_changed", (name: string) => {
        username = name;
        for (const room of rooms) {
            const playerIdx = room.players.findIndex(p => p.id === socket.id);
            if (playerIdx >= 0) {
                room.players[playerIdx].username = name;
            }
        }
        updateLobby(); // necessary in the lobby when we're waiting for players to arrive
    });

    socket.on("host", (ack: (roomId: string) => void) => {
        ack(createRoom()); // will be called on the client
        updateLobby();
    });

    socket.on("join_room", (room_id: string, ack: (success: boolean) => void) => {
        ack(joinExistingRoom(room_id));
        updateLobby();
    });

    socket.on("quit_room", (room_id: string, ack: () => void) => {
        leaveRoom(room_id);
        ack(); // must be called before "updateLobby"
        updateLobby();
    });

    socket.on("start_game", (room_id: string, limits: GameLimits, ack: (gameData: GameData) => void) => {
        const room = rooms.find(r => r.id === room_id);
        if (room) {
            const data: GameData = {
                enemies: [],
                bullets: [],
                players: room.players.map(p => ({
                    username: p.username,
                    position: getRandomPositionWithinLimits(limits),
                    id: p.id,
                    skin: 0, // TODO: fix getRandomPositionWithinLimits() so that it doesn't use hard-coded values
                    hp: 5,
                })),
            };
            room.game_started = true;
            games.set(room_id, data);
            socket.to(room_id).emit("host_started_game", data);
            interval = setInterval(() => {
                // "io.to" instead of "socket.to"
                // because "socket.to" doesn't send
                // to "socket".
                const game = games.get(room_id);
                if (game) {
                    // Update position of enemies and bullets.
                    // Check for collisions and update the game accordingly.
                    for (const bullet of game.bullets) {
                        bullet.y += bullet.shotByPlayer ? -10 : 10;
                    }
                    io.to(room_id).emit("game_update", game);
                } else {
                    clearInterval(interval);
                }
            }, 1000 / 60);
            ack(data);
            updateLobby();
        }
    });

    socket.on("game_player_shooting", () => {
        const game = games.get(getRoom() ?? "");
        if (game) {
            const shooter = game.players.find(p => p.id === socket.id);
            if (shooter) {
                game.bullets.push({
                    shotByPlayer: true,
                    x: shooter.position.x + 25 - 8,
                    y: shooter.position.y,
                });
            }
        }
    });

    socket.on("request_lobby", (ack: (rooms: Room[]) => void) => {
        ack(getAvailableRooms());
    });

    socket.on("disconnect", () => {
        const to_remove: number[] = [];
        for (let i = 0; i < rooms.length; i++) {
            const room = rooms[i];
            if (room.players.map(p => p.id).includes(socket.id)) {
                if (room.players.length === 1) {
                    to_remove.push(i);
                } else {
                    room.players.filter(p => p.id !== socket.id);
                }
                removePlayerFromGameData(socket.id, room.id);
            }
        }
        for (let i = to_remove.length - 1; i >= 0; i--) {
            rooms.splice(i, 1);
        }
        updateLobby();
        if (interval) {
            clearInterval(interval);
        }
    });
});

httpServer.listen(port, () => {
    console.log("listening on port " + port);
});
