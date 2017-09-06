const net = require('net');
const DialogProtocol = require('./common').DialogProtocol;


const play = (request) => {
  if (request.action === 'upper') return request.msg.toUpperCase();
  else if (request.action === 'lower') return request.msg.toLowerCase();
};

const server = net.createServer((socket) => {
  const dialog = new DialogProtocol(socket);
  dialog.on('message', (msg) => {
    try {
      const request = JSON.parse(msg.toString('utf8'));
      if (request.action.toUpperCase() === 'QUIT') socket.destroy();
      else {
        const response = play(request);
        if (!response) dialog.sendMessage('Use upper,lower or quit cmd, thanks');
        else dialog.sendMessage(play(request));
      }
    }
    catch (err) {
      dialog.sendMessage(`Error : ${err.message}`);
    }

  });

  socket.on('end', () => {
    //clients.splice(clients.indexOf(socket));
    console.log('end');
  })
});



server.listen(1337,'127.0.0.1');
