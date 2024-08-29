// src/pages/index.tsx
import { AnimatedBeamer } from "@/components/home/beam";
import AnimatedShinyText from "@/components/ui/animated-shiny-text";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import React from "react";
import { cn } from "@/lib/utils";
import { generatePeerId } from "@/utils/peerUtils"; // Import the utility function
import { useRouter } from "next/router";

const Home = () => {
  const router = useRouter();

  const startChat = () => {
    const chatId = generatePeerId(); // Use the utility function to generate the ID
    router.push(`/chat/${chatId}`);
  };

  return (
    <div className="flex flex-col w-full min-h-screen items-center justify-center m-auto">
      <div className="flex flex-col items-center justify-center p-4 mx-auto">
        <div
          className={cn(
            "group rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800"
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
        <div className="animate-fade-in opacity-0 [--animation-delay:600ms]">
          <Button onClick={startChat} className="text-lg px-8 py-4">
            Start Chat
          </Button>
        </div>
      </div>
      <div className="flex w-full justify-center">
        <AnimatedBeamer />
      </div>
    </div>
  );
};

export default Home;
