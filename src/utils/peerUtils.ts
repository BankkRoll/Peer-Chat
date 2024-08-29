import Peer, { DataConnection, MediaConnection } from "peerjs";

import { Message } from "@/types";
import { v4 as uuidv4 } from "uuid";

export const generatePeerId = (): string => {
  const uuid = uuidv4(); // Generate a standard UUID
  return (
    uuid
      .replace(/-/g, "")
      .match(/.{1,6}/g)
      ?.join("-") ?? uuid
  ); // Reformat to "xxxxxx-xxxxxx-xxxxxx"
};

export const connectToPeer = (
  peer: Peer,
  targetPeerId: string,
  saveMessage: (message: Message) => void,
  setConnection: (conn: DataConnection | null) => void,
  handleIncomingCall: (call: MediaConnection, type: "audio" | "video") => void
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
      username: "System",
      timestamp: new Date().toISOString(),
    });

    const conn = peer.connect(targetPeerId);

    conn.on("open", () => {
      cleanup();
      saveMessage({
        id: Date.now().toString(),
        text: `Connected to chat room`,
        isSender: true,
        isSystem: true,
        username: "System",
        timestamp: new Date().toISOString(),
      });
      setConnection(conn);

      conn.on("data", (data) => {
        const message = JSON.parse(data as string) as Message;
        saveMessage({
          ...message,
          id: Date.now().toString(),
          isSender: false,
          timestamp: new Date().toISOString(),
        });
      });
    });

    conn.on("error", (error) => {
      cleanup();
      console.error("Connection error:", error);
      saveMessage({
        id: Date.now().toString(),
        text: `Connection error: ${error.message}`,
        isSender: true,
        isSystem: true,
        username: "System",
        timestamp: new Date().toISOString(),
      });
    });

    conn.on("close", () => {
      cleanup();
      saveMessage({
        id: Date.now().toString(),
        text: "Peer has left the chat",
        isSender: true,
        isSystem: true,
        username: "System",
        timestamp: new Date().toISOString(),
      });
      setConnection(null);
    });

    connectionTimeout = setTimeout(() => {
      if (!conn.open) {
        conn.close();
        saveMessage({
          id: Date.now().toString(),
          text: "Connection timed out. Unable to connect to peer.",
          isSender: true,
          isSystem: true,
          username: "System",
          timestamp: new Date().toISOString(),
        });
      }
    }, 10000);
  });

  peer.on("call", (call) => {
    const callType = call.metadata.type as "audio" | "video";
    handleIncomingCall(call, callType);
  });

  peer.on("error", (error) => {
    cleanup();
    console.error("Peer error:", error);
    saveMessage({
      id: Date.now().toString(),
      text: `Peer error: ${error.message}`,
      isSender: true,
      isSystem: true,
      username: "System",
      timestamp: new Date().toISOString(),
    });
  });

  return cleanup;
};

export const createPeer = (
  peerId: string,
  saveMessage: (message: Message) => void,
  setConnection: (conn: DataConnection | null) => void,
  setShowLink: (show: boolean) => void,
  setPeer: (peer: Peer) => void,
  onIncomingCall: (call: MediaConnection, type: "audio" | "video") => void
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
      username: "System",
      timestamp: new Date().toISOString(),
    });
  });

  peer.on("connection", (conn) => {
    setShowLink(false);
    saveMessage({
      id: Date.now().toString(),
      text: "A new user joined the chat",
      isSender: false,
      isSystem: true,
      username: "System",
      timestamp: new Date().toISOString(),
    });
    setConnection(conn);

    conn.on("data", (data) => {
      const message = JSON.parse(data as string);
      if (message.callRequest) {
        const { type, peerId } = message.callRequest;
        onIncomingCall(type === "audio" ? peerId : peerId, type);
      } else {
        saveMessage({
          ...message,
          id: Date.now().toString(),
          isSender: false,
          timestamp: new Date().toISOString(),
        });
      }
    });

    conn.on("error", (error) => {
      console.error("Connection error:", error);
      saveMessage({
        id: Date.now().toString(),
        text: `Connection error: ${error.message}`,
        isSender: false,
        isSystem: true,
        username: "System",
        timestamp: new Date().toISOString(),
      });
      setConnection(null);
    });

    conn.on("close", () => {
      saveMessage({
        id: Date.now().toString(),
        text: "Peer has left the chat",
        isSender: false,
        isSystem: true,
        username: "System",
        timestamp: new Date().toISOString(),
      });
      setConnection(null);
    });
  });

  peer.on("call", (call) => {
    const callType = call.metadata.type as "audio" | "video";
    onIncomingCall(call, callType);
  });

  peer.on("error", (error) => {
    console.error("Peer error:", error);
    saveMessage({
      id: Date.now().toString(),
      text: `Peer error: ${error.message}`,
      isSender: true,
      isSystem: true,
      username: "System",
      timestamp: new Date().toISOString(),
    });
  });

  return peer;
};

export const handleCall = (
  call: MediaConnection,
  stream: MediaStream,
  saveMessage: (message: Message) => void
) => {
  const callStartTime = new Date();
  saveMessage({
    id: Date.now().toString(),
    text: `Starting ${
      call.metadata.type === "video" ? "video" : "audio"
    } call...`,
    isSender: true,
    isSystem: true,
    username: "System",
    timestamp: callStartTime.toISOString(),
  });

  call.answer(stream);
  call.on("stream", (remoteStream) => {
    // Handle the remote stream (e.g., play in a video/audio element)
    saveMessage({
      id: Date.now().toString(),
      text: `${
        call.metadata.type === "video" ? "Video" : "Audio"
      } call in progress...`,
      isSender: false,
      isSystem: true,
      username: "System",
      timestamp: new Date().toISOString(),
    });
  });

  call.on("close", () => {
    const callEndTime = new Date();
    const duration = Math.floor(
      (callEndTime.getTime() - callStartTime.getTime()) / 1000
    );
    saveMessage({
      id: Date.now().toString(),
      text: `${
        call.metadata.type === "video" ? "Video" : "Audio"
      } call ended. Duration: ${duration} seconds.`,
      isSender: true,
      isSystem: true,
      username: "System",
      timestamp: callEndTime.toISOString(),
    });
  });

  call.on("error", (error) => {
    console.error("Call error:", error);
    saveMessage({
      id: Date.now().toString(),
      text: `Call error: ${error.message}`,
      isSender: true,
      isSystem: true,
      username: "System",
      timestamp: new Date().toISOString(),
    });
  });
};
