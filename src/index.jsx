import 'core-js/stable/index.js';
import 'regenerator-runtime/runtime.js';
import React from 'react';
import { render } from 'react-dom';
import i18n from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { configureStore } from '@reduxjs/toolkit';
import { Provider as StoreProvider } from 'react-redux';

import '../assets/application.scss';
import resources from './locales/locales.js';
import App from './components/App.jsx';

if (process.env.NODE_ENV !== 'production') {
  localStorage.debug = 'chat:*';
}

const root = document.getElementById('root');
const i18nextInstance = i18n.createInstance();
i18nextInstance.init({ lng: 'ru', resources }).then(() => {
  const initialState = {};
  const store = configureStore({
    reducer: {

    },
  });

  render(
    <I18nextProvider i18n={i18nextInstance}>
      <StoreProvider store={store}>
        <App />
      </StoreProvider>
    </I18nextProvider>,
    root,
  );
});
