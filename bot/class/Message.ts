import {
  downloadMediaMessage,
  getContentType,
  proto,
} from '@whiskeysockets/baileys';
import { Transform } from 'stream';
import { MessageContent, MessageType } from '../types';
import { getMessageContent } from '../utils';

export class Message {
  public hasQuotedMessage: boolean;

  public constructor(
    public _raw: proto.IWebMessageInfo,
    public type: MessageType,
    public messageId: string,
    public jid: string,
    public fromMe: boolean,
    public createdAt: number | Long.Long,
    public content: MessageContent,
  ) {
    this.hasQuotedMessage = content.type === 'text'
      && !!_raw.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  };

  public downloadMedia(type: 'buffer' | 'stream'): Promise<Buffer | Transform> {
    return downloadMediaMessage(this._raw, type, {});
  }

  public getMentions(): string[] {
    return this._raw.message?.extendedTextMessage?.contextInfo?.mentionedJid ?? [];
  }

  public getQuotedMessage(): MessageContent | undefined {
    const quotedMessage = this._raw.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!this.hasQuotedMessage || !quotedMessage) return;

    return getMessageContent({
      message: quotedMessage,
      type: getContentType(quotedMessage),
    });
  }

  static from(message: proto.IWebMessageInfo): Message | undefined {
    if (!message?.message || !message?.key?.remoteJid || !message?.key?.id) return;

    const messageContent = getMessageContent({
      message: message.message,
      type: getContentType(message.message),
    });

    const isMessageContentValid = !messageContent || !messageContent?.type;
    if (isMessageContentValid) return;

    return new Message(
      message,
      messageContent.type,
      message.key.id,
      message.key.remoteJid,
      message.key.fromMe ?? false,
      message.messageTimestamp ?? Date.now(),
      messageContent,
    );
  }
}
