import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import Game from "./src/Game.js";

const port = process.env.PORT ?? 3000;

const game : Game = Game.getInstance();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173"
  }
});

io.on("connection", (socket) => {
  console.log("connection", socket.id);
  // ...
});

app.use(express.static('../public', {
  index: "express/index.html"
}));

httpServer.listen(port, () => {
  console.log("listening on port " + port);
});