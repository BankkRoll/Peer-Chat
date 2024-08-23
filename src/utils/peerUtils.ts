// src/utils/peerUtils.ts
import Peer, { DataConnection } from "peerjs";

import { Message } from "@/types";

export const generatePeerId = (username: string): string => username;

export const connectToPeer = (
  peer: Peer,
  targetPeerId: string,
  saveMessage: (message: Message) => void,
  setConnection: (conn: DataConnection | null) => void
) => {
  let connectionTimeout: NodeJS.Timeout;

  const cleanup = () => {
    if (connectionTimeout) clearTimeout(connectionTimeout);
  };

  peer.on("open", (id) => {
    saveMessage({
      id: Date.now().toString(),
      text: `Joined chat as: ${id}`,
      isSender: true,
      isSystem: true,
    });

    const conn = peer.connect(targetPeerId);

    conn.on("open", () => {
      cleanup();
      saveMessage({
        id: Date.now().toString(),
        text: `Connected to chat room`,
        isSender: true,
        isSystem: true,
      });
      setConnection(conn);

      conn.on("data", (data) => {
        const message = JSON.parse(data as string);
        saveMessage({
          id: Date.now().toString(),
          text: message.text,
          isSender: false,
          username: message.username,
        });
      });
    });

    conn.on("error", (error) => {
      cleanup();
      console.error("Connection error:", error);
      saveMessage({
        id: Date.now().toString(),
        text: "Failed to connect to peer",
        isSender: true,
        isSystem: true,
      });
      setConnection(null);
    });

    conn.on("close", () => {
      cleanup();
      saveMessage({
        id: Date.now().toString(),
        text: "Peer has left the chat",
        isSender: true,
        isSystem: true,
      });
      setConnection(null);
    });

    connectionTimeout = setTimeout(() => {
      if (!conn.open) {
        conn.close();
        saveMessage({
          id: Date.now().toString(),
          text: "Connection timed out",
          isSender: true,
          isSystem: true,
        });
        setConnection(null);
      }
    }, 10000);
  });

  peer.on("error", (error) => {
    cleanup();
    console.error("Peer error:", error);
    saveMessage({
      id: Date.now().toString(),
      text: "Peer connection error",
      isSender: true,
      isSystem: true,
    });
    setConnection(null);
  });

  return cleanup;
};

export const createPeer = (
  peerId: string,
  saveMessage: (message: Message) => void,
  setConnection: (conn: DataConnection | null) => void,
  setShowLink: (show: boolean) => void,
  setPeer: (peer: Peer) => void
) => {
  const peer = new Peer(peerId);
  setPeer(peer);
  setShowLink(true);

  peer.on("open", (id) => {
    saveMessage({
      id: Date.now().toString(),
      text: `Created chat room as: ${id}`,
      isSender: true,
      isSystem: true,
    });
  });

  peer.on("connection", (conn) => {
    setShowLink(false);
    saveMessage({
      id: Date.now().toString(),
      text: "A new user joined the chat",
      isSender: false,
      isSystem: true,
    });
    setConnection(conn);

    conn.on("data", (data) => {
      const message = JSON.parse(data as string);
      saveMessage({
        id: Date.now().toString(),
        text: message.text,
        isSender: false,
        username: message.username,
      });
    });

    conn.on("close", () => {
      saveMessage({
        id: Date.now().toString(),
        text: "Peer has left the chat",
        isSender: false,
        isSystem: true,
      });
      setConnection(null);
    });
  });

  peer.on("error", (error) => {
    console.error("Peer error:", error);
    saveMessage({
      id: Date.now().toString(),
      text: "Peer connection error",
      isSender: true,
      isSystem: true,
    });
    setConnection(null);
  });

  return peer;
};
