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

const BULLET_VELOCITY = 10;
const ENEMY_VELOCITY = 4;
const BULLET_WIDTH = 8;

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

function getRandomPlayerSpawnPosition(limits: GameLimits): Vec2 {
    return {
        x: getRandomInt(limits.minX + 1, limits.maxX - 50),
        y: limits.maxY - 60,
    };
}

class Box {
    public readonly top_left: Vec2;
    public readonly top_right: Vec2;
    public readonly bottom_left: Vec2;
    public readonly bottom_right: Vec2;

    constructor(x: number, y: number, width: number, height: number) {
        this.top_left = { x, y };
        this.top_right =  { x: x + width, y };
        this.bottom_left = { x, y: y + height };
        this.bottom_right = { x: x + width, y: y + height };
    }

    public isColliding(hitbox: Readonly<Box>): boolean {
        return this.top_left.x < hitbox.bottom_right.x &&
            this.bottom_right.x > hitbox.top_left.x &&
            this.top_left.y < hitbox.bottom_right.y &&
            this.bottom_right.y > hitbox.top_left.y;
    }
}

io.on("connection", (socket) => {
    let username = "";
    let physics_interval: NodeJS.Timeout | undefined = undefined;
    let process_interval: NodeJS.Timeout | undefined = undefined;
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
                    recomputeGameLimits(room);
                }
                return;
            }
        }
    }

    function createRoom(initialLimits: GameLimits): string {
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
                username,
                id: socket.id,
                game_limits: initialLimits,
            }],
            computed_screen_limits: structuredClone(initialLimits),
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

    function joinExistingRoom(room_id: string, game_limits: GameLimits): boolean {
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
                    username,
                    id: socket.id,
                    game_limits,
                });
                recomputeGameLimits(room);
                socket.join(room_id);
                return true;
            }
        }
        return false;
    }

    /**
     * Save the maximums X and Y and minimum X of the game limits.
     */
    function recomputeGameLimits(room: Room) {
        let minX = room.players[0].game_limits.minX;
        let maxX = room.players[0].game_limits.maxX;
        let maxY = room.players[0].game_limits.maxY;
        for (let i = 1; i < room.players.length; i++) {
            const player = room.players[i];
            if (player.game_limits.minX < minX) minX = player.game_limits.minX;
            if (player.game_limits.maxX > maxX) maxX = player.game_limits.maxX;
            if (player.game_limits.maxY > maxY) maxY = player.game_limits.maxY;
        }
        room.computed_screen_limits.minX = minX;
        room.computed_screen_limits.maxX = maxX;
        room.computed_screen_limits.maxY = maxY;
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

    socket.on("host", (initial_game_limits: GameLimits, ack: (room_id: string) => void) => {
        ack(createRoom(initial_game_limits)); // will be called on the client
        updateLobby();
    });

    socket.on("join_room", (room_id: string, limits: GameLimits, ack: (success: boolean) => void) => {
        const success = joinExistingRoom(room_id, limits);
        ack(success);
        updateLobby();
    });

    socket.on("quit_room", (room_id: string, ack: () => void) => {
        leaveRoom(room_id);
        ack(); // must be called before "updateLobby"
        updateLobby();
    });

    socket.on("start_game", (room_id: string, ack: (gameData: GameData) => void) => {
        const room = rooms.find(r => r.id === room_id);
        if (room) {
            const data: GameData = {
                enemies: [],
                bullets: [],
                players: room.players.map(p => ({
                    username: p.username,
                    position: getRandomPlayerSpawnPosition(room.computed_screen_limits),
                    id: p.id,
                    skin: 0, // TODO: fix getRandomPlayerSpawnPosition() so that it doesn't use hard-coded values
                    hp: 5,
                })),
            };

            room.game_started = true;
            games.set(room_id, data);
            socket.to(room_id).emit("host_started_game", data);

            physics_interval = setInterval(() => {
                const game = games.get(room_id);
                if (game) {
                    // - Update position of enemies and bullets.
                    // - Remove bullets that are out of the screen.
                    // - Check for collisions and update the game accordingly.
                    for (let i = game.enemies.length - 1; i >= 0; i--) {
                        if (game.enemies[i].y >= room.computed_screen_limits.maxY) {
                            game.enemies.splice(i, 1);
                        }
                    }
                    for (let i = game.bullets.length - 1; i >= 0; i--) {
                        if (game.bullets[i].y < 10 || game.bullets[i].y >= room.computed_screen_limits.maxY) {
                            game.bullets.splice(i, 1);
                        }
                    }
                    const used_bullets: number[] = [];
                    const killed_enemies: number[] = [];
                    for (let b = 0; b < game.bullets.length; b++) {
                        const bullet = game.bullets[b];
                        const hit_box = new Box(bullet.x, bullet.y, 8, 8);
                        if (bullet.shotByPlayer) {
                            for (let i = 0; i < game.enemies.length; i++) {
                                const enemy = game.enemies[i];
                                const hurt_box = new Box(enemy.x, enemy.y, 50, 50);
                                if (hit_box.isColliding(hurt_box)) {
                                    killed_enemies.push(i);
                                    used_bullets.push(b);
                                    break;
                                }
                            }
                        } else {
                            for (const player of game.players) {
                                const hurt_box = new Box(player.position.x, player.position.y, 50, 50);
                                if (hit_box.isColliding(hurt_box)) {
                                    player.hp -= 1;
                                    used_bullets.push(b);
                                    break;
                                }
                            }
                        }
                    }
                    for (let i = killed_enemies.length - 1; i >= 0; i--) {
                        game.enemies.splice(killed_enemies[i], 1);
                    }
                    for (let i = used_bullets.length - 1; i >= 0; i--) {
                        game.bullets.splice(used_bullets[i], 1);
                    }
                    game.bullets.forEach(b => b.y += b.shotByPlayer ? -BULLET_VELOCITY : BULLET_VELOCITY);
                    game.enemies.forEach(e => e.y += ENEMY_VELOCITY);
                    io.to(room_id).emit("game_update", game);
                } else {
                    clearInterval(physics_interval);
                }
            }, 1000 / 60);

            process_interval = setInterval(() => {
                const game = games.get(room_id);
                if (game) {
                    // - Creates new enemies
                    // - Make the enemies shoot
                    if (game.enemies.length < 5 && 0.1 > Math.random()) {
                        game.enemies.push({
                            y: -50, // -50 is the size of the skin
                            x: getRandomInt(
                                room.computed_screen_limits.minX,
                                room.computed_screen_limits.maxX - 50
                            ),
                        });
                    }
                    for (const enemy of game.enemies) {
                        if (0.04 > Math.random()) {
                            game.bullets.push({
                                shotByPlayer: false,
                                x: enemy.x + 25 - 8,
                                y: enemy.y + 50,
                            });
                        }
                    }
                } else {
                    clearInterval(process_interval);
                }
            }, 1000 / 20);

            ack(data);
            updateLobby();
        }
    });

    socket.on("player_moved", (player_position: { x: number, y: number }) => {
        const game = games.get(getRoom() ?? "");
        if (game) {
            const player = game.players.find(p => p.id === socket.id);
            if (player) {
                player.position = player_position;
            }
        }
    });

    socket.on("game_player_shooting", () => {
        const game = games.get(getRoom() ?? "");
        if (game) {
            const shooter = game.players.find(p => p.id === socket.id);
            if (shooter) {
                game.bullets.push({
                    shotByPlayer: true,
                    x: shooter.position.x + 25 - BULLET_WIDTH,
                    y: shooter.position.y,
                });
            }
        }
    });

    socket.on("screen_resized", (room_id: string, limits: GameLimits) => {
        const room = rooms.find(r => r.id === room_id);
        if (room) {
            const player = room.players.find(p => p.id === socket.id);
            if (player) {
                player.game_limits = limits;
                recomputeGameLimits(room);
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
                    recomputeGameLimits(room);
                }
                removePlayerFromGameData(socket.id, room.id);
            }
        }
        for (let i = to_remove.length - 1; i >= 0; i--) {
            rooms.splice(i, 1);
        }
        updateLobby();
        if (physics_interval) clearInterval(physics_interval);
        if (process_interval) clearInterval(process_interval);
    });
});

httpServer.listen(port, () => {
    console.log("listening on port " + port);
});
