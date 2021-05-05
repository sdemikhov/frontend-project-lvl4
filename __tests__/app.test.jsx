import React from 'react';
import i18n from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { configureStore } from '@reduxjs/toolkit';
import { Provider as StoreProvider } from 'react-redux';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import nock from 'nock';
import {
  render, screen,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import App from '../src/components/App.jsx';
import resources from '../src/locales/locales.js';
import chatDataReducer from '../src/slices/chat-data-slice.js';
import channelsReducer from '../src/slices/channels-slice.js';
import messagesReducer from '../src/slices/messages-slice.js';

axios.defaults.adapter = httpAdapter;

beforeAll(() => {
  nock.disableNetConnect();
});

afterAll(() => {
  nock.enableNetConnect();
});

const getProvidedDOM = async (Component) => {
  const store = configureStore({
    reducer: {
      chatData: chatDataReducer,
      channels: channelsReducer,
      messages: messagesReducer,
    },
  });

  const i18nextInstance = i18n.createInstance();
  await i18nextInstance.init({ lng: 'ru', resources });

  const vdom = (
    <I18nextProvider i18n={i18nextInstance}>
      <StoreProvider store={store}>
        <Component />
      </StoreProvider>
    </I18nextProvider>
  );

  return vdom;
};

const host = 'http://localhost';

describe('Unauthorized user:', () => {
  test('should be redirected to login page', async () => {
    const vdom = await getProvidedDOM(App);

    render(vdom);

    expect(screen.getByLabelText(/Ваш ник/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Пароль/i)).toBeInTheDocument();
  });

  test('should login with correct credentials or get error message', async () => {
    const vdom = await getProvidedDOM(App);

    render(vdom);

    nock(host)
      .post('/api/v1/login')
      .reply(401)
      .post('/api/v1/login')
      .reply(200, { token: 'JWT' })
      .get('/api/v1/data')
      .reply(200, {
        channels: [
          { id: 1, name: 'general', removable: false },
        ],
        messages: [
          { id: 1, channelId: 1, body: 'welcome' },
        ],
        currentChannelId: 1,
      });

    userEvent.type(screen.getByLabelText(/Ваш ник/i), 'WrongUsername');
    userEvent.type(screen.getByLabelText(/Пароль/i), 'WrongPassword');
    userEvent.click(screen.getByRole('button', { name: /Войти/i }));

    expect(screen.getByRole('button', { name: /Войти/i })).toBeDisabled();

    expect(await screen.findByText(/Неверный логин или пароль/i)).toBeInTheDocument();

    userEvent.type(screen.getByLabelText(/Ваш ник/i), 'CorrectUsername');
    userEvent.type(screen.getByLabelText(/Пароль/i), 'CorrectPassword');
    userEvent.click(screen.getByRole('button', { name: /Войти/i }));

    expect(screen.getByRole('button', { name: /Войти/i })).toBeDisabled();

    expect(await screen.findByText(/general/i)).toBeInTheDocument();
  });
});
