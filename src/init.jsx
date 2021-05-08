import 'core-js/stable/index.js';
import 'regenerator-runtime/runtime.js';
import React from 'react';
import i18n from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { configureStore } from '@reduxjs/toolkit';
import { Provider as StoreProvider } from 'react-redux';

import { ProvideAuth } from './use-auth.jsx';
import { SocketProvider } from './use-socket.jsx';
import resources from './locales/locales.js';
import chatDataReducer from './slices/chat-data-slice.js';
import channelsReducer from './slices/channels-slice.js';
import messagesReducer, { addMessage } from './slices/messages-slice.js';
import App from './components/App.jsx';

export default (socketInstance) => {
  if (process.env.NODE_ENV !== 'production') {
    localStorage.debug = 'chat:*';
  }

  const i18nextInstance = i18n.createInstance();
  return i18nextInstance.init({ lng: 'ru', resources }).then(() => {
    const store = configureStore({
      reducer: {
        chatData: chatDataReducer,
        channels: channelsReducer,
        messages: messagesReducer,
      },
    });

    socketInstance.on(
      'newMessage',
      (message) => {
        store.dispatch(addMessage(message));
      },
      () => {},
    );

    return (
      <SocketProvider socket={socketInstance}>
        <I18nextProvider i18n={i18nextInstance}>
          <StoreProvider store={store}>
            <ProvideAuth>
              <App />
            </ProvideAuth>
          </StoreProvider>
        </I18nextProvider>
      </SocketProvider>
    );
  });
};
