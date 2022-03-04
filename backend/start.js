#!/usr/bin/env node

'use strict';

// Hack: react-devtools-inline expects "window" to be defined.
global.window = global;

const {
  activate,
  createBridge,
  initialize,
} = require('react-devtools-inline/backend');
const { createServer } = require('http');
const SocketIO = require('socket.io');

const HOST = 'localhost';
const PORT = 9898;
const UID = 123456;

// This should be called before any React renderer (e.g. React Native) is required/initialized.
initialize(global);

const server = createServer();
const socket = SocketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: [],
    credentials: true
  }
});
socket.on('connection', client => {
  console.log("Socket connected");

  const wall = {
    listen(listener) {
      client.on('message', data => {
        console.log('client.on("message") data:\n', data);

        if (data.uid === UID) {
          listener(data);
        }
      });
    },
    send(event, payload) {
      const data = {event, payload, uid: UID};

      console.log('client.emit("message"):\n', data);

      client.emit('message', data);
    },
  };

  const bridge = createBridge(global, wall);

  client.on('disconnect', () => {
    console.log('Socket client disconnected');

    bridge.shutdown();
  });

  activate(global, { bridge });
});
socket.listen(PORT);
