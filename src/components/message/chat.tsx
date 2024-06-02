import Messages, { Message } from "@/components/message/messages-section";
import Peer, { DataConnection } from "peerjs";
import React, { useEffect, useRef, useState } from "react";
import { connectToPeer, createPeer, generatePeerId } from "@/utils/peerUtils";

import { AnimatedBeamer } from "@/components/home/beam";
import MessageInput from "@/components/message/message-input";
import MessageLink from "@/components/message/message-link";

interface ChatProps {
  username: string;
}

const Chat: React.FC<ChatProps> = ({ username }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connection, setConnection] = useState<DataConnection | null>(null);
  const [peer, setPeer] = useState<Peer | null>(null);
  const [showLink, setShowLink] = useState<boolean>(false);
  const [wasCopied, setWasCopied] = useState<boolean>(false);
  const peerId = generatePeerId(username);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const targetPeerId = window.location.hash.slice(1);
    if (targetPeerId) {
      const newPeer = new Peer(peerId);
      setPeer(newPeer);
      connectToPeer(
        newPeer,
        targetPeerId,
        saveMessage,
        setConnection,
        connection,
      );
    } else {
      createPeer(peerId, saveMessage, setConnection, setShowLink, setPeer);
    }

    // Clean up peer instance on unmount
    return () => {
      if (peer && !peer.destroyed) {
        peer.destroy();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const saveMessage = (message: Message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
    setTimeout(() => {
      scrollToBottom();
    }, 1);
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  let link =
    typeof window !== "undefined"
      ? window.location.href + `#${peerId}`
      : `#${peerId}`;

  return (
    <div>
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
      <div className="flex-grow mx-auto overflow-auto">
        <Messages messages={messages} />
        <div ref={messagesEndRef} />
      </div>
      {connection && peer && (
        <MessageInput
          connection={connection}
          peer={peer}
          saveMessage={saveMessage}
        />
      )}
    </div>
  );
};

export default Chat;
