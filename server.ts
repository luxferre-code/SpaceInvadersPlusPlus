import { createServer } from "http";
import { Server } from "socket.io";
import {} from './src/types.js'; 

const port = 3000;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173"
  }
});

io.on("connection", (socket) => {
  console.log("connection", socket.id);

  socket.on('playerMoved', (data) => {
    console.log('playerMoved', data);
  });
});


httpServer.listen(port, () => {
  console.log("listening on port " + port);
});