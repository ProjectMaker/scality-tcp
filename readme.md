# Server Tcp
The first packet indicates the length of the message.

The client send a json message , ex :
```
{ action: "upper", msg: "hello" }
{ action: "lower", msg: "Hello" }
{ action: "quit" }
```

Server return result

## Launch server
npm run start:server

## Launch client
npm run start:client