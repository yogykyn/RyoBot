import { proto } from '@whiskeysockets/baileys';

export type MessageType = 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'sticker';

export type MessageContent = { type: 'text'; body: string; }
  | {
      type: 'document';
      mime?: string | undefined;
      caption?: string;
    }
  | {
      type: 'sticker' | 'audio';
      mime?: string | undefined;
    }
  | {
    type: 'image'
      | 'video';
    mime?: string | undefined;
    caption?: string;
    width?: number | undefined;
    height?: number | undefined;
  };

export type RawMessage = {
  message: proto.IMessage,
  type?: keyof proto.IMessage | undefined,
};
