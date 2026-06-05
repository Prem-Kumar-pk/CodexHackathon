import http from "http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { config } from "./config/env.js";
import { registerSocketServer } from "./realtime/socket.js";

const app = createApp();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.corsOrigin,
    credentials: true
  }
});

registerSocketServer(io);

server.listen(config.port, () => {
  console.log(`Support Intelligence Hub API listening on port ${config.port}`);
});
