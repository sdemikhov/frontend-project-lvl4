import 'core-js/stable/index.js';
import 'regenerator-runtime/runtime.js';
import React from 'react';
import i18n from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { configureStore } from '@reduxjs/toolkit';
import { Provider as StoreProvider } from 'react-redux';

import { ProvideAuth } from './auth.jsx';
import { SocketProvider } from './socket.jsx';
import resources from './locales/locales.js';
import channelsReducer, {
  removeChannel,
  renameChannel,
  newChannel,
} from './slices/channels-slice.js';
import messagesReducer, { newMessage } from './slices/messages-slice.js';
import modalReducer from './slices/modal-slice.js';
import App from './components/App.jsx';

export default async (socketInstance) => {
  const i18nextInstance = i18n.createInstance();
  await i18nextInstance.init({ lng: 'ru', resources });

  const store = configureStore({
    reducer: {
      channelsInfo: channelsReducer,
      messagesInfo: messagesReducer,
      modalInfo: modalReducer,
    },
  });

  socketInstance.on(
    'newMessage',
    (message) => {
      store.dispatch(newMessage(message));
    },
  );

  socketInstance.on(
    'newChannel',
    (channel) => {
      store.dispatch(newChannel(channel));
    },
  );

  socketInstance.on(
    'renameChannel',
    (channel) => {
      store.dispatch(renameChannel(channel));
    },
  );

  socketInstance.on(
    'removeChannel',
    ({ id }) => {
      store.dispatch(removeChannel(id));
    },
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
};
