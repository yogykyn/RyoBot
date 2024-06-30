import { readFile } from 'node:fs/promises';
import { Transform } from 'node:stream';
import mime from 'mime';

export type MessageMediaContent = string | URL | Transform | Buffer;
export class MessageMedia {
  public constructor(
    public mimeType: string,
    public data: MessageMediaContent,
    public fileName?: string | undefined,
    public fileSize?: string | undefined,
  ) {}

  static async fromFilePath(path: string): Promise<MessageMedia> {
    const mimeType = mime.getType(path) ?? 'application/octet-stream';
    const data = await readFile(path);

    return new MessageMedia(mimeType, data);
  }

  static async fromUrl(url: string, mimeType: string): Promise<MessageMedia> {
    return new MessageMedia(mimeType, url);
  }
}
