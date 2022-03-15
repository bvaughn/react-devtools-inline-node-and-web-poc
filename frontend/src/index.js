import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createBridge,
  createStore,
  initialize as createDevTools,
} from 'react-devtools-inline/frontend';
import { io } from "socket.io-client";

const HOST = 'localhost';
const PORT = 9898;
const UID = 123456;

let root = null;

const socket = io(`http://${HOST}:${PORT}`);
socket.on("connect", () => {
  console.log('Socket connected:', socket.id);

  const wall = {
    listen(listener) {
      socket.on("message", (data) => {
        console.log('socket.on("message") data:\n', data);

        if (data.uid === UID) {
          listener(data);
        }
      });
    },
    send(event, payload) {
      const data = { event, payload, uid: UID };

      console.log('socket.emit("message") data:\n', data);

      socket.emit('message', data);
    },
  };

  const bridge = createBridge(window, wall);
  const store = createStore(bridge);
  const DevTools = createDevTools(window, { bridge, store });

  root = createRoot(document.getElementById('root'));
  root.render(createElement(DevTools));
});
socket.on("disconnect", () => {
  console.log('Socket disconnected');

  if (root) {
    root.unmount();
    root = null;
  }
});

