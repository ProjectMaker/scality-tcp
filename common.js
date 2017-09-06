const Buffer = require('buffer').Buffer;
const EventEmitter = require('events');
const ReadableString = require("readable-string");
const rot13 = require("rot13-transform");

const INT32_BYTES_LENGTH = 4;

class DialogProtocol extends EventEmitter {
  constructor(socket) {
    super();
    this.socket = socket;
    this._subscribe();

    this.on('encrypted', (msg) => {
      this._write(msg);
    });

    this.on('decrypted', (msg) => {
      this.emit('message', msg.toString('utf8'));
    })
  }

  sendMessage(msg) {
    this._encrypt(msg);
  }

  _subscribe() {
    let msg = '';
    let sizeMsg = 0;
    this.socket.on('data', (data) => {
      if (sizeMsg === 0) {
        sizeMsg = data.readInt32BE();
        // remove Int32BE ( 4 bytes )
        msg = data.slice(INT32_BYTES_LENGTH);
      } else msg += data;

      if (msg.length === sizeMsg) {
        this._decrypt(msg.toString('utf8'));
        sizeMsg = 0;
        msg = '';
      }
    });
  }

  _encrypt(msg) {
    const stream = ReadableString(msg, { encoding: 'utf8'})
      .pipe(rot13());
    let message = '';
    stream.on('readable', () => {
      let buffer;
      while (buffer = stream.read()) message += buffer;
    })
    stream.on('end', () => {
      this.emit('encrypted', message);
    })
  }

  _decrypt(msg) {
    const stream = ReadableString(msg, { encoding: 'utf8'})
      .pipe(rot13())
    let message = '';
    stream.on('readable', () => {
      let buffer;
      while (buffer = stream.read()) message += buffer;
    })
    stream.on('end', () => {
      this.emit('decrypted', message);
    })
  }

  _write(msg) {
    const bufferSize = Buffer.allocUnsafe(INT32_BYTES_LENGTH );
    bufferSize.writeInt32BE(Buffer.byteLength(msg, 'utf8'));
    this.socket.write(bufferSize);
    this.socket.write(msg);
  }
}

module.exports = {
  DialogProtocol
};