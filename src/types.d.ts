// src/types/index.ts
export interface Message {
  id: string;
  text: string;
  isSender: boolean;
  username: string;
  isSystem?: boolean;
  timestamp?: string;
  embed?: {
    title: string;
    description: string;
    color: string;
    fields?: Array<{
      name: string;
      value: string;
      inline?: boolean;
    }>;
  };
}
