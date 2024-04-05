import { createServer } from "http";
import { Server } from "socket.io";
const port = 3000;
const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "*"
    }
});
const rooms = [];
function generateUniqueRoomId() {
    let room = "room-";
    for (let i = 0; i < 4; i++) {
        room += Math.floor(Math.random() * 10);
    }
    return room;
}
function updateLobby() {
    io.emit("update_lobby", rooms);
}
io.on("connection", (socket) => {
    let username = "";
    console.log("connection", socket.id);
    function leaveRoom(room_id) {
        for (let i = 0; i < rooms.length; i++) {
            const room = rooms[i];
            if (room.id === room_id) {
                socket.leave(room_id);
                if (room.players.length === 1) {
                    // The player is the only one in his room,
                    // so just delete the room.
                    rooms.splice(i, 1);
                }
                else {
                    // The player is not alone in the room,
                    // so just remove him from the list of players.
                    let playerIdx = room.players.findIndex(p => p.id === socket.id);
                    room.players.splice(playerIdx, 1);
                }
                return;
            }
        }
    }
    function createRoom() {
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
            players: [{
                    id: socket.id,
                    username,
                }],
        });
        return roomId;
    }
    function hasRoom() {
        for (const room of rooms) {
            if (room.players.map(p => p.id).includes(socket.id)) {
                return room.id;
            }
        }
        return null;
    }
    function joinExistingRoom(room_id) {
        // Basically checking if the user is already in another room.
        // If he is in another room, then leave it.
        // Also make sure that if the room he's already in is the
        // given one (`room_id`) then don't leave it and return a failure.
        let current_room = hasRoom();
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
    socket.on("username_changed", (name) => {
        username = name;
        for (const room of rooms) {
            const playerIdx = room.players.findIndex(p => p.id === socket.id);
            if (playerIdx >= 0) {
                room.players[playerIdx].username = name;
            }
        }
        updateLobby(); // necessary in the lobby when we're waiting for players to arrive
    });
    socket.on("host", (ack) => {
        ack(createRoom()); // will be called on the client
        updateLobby();
    });
    socket.on("join_room", (room_id, ack) => {
        ack(joinExistingRoom(room_id));
        updateLobby();
    });
    socket.on("quit_room", (room_id, ack) => {
        leaveRoom(room_id);
        ack(); // must be called before "updateLobby"
        updateLobby();
    });
    socket.on("request_lobby", (ack) => {
        ack(rooms);
    });
    socket.on("disconnect", () => {
        const to_remove = [];
        for (let i = 0; i < rooms.length; i++) {
            const room = rooms[i];
            if (room.players.map(p => p.id).includes(socket.id)) {
                if (room.players.length === 1) {
                    to_remove.push(i);
                }
                else {
                    room.players.filter(p => p.id !== socket.id);
                }
            }
        }
        for (let i = to_remove.length - 1; i >= 0; i--) {
            rooms.splice(i, 1);
        }
        updateLobby();
    });
});
httpServer.listen(port, () => {
    console.log("listening on port " + port);
});
