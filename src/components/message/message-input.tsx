import { AutosizeTextAreaRef, AutosizeTextarea } from "../ui/autosize-textarea";
import { BiMicrophone, BiPhoneOutgoing, BiVideo } from "react-icons/bi";
import { DataConnection, MediaConnection, Peer } from "peerjs";
import React, { useEffect, useRef, useState } from "react";

import { BsXCircle } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import { Message } from "@/types";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";

interface MessageInputProps {
  connection: DataConnection;
  peer: Peer;
  saveMessage: (message: Message) => void;
  username: string;
  incomingCall: { type: "audio" | "video"; peerId: string } | null;
  setIncomingCall: React.Dispatch<
    React.SetStateAction<{ type: "audio" | "video"; peerId: string } | null>
  >;
}

const MessageInput: React.FC<MessageInputProps> = ({
  connection,
  peer,
  saveMessage,
  username,
  incomingCall,
  setIncomingCall,
}) => {
  const textareaRef = useRef<AutosizeTextAreaRef>(null);
  const [currentCall, setCurrentCall] = useState<{
    type: "audio" | "video";
    call: MediaConnection;
    startTime: Date;
  } | null>(null);
  const [callDuration, setCallDuration] = useState<string>("00:00");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isCallInitiating, setIsCallInitiating] = useState<boolean>(false);

  const sendMessage = () => {
    if (textareaRef.current?.textArea.value.trim()) {
      const messageText = textareaRef.current.textArea.value.trim();
      const message: Message = {
        id: Date.now().toString(),
        text: messageText,
        isSender: true,
        username: username,
        timestamp: new Date().toISOString(),
      };
      textareaRef.current.textArea.value = "";
      saveMessage(message);
      connection.send(JSON.stringify(message));
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const initiateCall = async (type: "audio" | "video") => {
    try {
      setIsCallInitiating(true);
      const stream = await navigator.mediaDevices.getUserMedia(
        type === "audio" ? { audio: true } : { video: true, audio: true }
      );
      setLocalStream(stream);
      connection.send(
        JSON.stringify({ callRequest: { type, peerId: peer.id } })
      );

      // Listen for the answer from the other peer
      peer.on("call", (call) => {
        call.answer(stream);
        handleCall(call, type);
      });
    } catch (err) {
      console.error("Failed to get local stream", err);
      setIsCallInitiating(false);
    }
  };

  const acceptCall = async () => {
    if (incomingCall) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(
          incomingCall.type === "audio"
            ? { audio: true }
            : { video: true, audio: true }
        );
        setLocalStream(stream);
        const call = peer.call(incomingCall.peerId, stream);
        handleCall(call, incomingCall.type);
        setIncomingCall(null);
      } catch (err) {
        console.error("Failed to get local stream", err);
      }
    }
  };

  const handleCall = (call: MediaConnection, type: "audio" | "video") => {
    setCurrentCall({ type, call, startTime: new Date() });
    setIsCallInitiating(false);
    call.on("stream", (remoteStream) => {
      handleRemoteStream(remoteStream, type);
    });
    call.on("close", endCall);
  };

  const handleRemoteStream = (
    remoteStream: MediaStream,
    type: "audio" | "video"
  ) => {
    const mediaElement = document.getElementById(
      type === "audio" ? "remoteAudio" : "remoteVideo"
    ) as HTMLMediaElement;
    if (mediaElement) {
      mediaElement.srcObject = remoteStream;
      mediaElement
        .play()
        .catch((error) => console.error("Error playing media:", error));
    }
  };

  const endCall = () => {
    if (currentCall?.call) {
      currentCall.call.close();
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    setCurrentCall(null);
    setCallDuration("00:00");
    setLocalStream(null);
    setIsCallInitiating(false);
  };

  const rejectCall = () => {
    if (incomingCall) {
      connection.send(
        JSON.stringify({ callRejected: true, peerId: incomingCall.peerId })
      );
      setIncomingCall(null);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full p-2 bg-background">
      {incomingCall && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center text-white bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="text-center">
            <p className="mb-4 text-xl">Incoming {incomingCall.type} call</p>
            <div className="flex justify-center space-x-8">
              <Button
                variant="outline"
                onClick={acceptCall}
                className="flex items-center justify-center w-16 h-16 text-white bg-green-500 rounded-full"
              >
                {incomingCall.type === "audio" ? (
                  <BiMicrophone size={24} />
                ) : (
                  <BiVideo size={24} />
                )}
              </Button>
              <Button
                variant="outline"
                onClick={rejectCall}
                className="flex items-center justify-center w-16 h-16 text-white bg-red-500 rounded-full"
              >
                <BsXCircle />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
      {(currentCall || isCallInitiating) && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center text-white bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <audio id="remoteAudio" className="hidden"></audio>
          <video
            id="remoteVideo"
            className={
              currentCall?.type === "video" ? "w-full max-w-lg" : "hidden"
            }
            playsInline
            autoPlay
            poster={
              currentCall?.type === "video"
                ? undefined
                : `https://api.dicebear.com/6.x/initials/svg?seed=${username}`
            }
          />
          {isCallInitiating ? (
            <p className="mb-4 text-xl">Calling...</p>
          ) : (
            <p className="mb-4 text-xl">
              {currentCall?.type === "audio" ? "Audio" : "Video"} call -{" "}
              {callDuration}
            </p>
          )}
          <Button
            variant="outline"
            onClick={endCall}
            className="flex items-center justify-center w-16 h-16 text-white bg-red-500 rounded-full"
          >
            <BsXCircle />
          </Button>
        </motion.div>
      )}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={() => initiateCall("video")}
          disabled={currentCall !== null || isCallInitiating}
        >
          <BiVideo />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={() => initiateCall("audio")}
          disabled={currentCall !== null || isCallInitiating}
        >
          <BiPhoneOutgoing />
        </Button>
        <AutosizeTextarea
          name="userInput"
          placeholder="Type your message"
          autoComplete="off"
          autoCapitalize="on"
          spellCheck="true"
          required
          maxLength={200}
          ref={textareaRef}
          onKeyDown={handleKeyDown}
          className="flex-grow pr-12"
        />
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={sendMessage}
        >
          <PaperPlaneIcon />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
