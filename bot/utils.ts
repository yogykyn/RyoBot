import { MessageContent, MessageType, RawMessage } from './types';

export function getMessageType(message: RawMessage): MessageType | undefined {
  switch (message.type) {
    case 'imageMessage':
      return 'image';
    case 'videoMessage':
      return 'video';
    case 'audioMessage':
      return 'audio';
    case 'documentMessage':
      return 'document';
    case 'stickerMessage':
      return 'sticker';
    case 'extendedTextMessage':
    case 'conversation':
      return 'text';
    default:
      return;
  }
}

export function getMimeTypeMessage(message: RawMessage): string | undefined {
  if (
    message.type !== 'imageMessage'
    && message.type !== 'videoMessage'
    && message.type !== 'documentMessage'
    && message.type !== 'stickerMessage'
    && message.type !== 'audioMessage'
  ) return;

  const mimeType = message?.message[message.type]?.mimetype;
  return mimeType || undefined;
}

export function getCaption(message: RawMessage): string | undefined {
  if (
    message.type !== 'imageMessage'
    && message.type !== 'videoMessage'
    && message.type !== 'documentMessage'
  ) return;

  const caption = message?.message[message.type]?.caption;
  return caption || undefined;
}

export function getFileResolution(message: RawMessage): { width: number; height: number } | undefined {
  if (
    message.type !== 'imageMessage'
    && message.type !== 'videoMessage'
  ) return;

  const width = message?.message[message.type]?.width;
  const height = message?.message[message.type]?.height;
  return width && height
    ?  { width, height }
    : undefined;
}


export function getMessageContent(message: RawMessage): MessageContent | undefined {
  const messageType = getMessageType(message);

  if (messageType === 'text') {
    return {
      type: 'text',
      body: message.message?.extendedTextMessage?.text || message.message?.conversation || '',
    };
  }

  if (messageType === 'video' || messageType === 'image') {
    const resolution = getFileResolution(message);

    return resolution
      ? {
        type: messageType,
        mime: getMimeTypeMessage(message),
        caption: getCaption(message),
        width: resolution.width,
        height: resolution.height,
      }
      : {
        type: messageType,
        mime: getMimeTypeMessage(message),
        caption: getCaption(message),
      };
  }

  if (messageType === 'document') {
    return {
      type: messageType,
      mime: getMimeTypeMessage(message),
      caption: getCaption(message),
    };
  }

  if (messageType === 'audio' || messageType === 'sticker') {
    return {
      type: messageType,
      mime: getMimeTypeMessage(message),
    };
  }

  return;
}

