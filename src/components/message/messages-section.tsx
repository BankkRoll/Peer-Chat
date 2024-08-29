import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Message } from "@/types";
import React from "react";
import { format } from "date-fns";

interface MessagesProps {
  messages: Message[];
  onEditUsername: (newUsername: string) => void;
}

const Messages: React.FC<MessagesProps> = ({ messages, onEditUsername }) => {
  const renderMessageContent = (text: string | undefined) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, index) =>
      urlRegex.test(part) ? (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {part}
        </a>
      ) : (
        part
      )
    );
  };

  return (
    <div className="messages p-4 max-h-[90svh] overflow-y-auto">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${
            message.isSender ? "justify-end" : "justify-start"
          } mb-4`}
        >
          {message.isSystem ? (
            <div className="w-full">
              <div className="bg-[#36393F] text-white rounded-md p-4 shadow-md">
                <div className="font-semibold text-[#7289DA] mb-2">
                  System Message
                </div>
                <div className="text-sm">
                  {renderMessageContent(message.text)}
                </div>
                {message.embed && (
                  <div
                    className="mt-2 border-l-4 pl-3"
                    style={{ borderColor: message.embed.color }}
                  >
                    <h3 className="font-bold text-[#7289DA]">
                      {message.embed.title}
                    </h3>
                    <p className="text-sm">
                      {renderMessageContent(message.embed.description)}
                    </p>
                    {message.embed.fields && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {message.embed.fields.map((field, fieldIndex) => (
                          <div
                            key={fieldIndex}
                            className={
                              field.inline ? "col-span-1" : "col-span-2"
                            }
                          >
                            <span className="font-semibold text-[#7289DA]">
                              {field.name}:
                            </span>{" "}
                            <span className="text-sm">{field.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              className={`flex gap-2 ${
                message.isSender ? "flex-row-reverse" : "flex-row"
              } items-end`}
            >
              <Avatar className="w-8 h-8 mr-2">
                <AvatarImage
                  src={`https://api.dicebear.com/6.x/initials/svg?seed=${message.username}`}
                />
              </Avatar>
              <div
                className={`px-4 py-2 rounded-2xl ${
                  message.isSender
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-900"
                } max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg`}
              >
                <div
                  className="font-semibold text-sm cursor-pointer hover:underline"
                  onClick={() =>
                    message.isSender &&
                    onEditUsername(
                      prompt("Enter new username:") || message.username
                    )
                  }
                >
                  {message.username}
                </div>
                <div className="mt-1">{renderMessageContent(message.text)}</div>
                {message.timestamp && (
                  <div
                    className={`text-xs mt-1 ${
                      message.isSender ? "text-blue-200" : "text-gray-500"
                    }`}
                  >
                    {format(new Date(message.timestamp), "HH:mm")}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Messages;
