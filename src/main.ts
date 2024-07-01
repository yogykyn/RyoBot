import qr from 'qrcode-terminal';
import { Client } from '@/class/Client';
import { Logger } from '@/logger';
import { Browsers } from '@whiskeysockets/baileys';

async function startBot(config: any, usePairingCode: boolean, phoneNumber: string) {
  const client = new Client(config.botName, Logger);

  if (!usePairingCode) {
    client.on('qr', (qrcode: string) => {
        process.stdout.write(`Pindai kode QR ini untuk menautkan bot ke nomor telepon atau akun whatsapp.\n`);
        process.stdout.write(`Baca https://faq.whatsapp.com/1317564962315842/?helpref=uf_share untuk informasi lebih lanjut.\n`);
        qr.generate(qrcode, { small: true })
    });
  } else {
    client.on('new_connection', () => {
      // setTimeout is used to fix the 'Precondition Required' error when requesting pairing code
      // https://github.com/WhiskeySockets/Baileys/issues/835
      setTimeout(async () => {
        if (!client.wasocket) return;
        const pairingCode = await client.wasocket.requestPairingCode(phoneNumber);
        process.stdout.write(`Gunakan kode ini untuk menautkan bot ke nomor telepon atau akun whatsapp.\n`);
        process.stdout.write(`Baca https://faq.whatsapp.com/1324084875126592/?helpref=uf_share untuk informasi lebih lanjut.\n`);
        process.stdout.write(`Kode : ${pairingCode}.\n`);
      }, 3000);
    });
  }

  await client.connect({
    browser: Browsers.appropriate(config.botName),
  });
}
