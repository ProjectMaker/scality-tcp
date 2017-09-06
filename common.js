const Buffer = require('buffer').Buffer;
const EventEmitter = require('events');
const INT32_BYTES_LENGTH = 4;

class DialogProtocol extends EventEmitter {
  constructor(socket) {
    super();
    this.socket = socket;
    this.subscribe();
  }

  subscribe() {
    let msg = '';
    let sizeMsg = 0;
    this.socket.on('data', (data) => {
      if (sizeMsg === 0) {
        sizeMsg = data.readInt32BE();
        // remove Int32BE ( 4 bytes )
        msg = data.slice(INT32_BYTES_LENGTH);
      } else msg += data;

      if (msg.length === sizeMsg) {
        this.emit('message', msg.toString('utf8'));
        sizeMsg = 0;
        msg = '';
      }
    });
  }

  sendMessage(msg) {
    // write msg size on Int32BE, it's first packet
    const bufferSize = Buffer.allocUnsafe(INT32_BYTES_LENGTH );
    bufferSize.writeInt32BE(Buffer.byteLength(msg, 'utf8'));
    this.socket.write(bufferSize);
    this.socket.write(msg);
  }
}

module.exports = {
  DialogProtocol
};