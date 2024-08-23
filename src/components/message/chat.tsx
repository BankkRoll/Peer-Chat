// src/components/message/chat.tsx
import Peer, { DataConnection } from "peerjs";
import React, { useEffect, useRef, useState } from "react";
import { connectToPeer, createPeer, generatePeerId } from "@/utils/peerUtils";

import { AnimatedBeamer } from "@/components/home/beam";
import { Message } from "@/types";
import MessageInput from "@/components/message/message-input";
import MessageLink from "@/components/message/message-link";
import Messages from "@/components/message/messages-section";
import { v4 as uuidv4 } from "uuid";

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connection, setConnection] = useState<DataConnection | null>(null);
  const [peer, setPeer] = useState<Peer | null>(null);
  const [showLink, setShowLink] = useState<boolean>(false);
  const [wasCopied, setWasCopied] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const randomUsername = `user_${uuidv4().substr(0, 8)}`;
    setUsername(randomUsername);
    const peerId = generatePeerId(randomUsername);

    const targetPeerId = window.location.hash.slice(1);
    let cleanup: (() => void) | undefined;

    if (targetPeerId) {
      const newPeer = new Peer(peerId);
      setPeer(newPeer);
      cleanup = connectToPeer(
        newPeer,
        targetPeerId,
        saveMessage,
        setConnection
      );
    } else {
      const newPeer = createPeer(
        peerId,
        saveMessage,
        setConnection,
        setShowLink,
        setPeer
      );
      setPeer(newPeer);
    }

    return () => {
      if (cleanup) cleanup();
      if (peer && !peer.destroyed) {
        peer.destroy();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const saveMessage = (message: Message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const link =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}#${peer?.id}`
      : "";

  return (
    <div className="flex flex-col h-screen">
      {showLink && (
        <>
          <MessageLink
            link={link}
            wasCopied={wasCopied}
            setWasCopied={setWasCopied}
          />
          <div className="flex justify-center">
            <AnimatedBeamer />
          </div>
        </>
      )}
      {connection && peer && (
        <>
          <div className="flex-grow overflow-auto">
            <Messages messages={messages} />
            <div ref={messagesEndRef} />
          </div>

          <MessageInput
            connection={connection}
            peer={peer}
            saveMessage={saveMessage}
            username={username}
          />
        </>
      )}
    </div>
  );
};

export default Chat;
