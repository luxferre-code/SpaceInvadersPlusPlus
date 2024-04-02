import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import Game from "./src/Game.js";
import PlayerServer from "./src/PlayerServer.js";
import Vector2 from "./src/Vector2.js";
const port = process.env.PORT ?? 3000;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173"
    }
});
io.on("connection", (socket) => {
    console.log("connection", socket.id);
});
io.on("playNowSolo", (socket) => {
    console.log("playNow", socket.id);
    Game.new(socket.id);
});
io.on("playerSetting", (socket, settings) => {
    console.log("playerSetting", socket.id, settings);
    Game.getInstance(socket.id).addEntity(new PlayerServer(new Vector2(0, 0), settings.width, settings.height, socket.id));
});
io.on("gameSettings", (socket, settings) => {
    console.log("gameSettings", socket.id, settings);
    //TODO
});
io.on("disconnect", (socket) => {
    console.log("disconnect", socket.id);
    Game.remove(socket.id);
});
app.use(express.static('../public', {
    index: "express/index.html"
}));
httpServer.listen(port, () => {
    console.log("listening on port " + port);
});
