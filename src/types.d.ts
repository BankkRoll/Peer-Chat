export interface Message {
  id: string;
  text: string;
  isSender: boolean;
  isSystem?: boolean;
  username?: string;
}
