import React from "react";

export interface Message {
  id: string;
  text: string;
  isSender: boolean;
  isSystem?: boolean;
}

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
              message.isSender
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-900"
            }`}
            style={{ maxWidth: "80%", wordWrap: "break-word" }}
          >
            {message.text}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Messages;
