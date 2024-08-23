// src/components/message/messages-section.tsx
import { Message } from "@/types";
import React from "react";

interface MessagesProps {
  messages: Message[];
}

const Messages: React.FC<MessagesProps> = ({ messages }) => {
  return (
    <div className="messages p-4 max-h-[90svh] overflow-y-auto">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${
            message.isSender ? "justify-end" : "justify-start"
          } mb-2`}
        >
          <div
            className={`px-4 py-2 rounded-lg ${
              message.isSystem
                ? "bg-gray-300 text-gray-800"
                : message.isSender
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-900"
            }`}
            style={{ maxWidth: "80%", wordWrap: "break-word" }}
          >
            {message.isSystem ? (
              <span className="italic">{message.text}</span>
            ) : (
              <>
                <div className="font-bold text-sm">
                  {message.username || (message.isSender ? "You" : "Other")}
                </div>
                <div>{message.text}</div>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Messages;
