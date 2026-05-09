"use client";

import { API_URL } from "@/config/appConfig";
import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = API_URL || "http://localhost:5000";

export const useSocket = (role?: string, profileId?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = io(SOCKET_URL);

    s.on("connect", () => {
      console.log("🔌 Connected to socket server");
      setSocket(s);

      if (role === "doctor" && profileId) {
        s.emit("join-doctor", profileId);
      }
    });

    s.on("disconnect", () => {
      console.log("🔌 Disconnected from socket server");
      setSocket(null);
    });

    return () => {
      s.disconnect();
    };
  }, [role, profileId]);

  return socket;
};
