import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaDescription,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@/components/ui/credenza";

import AnimatedShinyText from "@/components/ui/animated-shiny-text";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Input } from "@/components/ui/input";
import QRCode from "react-qr-code";
import React from "react";
import { cn } from "@/lib/utils";

interface MessageLinkProps {
  link: string;
  wasCopied: boolean;
  setWasCopied: (wasCopied: boolean) => void;
}

const MessageLink: React.FC<MessageLinkProps> = ({
  link,
  wasCopied,
  setWasCopied,
}) => {
  const copyToClipboard = () => {
    setWasCopied(true);
    setTimeout(() => {
      setWasCopied(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 mx-auto">
      <div
        className={cn(
          "group rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800",
        )}
      >
        <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
          <span>✨ Peer Network Chat</span>
          <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
        </AnimatedShinyText>
      </div>
      <h1 className="bg-gradient-to-br from-white from-30% to-white/40 bg-clip-text py-6 text-5xl font-medium leading-none tracking-tighter text-transparent text-center sm:text-6xl md:text-7xl lg:text-8xl animate-fade-in opacity-0 [--animation-delay:200ms]">
        Stay Connected
        <br className="hidden md:block" /> Without the Internet
      </h1>
      <p className="mb-12 text-lg tracking-tight text-gray-400 md:text-xl text-center animate-fade-in opacity-0 [--animation-delay:400ms]">
        Chat with others on the same WiFi network. No internet required.
        <br className="hidden md:block" /> Perfect for staying in touch in
        remote locations.
      </p>
      <div className="flex items-center justify-center mb-4 animate-fade-in opacity-0 [--animation-delay:600ms]">
        <Input
          className="flex-grow mx-2 md:w-[55svw] lg:w-[45svw] xl:w-[30svw] 2xl:w-[28svw]"
          value={link}
          readOnly
        />
        <CopyToClipboard text={link} onCopy={copyToClipboard}>
          <Button className="mx-2">{wasCopied ? "Copied!" : "Copy"}</Button>
        </CopyToClipboard>
        <Credenza>
          <CredenzaTrigger asChild>
            <Button className="mx-2">View QR</Button>
          </CredenzaTrigger>
          <CredenzaContent>
            <CredenzaHeader>
              <CredenzaTitle>QR Code</CredenzaTitle>
              <CredenzaDescription>
                Use this QR code to allow other peers to connect to your chat.
              </CredenzaDescription>
            </CredenzaHeader>
            <CredenzaBody>
              <div className="flex justify-center p-6 bg-white rounded shadow-md">
                <QRCode
                  value={link}
                  size={300}
                  bgColor="#FFFFFF"
                  fgColor="#2C3E50"
                  level="H"
                />
              </div>
            </CredenzaBody>
          </CredenzaContent>
        </Credenza>
      </div>
    </div>
  );
};

export default MessageLink;
