import Peer, { DataConnection, MediaConnection } from "peerjs";
import React, { useEffect, useRef, useState } from "react";
import { connectToPeer, createPeer, handleCall } from "@/utils/peerUtils";

import { Message } from "@/types";
import MessageInput from "@/components/message/message-input";
import Messages from "@/components/message/messages-section";
import { useRouter } from "next/router";
import { v4 as uuidv4 } from "uuid";

const Chat: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [messages, setMessages] = useState<Message[]>([]);
  const [connection, setConnection] = useState<DataConnection | null>(null);
  const [peer, setPeer] = useState<Peer | null>(null);
  const [username, setUsername] = useState<string>("");
  const [showLink, setShowLink] = useState<boolean>(false);
  const [incomingCall, setIncomingCall] = useState<{
    type: "audio" | "video";
    peerId: string;
  } | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (id && typeof window !== "undefined") {
      const randomUsername = `user_${uuidv4().substr(0, 8)}`;
      setUsername(randomUsername);
      const peerId = id as string;

      if (window.location.hash) {
        // Joining an existing chat
        const newPeer = new Peer();
        setPeer(newPeer);
        connectToPeer(
          newPeer,
          peerId,
          saveMessage,
          setConnection,
          handleIncomingCall
        );
      } else {
        // Creating a new chat
        const newPeer = createPeer(
          peerId,
          saveMessage,
          setConnection,
          setShowLink,
          setPeer,
          handleIncomingCall
        );
        setPeer(newPeer);
      }
    }
  }, [id]);

  const handleIncomingCall = async (call: MediaConnection, type: "audio" | "video") => {
    setIncomingCall({ type, peerId: call.peer });
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        type === "audio" ? { audio: true } : { video: true, audio: true }
      );
      setLocalStream(stream);
      handleCall(call, stream, saveMessage);
    } catch (err) {
      console.error("Failed to get local stream", err);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && peer && !window.location.hash) {
      const shareLink = `${window.location.origin}/chat/${id}#${peer.id}`;
      saveMessage({
        id: Date.now().toString(),
        text: `🎉 Chat room created!`,
        isSender: true,
        isSystem: true,
        username: "System",
        timestamp: new Date().toISOString(),
        embed: {
          title: "Share this link to invite others",
          description: shareLink,
          color: "#7289DA",
        },
      });
    }
  }, [id, peer]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const saveMessage = (message: Message) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        ...message,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const handleEditUsername = (newUsername: string) => {
    setUsername(newUsername);
    // You might want to broadcast this change to other peers
  };

  return (
    <div className="flex flex-col h-screen p-4">
      <div className="flex-grow overflow-auto">
        <Messages messages={messages} onEditUsername={handleEditUsername} />
        <div ref={messagesEndRef} />
      </div>
      {connection && peer && (
        <MessageInput
          connection={connection}
          peer={peer}
          saveMessage={saveMessage}
          username={username}
          incomingCall={incomingCall}
          setIncomingCall={setIncomingCall}
        />
      )}
    </div>
  );
};

export default Chat;
