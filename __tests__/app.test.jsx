import SocketClientMock from 'socket.io-mock';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import nock from 'nock';
import {
  render, screen,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import _ from 'lodash';

import init from '../src/init.jsx';

axios.defaults.adapter = httpAdapter;

const host = 'http://localhost';

const getNextId = () => Number(_.uniqueId());

const buildState = (defaultState = {}) => {
  const generalChannelId = getNextId();
  const randomChannelId = getNextId();
  const state = {
    channels: [
      { id: generalChannelId, name: 'general', removable: false },
      { id: randomChannelId, name: 'random', removable: false },
    ],
    messages: [],
    currentChannelId: generalChannelId,
  };

  if (defaultState.messages) {
    state.messages.push(...defaultState.messages);
  }
  if (defaultState.channels) {
    state.channels.push(...defaultState.channels);
  }
  if (defaultState.currentChannelId) {
    state.currentChannelId = defaultState.currentChannelId;
  }
  if (defaultState.users) {
    state.users.push(...defaultState.users);
  }

  return state;
};

const getSocket = (state = {}) => {
  const socket = new SocketClientMock();

  socket.on('newMessage', (message, acknowledge) => {
    const messageWithId = {
      ...message,
      id: getNextId(),
    };
    state.messages.push(messageWithId);
    acknowledge({ status: 'ok' });
    socket.emit('newMessage', messageWithId);
  });

  return socket;
};

const searchMessage = (sender, body) => (content, element) => {
  const hasMessageBody = content === `: ${body}`;
  const child = element.firstElementChild;

  if (child) {
    const hasSender = child.textContent === sender;

    return hasSender && hasMessageBody;
  }

  return false;
};

beforeAll(() => {
  nock.disableNetConnect();
});

afterAll(() => {
  nock.enableNetConnect();
});

afterEach(() => {
  window.localStorage.removeItem('token');
  window.localStorage.removeItem('username');
});

describe('Unauthorized user:', () => {
  test('should be redirected to login page', async () => {
    const socket = getSocket();
    const vdom = await init(socket.socketClient);

    render(vdom);

    expect(screen.getByLabelText(/Ваш ник/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Пароль/i)).toBeInTheDocument();
  });

  test('should login with correct credentials or get error message', async () => {
    const state = buildState();
    state.messages.push(
      {
        id: getNextId(),
        channelId: state.currentChannelId,
        sender: 'admin',
        body: 'welcome',
      },
    );

    nock(host)
      .post('/api/v1/login')
      .reply(401)
      .post('/api/v1/login')
      .reply(200, { token: 'JWT' })
      .get('/api/v1/data')
      .reply(200, state);

    const socket = getSocket(state);
    const vdom = await init(socket.socketClient);

    render(vdom);

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
    expect(await screen.findByText(searchMessage('admin', 'welcome'))).toBeInTheDocument();
  });
});

describe('', () => {
  test('User should type new message to default channel and see it', async () => {
    const state = buildState();

    nock(host)
      .post('/api/v1/login')
      .reply(200, { token: 'JWT', username: 'Vasyan' })
      .get('/api/v1/data')
      .reply(200, state);

    const socket = getSocket(state);
    const vdom = await init(socket.socketClient);

    render(vdom);

    userEvent.type(screen.getByLabelText(/Ваш ник/i), 'Vasyan');
    userEvent.type(screen.getByLabelText(/Пароль/i), 'CorrectPassword');
    userEvent.click(screen.getByRole('button', { name: /Войти/i }));

    await screen.findByText(/general/i);

    userEvent.type(screen.getByTestId('new-message'), 'Hello');
    userEvent.click(screen.getByRole('button', { name: /Отправить/i }));

    expect(await screen.findByText(searchMessage('Vasyan', 'Hello'))).toBeInTheDocument();
  });
});
