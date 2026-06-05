import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { getSocketUrl } from "../api/client.js";
import { useAuth } from "./AuthContext.jsx";

const SocketContext = createContext(null);

const notificationEvents = ["critical-sentiment", "escalation-triggered", "new-customer-message"];

export function SocketProvider({ children }) {
  const { token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!token) {
      setSocket(null);
      return undefined;
    }

    const connection = io(getSocketUrl(), {
      auth: { token },
      transports: ["websocket", "polling"]
    });

    notificationEvents.forEach((event) => {
      connection.on(event, (payload) => {
        setNotifications((current) => [
          {
            id: `${event}-${Date.now()}`,
            event,
            ...payload,
            receivedAt: new Date().toISOString()
          },
          ...current
        ]);
      });
    });

    setSocket(connection);

    return () => {
      connection.disconnect();
    };
  }, [token]);

  const value = useMemo(
    () => ({
      socket,
      notifications,
      clearNotifications: () => setNotifications([])
    }),
    [socket, notifications]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used inside SocketProvider");
  }
  return context;
}
