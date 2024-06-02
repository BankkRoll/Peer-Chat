"use client";

import React, { forwardRef, useRef } from "react";

import { AnimatedBeam } from "@/components/ui/animated-beam";
import { BsRouter } from "react-icons/bs";
import { PersonIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

// eslint-disable-next-line react/display-name
const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white p-3",
        className,
      )}
    >
      {children}
    </div>
  );
});

export function AnimatedBeamer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const div7Ref = useRef<HTMLDivElement>(null);

  const randomBoolean = () => Math.random() >= 0.5;

  return (
    <div
      className="relative flex w-full max-w-2xl items-center justify-center overflow-hidden p-4 animate-fade-in opacity-0 [--animation-delay:800ms]"
      ref={containerRef}
    >
      <div className="flex flex-col items-stretch justify-between w-full h-full gap-10">
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div1Ref}>
            <PersonIcon className="w-10 h-10 text-black" />
          </Circle>
          <Circle ref={div5Ref}>
            <PersonIcon className="w-10 h-10 text-black" />
          </Circle>
        </div>
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div2Ref}>
            <PersonIcon className="w-10 h-10 text-black" />
          </Circle>
          <Circle ref={div4Ref} className="w-16 h-16">
            <BsRouter className="w-10 h-10 text-black" />
          </Circle>
          <Circle ref={div6Ref}>
            <PersonIcon className="w-10 h-10 text-black" />
          </Circle>
        </div>
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div3Ref}>
            <PersonIcon className="w-10 h-10 text-black" />
          </Circle>
          <Circle ref={div7Ref}>
            <PersonIcon className="w-10 h-10 text-black" />
          </Circle>
        </div>
      </div>

      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div4Ref}
        curvature={-75}
        endYOffset={-10}
        bidirectional={randomBoolean()}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div2Ref}
        toRef={div4Ref}
        bidirectional={randomBoolean()}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div3Ref}
        toRef={div4Ref}
        curvature={75}
        endYOffset={10}
        bidirectional={randomBoolean()}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div5Ref}
        toRef={div4Ref}
        curvature={-75}
        reverse
        endYOffset={-10}
        bidirectional={randomBoolean()}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div6Ref}
        toRef={div4Ref}
        reverse
        bidirectional={randomBoolean()}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div7Ref}
        toRef={div4Ref}
        curvature={75}
        reverse
        endYOffset={10}
        bidirectional={randomBoolean()}
      />
    </div>
  );
}
