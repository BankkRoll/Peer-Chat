"use client";

import * as React from "react";

interface UseAutosizeTextAreaProps {
  textAreaRef: HTMLTextAreaElement | null;
  minHeight?: number;
  maxHeight?: number;
  triggerAutoSize: string;
}

export const useAutosizeTextArea = ({
  textAreaRef,
  triggerAutoSize,
  maxHeight = Number.MAX_SAFE_INTEGER,
  minHeight = 0,
}: UseAutosizeTextAreaProps) => {
  React.useEffect(() => {
    const offsetBorder = 2;
    if (textAreaRef) {
      textAreaRef.style.minHeight = `${minHeight + offsetBorder}px`;
      textAreaRef.style.maxHeight = `${maxHeight}px`;

      if (triggerAutoSize === "") {
        textAreaRef.style.height = `${minHeight + offsetBorder}px`;
      } else {
        textAreaRef.style.height = "auto";
        const scrollHeight = textAreaRef.scrollHeight;
        if (scrollHeight > maxHeight) {
          textAreaRef.style.height = `${maxHeight}px`;
        } else {
          textAreaRef.style.height = `${scrollHeight + offsetBorder}px`;
        }
      }
    }
  }, [textAreaRef, triggerAutoSize, maxHeight, minHeight]);
};
