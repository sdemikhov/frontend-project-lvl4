import SocketClientMock from 'socket.io-mock';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import nock from 'nock';
import {
  render, screen, waitFor,
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

  socket.on('newChannel', (channel, acknowledge) => {
    const channelWithId = {
      ...channel,
      removable: true,
      id: getNextId(),
    };

    state.channels.push(channelWithId);
    acknowledge({ status: 'ok', data: channelWithId });
    socket.emit('newChannel', channelWithId);
  });

  socket.on('renameChannel', ({ id, name }, acknowledge) => {
    const channelId = Number(id);
    const channel = state.channels.find((c) => c.id === channelId);
    if (!channel) return;
    channel.name = name;

    acknowledge({ status: 'ok' });
    socket.emit('renameChannel', channel);
  });

  socket.on('removeChannel', ({ id }, acknowledge) => {
    const channelId = Number(id);
    state.channels = state.channels.filter((c) => c.id !== channelId); // eslint-disable-line

    state.messages = state.messages.filter((m) => m.channelId !== channelId); // eslint-disable-line

    const data = { id: channelId };

    acknowledge({ status: 'ok' });
    socket.emit('removeChannel', data);
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

let testData; // eslint-disable-line

beforeEach(async () => {
  const state = buildState();
  const socket = getSocket(state);
  const vdom = await init(socket.socketClient);

  render(vdom);

  testData = {
    state,
  };
});

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
    expect(screen.getByLabelText(/Ваш ник/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Пароль/i)).toBeInTheDocument();
  });

  test('should login with correct credentials or get error message', async () => {
    const { state } = testData;
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

test('User should type new message to default channel', async () => {
  const { state } = testData;

  nock(host)
    .post('/api/v1/login')
    .reply(200, { token: 'JWT', username: 'Vasyan' })
    .get('/api/v1/data')
    .reply(200, state);

  userEvent.type(screen.getByLabelText(/Ваш ник/i), 'Vasyan');
  userEvent.type(screen.getByLabelText(/Пароль/i), 'CorrectPassword');
  userEvent.click(screen.getByRole('button', { name: /Войти/i }));

  await screen.findByText(/general/i);

  userEvent.type(screen.getByTestId('new-message'), 'Hello');
  userEvent.click(screen.getByRole('button', { name: /Отправить/i }));
  expect(screen.getByRole('button', { name: /Отправить/i })).toBeDisabled();

  expect(await screen.findByText(searchMessage('Vasyan', 'Hello'))).toBeInTheDocument();
});

test('User should change the channel and type new message', async () => {
  const { state } = testData;

  nock(host)
    .post('/api/v1/login')
    .reply(200, { token: 'JWT', username: 'Vasya1' })
    .get('/api/v1/data')
    .reply(200, state);

  userEvent.type(screen.getByLabelText(/Ваш ник/i), 'Vasya1');
  userEvent.type(screen.getByLabelText(/Пароль/i), 'CorrectPassword');
  userEvent.click(screen.getByRole('button', { name: /Войти/i }));
  expect(await screen.findByRole('button', { name: /random/i })).toBeInTheDocument();

  userEvent.click(screen.getByRole('button', { name: /random/i }));
  expect(await screen.findByRole('button', { name: /random/i })).toHaveClass(
    'text-light font-weight-bold btn btn-dark',
    { exact: true },
  );

  userEvent.type(screen.getByTestId('new-message'), 'Message in random chat');
  userEvent.click(screen.getByRole('button', { name: /Отправить/i }));
  expect(screen.getByRole('button', { name: /Отправить/i })).toBeDisabled();

  expect(await screen.findByText(searchMessage('Vasya1', 'Message in random chat'))).toBeInTheDocument();
});

test('User should create new channel', async () => {
  const { state } = testData;

  nock(host)
    .post('/api/v1/login')
    .reply(200, { token: 'JWT', username: 'Vasya' })
    .get('/api/v1/data')
    .reply(200, state);

  userEvent.type(screen.getByLabelText(/Ваш ник/i), 'Vasya');
  userEvent.type(screen.getByLabelText(/Пароль/i), 'CorrectPassword');
  userEvent.click(screen.getByRole('button', { name: /Войти/i }));
  expect(await screen.findByRole('button', { name: /Новый\.\.\./i })).toBeInTheDocument();

  userEvent.click(screen.getByRole('button', { name: /Новый\.\.\./i }));
  expect(await screen.findByTestId('new-channel')).toBeInTheDocument();

  userEvent.type(screen.getByTestId('new-channel'), 'CustomNewChannel');
  userEvent.click(screen.getByRole('button', { name: /Отправить/i }));
  expect(await screen.findByRole('button', { name: /Отправить/i })).toBeDisabled();
  expect(await screen.findByText(/CustomNewChannel/i)).toBeInTheDocument();
});

test('User should rename channel', async () => {
  const { state } = testData;

  const removableChannel = { id: getNextId(), name: 'removableChannel', removable: true };
  const dropdownTestId = `dropdown-channelId-${removableChannel.id}`;

  state.channels.push(removableChannel);

  nock(host)
    .post('/api/v1/login')
    .reply(200, { token: 'JWT', username: 'Vasya2' })
    .get('/api/v1/data')
    .reply(200, state);

  userEvent.type(screen.getByLabelText(/Ваш ник/i), 'Vasya2');
  userEvent.type(screen.getByLabelText(/Пароль/i), 'CorrectPassword');
  userEvent.click(screen.getByRole('button', { name: /Войти/i }));
  expect(await screen.findByTestId(dropdownTestId)).toBeInTheDocument();

  userEvent.click(screen.getByTestId(dropdownTestId));
  expect(await screen.findByText(/Переименовать/i)).toBeInTheDocument();

  userEvent.click(screen.getByText(/Переименовать/i));
  expect(await screen.findByTestId('rename-channel')).toBeInTheDocument();
  expect(screen.getByTestId('rename-channel')).toHaveDisplayValue(removableChannel.name);

  userEvent.type(screen.getByTestId('rename-channel'), 'WithNewName');
  userEvent.click(screen.getByRole('button', { name: /Отправить/i }));
  expect(await screen.findByRole('button', { name: /Отправить/i })).toBeDisabled();
  expect(await screen.findByText('removableChannelWithNewName')).toBeInTheDocument();
});

test('User should remove channel', async () => {
  const { state } = testData;

  const removableChannel = { id: getNextId(), name: 'removableChannel', removable: true };
  const dropdownTestId = `dropdown-channelId-${removableChannel.id}`;

  state.channels.push(removableChannel);

  nock(host)
    .post('/api/v1/login')
    .reply(200, { token: 'JWT', username: 'Vasya3' })
    .get('/api/v1/data')
    .reply(200, state);

  userEvent.type(screen.getByLabelText(/Ваш ник/i), 'Vasya3');
  userEvent.type(screen.getByLabelText(/Пароль/i), 'CorrectPassword');
  userEvent.click(screen.getByRole('button', { name: /Войти/i }));
  expect(await screen.findByTestId(dropdownTestId)).toBeInTheDocument();

  userEvent.click(screen.getByTestId(dropdownTestId));
  expect(await screen.findByText(/Удалить/i)).toBeInTheDocument();

  userEvent.click(screen.getByText(/Удалить/i));
  expect(await screen.findByRole('button', { name: /Удалить/i })).toBeInTheDocument();

  userEvent.click(screen.getByRole('button', { name: /Удалить/i }));

  await waitFor(() => {
    expect(screen.queryByText(removableChannel.name)).not.toBeInTheDocument();
  });
});
