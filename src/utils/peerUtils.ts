import Peer, { DataConnection } from "peerjs";

import { Message } from "@/components/message/messages-section";

export const generatePeerId = (username: string): string => username;

export const connectToPeer = (
  peer: Peer,
  targetPeerId: string,
  saveMessage: (message: Message) => void,
  setConnection: (conn: DataConnection) => void,
  connection: DataConnection | null,
) => {
  peer.on("open", (id) => {
    saveMessage({
      id: Date.now().toString(),
      text: `Created Peer: ${id}`,
      isSender: true,
      isSystem: true,
    });

    const conn = peer.connect(targetPeerId);

    conn.on("open", () => {
      saveMessage({
        id: Date.now().toString(),
        text: `Connected to Peer: ${targetPeerId}`,
        isSender: true,
        isSystem: true,
      });
      setConnection(conn);

      conn.on("data", (data) => {
        saveMessage({
          id: Date.now().toString(),
          text: data as string,
          isSender: false,
        });
      });
    });

    setTimeout(() => {
      if (!connection) {
        saveMessage({
          id: Date.now().toString(),
          text: "Peer not found",
          isSender: true,
          isSystem: true,
        });
        window.location.href = "/";
      }
    }, 6000);

    conn.on("close", () =>
      saveMessage({
        id: Date.now().toString(),
        text: "Peer has left the chat",
        isSender: true,
        isSystem: true,
      }),
    );
  });

  peer.on("error", (error) => console.error("Peer error:", error));
};

export const createPeer = (
  peerId: string,
  saveMessage: (message: Message) => void,
  setConnection: (conn: DataConnection) => void,
  setShowLink: (show: boolean) => void,
  setPeer: (peer: Peer) => void,
) => {
  const peer = new Peer(peerId);
  setPeer(peer);
  setShowLink(true);

  peer.on("connection", (conn) => {
    setShowLink(false);
    saveMessage({
      id: Date.now().toString(),
      text: "Connected to Peer",
      isSender: false,
      isSystem: true,
    });
    setConnection(conn);

    conn.on("data", (data) => {
      saveMessage({
        id: Date.now().toString(),
        text: data as string,
        isSender: false,
      });
    });

    conn.on("close", () =>
      saveMessage({
        id: Date.now().toString(),
        text: "Peer has left the chat",
        isSender: false,
        isSystem: true,
      }),
    );
  });

  peer.on("error", (error) => console.error("Peer error:", error));
};
