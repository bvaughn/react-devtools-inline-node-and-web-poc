import { useEffect, useState } from 'react';
import {
  createBridge,
  createStore,
  initialize as createDevTools,
} from 'react-devtools-inline/frontend';
import { io } from "socket.io-client";

const HOST = 'localhost';
const PORT = 9898;
const UID = 123456;

function App() {
  const [DevTools, setDevTools] = useState(null);

  useEffect(() => {
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

      setDevTools(createDevTools(window, { bridge, store }));
    });
    socket.on("disconnect", () => {
      console.log('Socket disconnected');
      setDevTools(null);
    });
  }, []);

  return DevTools ? <DevTools /> : null;
}

export default App;
