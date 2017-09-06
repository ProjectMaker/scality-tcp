const readline = require('readline');
const net = require('net');

const DialogProtocol = require('./common').DialogProtocol;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class Client {
  connect() {
    this.socket = new net.Socket();
    this.dialog = new DialogProtocol(this.socket);

    this.socket.connect(1337, '127.0.0.1', () => {
      this.dialog.on('message', (msg) => {
        console.log(msg);
        this.askCmd();
      });
    });

    this.socket.on('close', () => {
      console.log('Connection closed');
      rl.close();
    });

  }

  _parseCmd(cmd) {
    const endActionIdx = cmd.indexOf(' ');
    if (endActionIdx === -1) return { action: cmd }
    else return { action: cmd.substr(0, endActionIdx), msg: cmd.substr(endActionIdx + 1) }
  }

  askCmd() {
    let to = [];
    let message = '';
    rl.question('Enter command : ', (cmd) => {
      const msg = JSON.stringify(this._parseCmd(cmd));
      this.dialog.sendMessage(msg);
    });
  }
}


const client = new Client();
client.connect();
client.askCmd();