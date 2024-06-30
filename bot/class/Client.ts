import { EventEmitter } from 'node:events';
import {
  AnyMessageContent,
  ConnectionState,
  DisconnectReason,
  makeWASocket,
  MiscMessageGenerationOptions,
  proto,
  useMultiFileAuthState,
  WASocket,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import { Message } from './Message';

export type ConnectOptions = {};
export type SendMessageOptions = {
  quoted: Message,
  mentions: string[],
};

export class Client extends EventEmitter {
  private _isConnected: boolean = false;
  private _name: string;
  public wasocket?: WASocket | undefined;
  public filterMessage: (message: Message) => boolean = () => true;
  public logger: pino.Logger = pino();

  public constructor(name: string, logger: pino.Logger) {
    super();

    this._name = name;
    this.logger = logger;
  }

  public async connect(options: ConnectOptions) {
    if (this.wasocket || this._isConnected) return;

    const { state: auth, saveCreds } = await useMultiFileAuthState('auth');
    this.wasocket = makeWASocket({
      auth: auth,
    });

    this.wasocket.ev.on('creds.update', () => saveCreds());
    this.wasocket.ev.on('connection.update', connectionState => this._connectionUpdateHandler(options, connectionState));
    this.wasocket.ev.on('messages.upsert', this._messageUpsertHandler.bind(this));
  }

  private _connectionUpdateHandler(options: ConnectOptions, { connection, qr, lastDisconnect, isNewLogin }: Partial<ConnectionState>) {
    if (typeof qr === 'string') this.emit('qr', qr);

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      this.logger.error('The connection has closed.');

      if (shouldReconnect) this.connect(options);
    } else if (connection === 'open') {
      this.logger.info('The connection has opened.');
      this.emit('ready', this);
    }
  }

  private _messageUpsertHandler({ messages: rawMessages }: { messages: proto.IWebMessageInfo[] }) {
    for (const rawMessage of rawMessages) {
      const message = Message.from(rawMessage);
      if (message) {
        const eventType = rawMessage.key.remoteJid === 'status@broadcast'
          ? 'status_create'
          : 'message_create';
        this.emit(eventType, message);
      }
    }
  }

  public sendMessage(jid: string, content: AnyMessageContent, options?: MiscMessageGenerationOptions): Promise<proto.IWebMessageInfo | void> {
    if (!this.wasocket || !this._isConnected) return Promise.resolve();

    return this.wasocket.sendMessage(jid, content, options);
  }
}
