let ioInstance = null;

export function registerSocketServer(io) {
  ioInstance = io;

  io.on("connection", (socket) => {
    socket.join("support-floor");

    socket.on("join-customer", (customerId) => {
      if (customerId) socket.join(`customer:${customerId}`);
    });

    socket.on("leave-customer", (customerId) => {
      if (customerId) socket.leave(`customer:${customerId}`);
    });
  });
}

export function emitEvent(event, payload) {
  if (!ioInstance) return;

  ioInstance.to("support-floor").emit(event, payload);
  if (payload?.customerId) {
    ioInstance.to(`customer:${payload.customerId}`).emit(event, payload);
  }
}
