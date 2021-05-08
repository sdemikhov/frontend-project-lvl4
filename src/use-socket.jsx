import React, {
  createContext,
  useContext,
} from 'react';

const socketContext = createContext();

export const useSocket = () => useContext(socketContext);

export const SocketProvider = ({ socket, children }) => (
  <socketContext.Provider value={socket}>
    {children}
  </socketContext.Provider>
);
