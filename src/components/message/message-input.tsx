// src/components/message/message-input.tsx
import { AutosizeTextAreaRef, AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { BiPhoneOutgoing, BiVideo } from "react-icons/bi";
import { DataConnection, MediaConnection, Peer } from "peerjs";
import React, { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Message } from "@/types";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";

interface MessageInputProps {
  connection: DataConnection;
  peer: Peer;
  saveMessage: (message: Message) => void;
  username: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  connection,
  peer,
  saveMessage,
  username,
}) => {
  const textareaRef = useRef<AutosizeTextAreaRef>(null);
  const [isFirstEnter, setIsFirstEnter] = useState(false);
  const [incomingCall, setIncomingCall] = useState<{
    type: "audio" | "video";
    peerId: string;
  } | null>(null);
  const [currentCall, setCurrentCall] = useState<{
    type: "audio" | "video";
    call: MediaConnection;
    startTime: Date;
  } | null>(null);
  const [callDuration, setCallDuration] = useState<string>("00:00");

  const sendMessage = () => {
    if (textareaRef.current?.textArea) {
      const messageText = textareaRef.current.textArea.value.trim();
      if (messageText.length > 0) {
        const message = {
          text: messageText,
          username: username,
        };
        textareaRef.current.textArea.value = "";
        textareaRef.current.textArea.style.height = "52px";
        saveMessage({
          id: Date.now().toString(),
          text: messageText,
          isSender: true,
          username: username,
        });
        connection.send(JSON.stringify(message));
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      if (isFirstEnter) {
        event.preventDefault();
        sendMessage();
        setIsFirstEnter(false);
      } else {
        setIsFirstEnter(true);
      }
    } else {
      setIsFirstEnter(false);
    }
  };

  const updateCallDuration = (startTime: Date) => {
    const now = new Date();
    const diff = now.getTime() - startTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    setCallDuration(
      `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`,
    );
  };

  const initiateCall = (type: "audio" | "video") => {
    const mediaOptions =
      type === "audio" ? { audio: true } : { video: true, audio: true };
    navigator.mediaDevices
      .getUserMedia(mediaOptions)
      .then((stream) => {
        const callRequest = { type, peerId: peer.id };
        connection.send(JSON.stringify({ callRequest }));

        peer.on("call", (call) => {
          call.answer(stream);
          setCurrentCall({ type, call, startTime: new Date() });
          call.on("stream", (remoteStream) => {
            if (type === "audio") {
              const audioElement = document.getElementById(
                "remoteAudio",
              ) as HTMLAudioElement;
              if (audioElement) {
                audioElement.srcObject = remoteStream;
                audioElement.play();
              }
            } else {
              const videoElement = document.getElementById(
                "remoteVideo",
              ) as HTMLVideoElement;
              if (videoElement) {
                videoElement.srcObject = remoteStream;
                videoElement.play();
                videoElement.classList.remove("hidden");
              }
            }
          });
          call.on("close", () => {
            setCurrentCall(null);
            const videoElement = document.getElementById(
              "remoteVideo",
            ) as HTMLVideoElement;
            if (videoElement) {
              videoElement.classList.add("hidden");
            }
          });
        });
      })
      .catch((err) => {
        console.error("Failed to get local stream", err);
      });
  };

  const acceptCall = (type: "audio" | "video", peerId: string) => {
    const mediaOptions =
      type === "audio" ? { audio: true } : { video: true, audio: true };
    navigator.mediaDevices
      .getUserMedia(mediaOptions)
      .then((stream) => {
        const call = peer.call(peerId, stream);
        setCurrentCall({ type, call, startTime: new Date() });
        call.on("stream", (remoteStream) => {
          if (type === "audio") {
            const audioElement = document.getElementById(
              "remoteAudio",
            ) as HTMLAudioElement;
            if (audioElement) {
              audioElement.srcObject = remoteStream;
              audioElement.play();
            }
          } else {
            const videoElement = document.getElementById(
              "remoteVideo",
            ) as HTMLVideoElement;
            if (videoElement) {
              videoElement.srcObject = remoteStream;
              videoElement.play();
              videoElement.classList.remove("hidden");
            }
          }
        });
        call.on("close", () => {
          setCurrentCall(null);
          const videoElement = document.getElementById(
            "remoteVideo",
          ) as HTMLVideoElement;
          if (videoElement) {
            videoElement.classList.add("hidden");
          }
        });
      })
      .catch((err) => {
        console.error("Failed to get local stream", err);
      });
  };

  const handleIncomingMessage = (data: string) => {
    try {
      const message = JSON.parse(data);
      if (message.callRequest) {
        const { type, peerId } = message.callRequest;
        setIncomingCall({ type, peerId });
      }
    } catch (err) {
      console.error("Failed to parse incoming message", err);
    }
  };

  useEffect(() => {
    connection.on("data", (data) => {
      handleIncomingMessage(data as string);
    });
  }, [connection]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentCall) {
      timer = setInterval(() => {
        updateCallDuration(currentCall.startTime);
      }, 1000);
    } else {
      setCallDuration("00:00");
    }
    return () => clearInterval(timer);
  }, [currentCall]);

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
            <p className="mb-4 text-xl">
              Incoming {incomingCall.type} call from {incomingCall.peerId}
            </p>
            <div className="flex justify-center space-x-8">
              <Button
                variant="outline"
                onClick={() => {
                  acceptCall(incomingCall.type, incomingCall.peerId);
                  setIncomingCall(null);
                }}
                className="flex items-center justify-center w-16 h-16 text-white bg-green-500 rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
              <Button
                variant="outline"
                onClick={() => setIncomingCall(null)}
                className="flex items-center justify-center w-16 h-16 text-white bg-red-500 rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
      {currentCall && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 text-white bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <audio id="remoteAudio" className="hidden"></audio>
          <video
            id="remoteVideo"
            className="hidden"
            width="300"
            height="300"
            controls
          ></video>
          <p className="mb-4 text-xl">
            In a {currentCall.type} call - {callDuration}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              if (currentCall && currentCall.call) {
                currentCall.call.close();
              }
              setCurrentCall(null);
              const videoElement = document.getElementById("remoteVideo");
              if (videoElement) {
                videoElement.classList.add("hidden");
              }
            }}
            className="flex items-center justify-center w-16 h-16 text-white bg-red-500 rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </motion.div>
      )}
      <Button
        variant="outline"
        size="icon"
        className="absolute p-1 rounded-full right-24 bottom-4 md:right-28"
        onClick={() => initiateCall("video")}
      >
        <BiVideo />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="absolute p-1 rounded-full right-16 bottom-4 md:right-20"
        onClick={() => initiateCall("audio")}
      >
        <BiPhoneOutgoing />
      </Button>
      <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
        <AutosizeTextarea
          name="userInput"
          placeholder="Type your message"
          autoComplete="off"
          autoCapitalize="on"
          spellCheck="true"
          required
          maxHeight={200}
          ref={textareaRef}
          onKeyDown={handleKeyDown}
          className="pr-12"
        />
        <Button
          variant="outline"
          size="icon"
          className="absolute p-1 rounded-full right-4 bottom-4 md:right-8"
          onClick={sendMessage}
        >
          <PaperPlaneIcon />
        </Button>
      </form>
    </div>
  );
};

export default MessageInput;