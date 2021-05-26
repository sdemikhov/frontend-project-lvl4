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
  nock.cleanAll();
  window.localStorage.removeItem('token');
  window.localStorage.removeItem('username');
  window.history.pushState({}, 'test page', host);

  const state = buildState();
  const socket = getSocket(state);
  const vdom = await init(socket.socketClient);

  render(vdom);

  testData = {
    state,
  };
});

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = () => {};
  nock.disableNetConnect();
});

afterAll(() => {
  nock.enableNetConnect();
});

test('should be redirected to login page', async () => {
  expect(window.location.pathname).toBe('/login');
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
    .reply(200, { username: 'CorrectUsername', token: 'JWT' })
    .get('/api/v1/data')
    .reply(200, state);

  expect(window.location.pathname).toBe('/login');
  userEvent.type(screen.getByLabelText(/Ваш ник/i), 'WrongUsername');
  userEvent.type(screen.getByLabelText(/Пароль/i), 'WrongPassword');
  userEvent.click(screen.getByRole('button', { name: /Войти/i }));
  expect(screen.getByRole('button', { name: /Войти/i })).toBeDisabled();
  expect(await screen.findByText(/Неверные имя пользователя или пароль/i)).toBeInTheDocument();

  userEvent.type(screen.getByLabelText(/Ваш ник/i), 'CorrectUsername');
  userEvent.type(screen.getByLabelText(/Пароль/i), 'CorrectPassword');
  userEvent.click(screen.getByRole('button', { name: /Войти/i }));
  expect(screen.getByRole('button', { name: /Войти/i })).toBeDisabled();
  expect(await screen.findByText(/general/i)).toBeInTheDocument();
  expect(await screen.findByText(searchMessage('admin', 'welcome'))).toBeInTheDocument();
});

test('should register with correct credentials or get error message', async () => {
  const { state } = testData;
  state.users = [
    { id: 1, username: 'Vasyok', password: 'somePassword' },
  ];
  state.messages.push(
    {
      id: getNextId(),
      channelId: state.currentChannelId,
      sender: 'admin',
      body: 'Hello',
    },
  );

  nock(host)
    .post('/api/v1/signup')
    .reply(409)
    .post('/api/v1/signup')
    .reply(200, { token: 'JWT', username: 'Vasyok' })
    .get('/api/v1/data')
    .reply(200, state);

  expect(window.location.pathname).toBe('/login');
  expect(await screen.findByText(/Регистрация/i)).toBeInTheDocument();

  userEvent.click(screen.getByRole('link', { name: /Регистрация/i }));
  await waitFor(() => {
    expect(window.location.pathname).toBe('/signup');
  });
  expect(await screen.findByText(/Имя пользователя/i)).toBeInTheDocument();

  userEvent.type(screen.getByLabelText(/Имя пользователя/i), 'V');
  userEvent.type(screen.getByLabelText('Пароль'), 'Passw');
  userEvent.type(screen.getByLabelText('Подтвердите пароль'), 'Pass');
  userEvent.click(screen.getByRole('button', { name: /Зарегистрироваться/i }));
  expect(await screen.findByText(/От 3 до 20 символов/i)).toBeVisible();
  expect(await screen.findByText(/Не менее 6 символов/i)).toBeVisible();
  expect(await screen.findByText(/Пароли должны совпадать/i)).toBeVisible();

  userEvent.clear(screen.getByLabelText(/Имя пользователя/i));
  userEvent.type(screen.getByLabelText(/Имя пользователя/i), 'Vasyok');
  userEvent.clear(screen.getByLabelText('Пароль'));
  userEvent.type(screen.getByLabelText('Пароль'), 'randomPassword');
  userEvent.clear(screen.getByLabelText('Подтвердите пароль'));
  userEvent.type(screen.getByLabelText('Подтвердите пароль'), 'randomPassword');
  userEvent.click(screen.getByRole('button', { name: /Зарегистрироваться/i }));
  expect(screen.getByRole('button', { name: /Зарегистрироваться/i })).toBeDisabled();
  expect(await screen.findByText(/Пользователь с таким именем уже существует/i)).toBeInTheDocument();

  userEvent.clear(screen.getByLabelText(/Имя пользователя/i));
  userEvent.type(screen.getByLabelText(/Имя пользователя/i), 'Vasiliy');
  userEvent.click(screen.getByRole('button', { name: /Зарегистрироваться/i }));
  expect(screen.getByRole('button', { name: /Зарегистрироваться/i })).toBeDisabled();
  expect(await screen.findByText(/general/i)).toBeInTheDocument();
  expect(await screen.findByText(searchMessage('admin', 'Hello'))).toBeInTheDocument();
});

test('User should type new message to default channel', async () => {
  const { state } = testData;

  nock(host)
    .post('/api/v1/login')
    .reply(200, { token: 'JWT', username: 'Vasyan' })
    .get('/api/v1/data')
    .reply(200, state);

  expect(window.location.pathname).toBe('/login');
  userEvent.type(screen.getByLabelText(/Ваш ник/i), 'Vasyan');
  userEvent.type(screen.getByLabelText(/Пароль/i), 'CorrectPassword');
  userEvent.click(screen.getByRole('button', { name: /Войти/i }));

  await screen.findByText(/general/i);
  expect(screen.getByTestId('new-message')).toHaveAttribute('value', '');

  userEvent.click(screen.getByRole('button', { name: /Отправить/i }));
  await waitFor(() => {
    expect(screen.queryByText(/Vasyan/i)).not.toBeInTheDocument();
  });

  userEvent.type(screen.getByTestId('new-message'), ' ');
  userEvent.click(screen.getByRole('button', { name: /Отправить/i }));
  await waitFor(() => {
    expect(screen.queryByText(/Vasyan/i)).not.toBeInTheDocument();
  });

  userEvent.type(screen.getByTestId('new-message'), 'Hello');
  userEvent.click(screen.getByRole('button', { name: /Отправить/i }));
  expect(screen.getByRole('button', { name: /Отправить/i })).toBeDisabled();

  expect(await screen.findByText(searchMessage('Vasyan', 'Hello'))).toBeInTheDocument();
});

test('User should type new message change the channel and type another message', async () => {
  const { state } = testData;

  nock(host)
    .post('/api/v1/login')
    .reply(200, { token: 'JWT', username: 'Vasya1' })
    .get('/api/v1/data')
    .reply(200, state);

  expect(window.location.pathname).toBe('/login');
  userEvent.type(screen.getByLabelText(/Ваш ник/i), 'Vasya1');
  userEvent.type(screen.getByLabelText(/Пароль/i), 'CorrectPassword');
  userEvent.click(screen.getByRole('button', { name: /Войти/i }));
  expect(await screen.findByRole('button', { name: /general/i })).toBeInTheDocument();
  expect(await screen.findByRole('button', { name: /random/i })).toBeInTheDocument();

  userEvent.type(await screen.findByTestId('new-message'), 'message for general');
  userEvent.click(await screen.findByRole('button', { name: /Отправить/i }));
  expect(await screen.findByText(/message for general/i)).toBeInTheDocument();

  userEvent.click(await screen.findByRole('button', { name: /random/i }));
  expect(await screen.findByRole('button', { name: /random/i })).toHaveClass(
    'text-light font-weight-bold btn btn-dark',
    { exact: true },
  );
  expect(screen.getByTestId('new-message')).toHaveAttribute('value', '');
  expect(screen.queryByText(/message for general/i)).not.toBeInTheDocument();

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

  expect(window.location.pathname).toBe('/login');
  userEvent.type(screen.getByLabelText(/Ваш ник/i), 'Vasya');
  userEvent.type(screen.getByLabelText(/Пароль/i), 'CorrectPassword');
  userEvent.click(screen.getByRole('button', { name: /Войти/i }));
  expect(await screen.findByRole('button', { name: /\+/i })).toBeInTheDocument();

  userEvent.click(screen.getByRole('button', { name: /\+/i }));
  expect(await screen.findByTestId('new-channel')).toBeInTheDocument();
  expect(screen.getByText(/Создать канал/i)).toBeVisible();
  expect(screen.getByTestId('new-channel')).toHaveAttribute('value', '');

  userEvent.click(screen.getByRole('button', { name: /Отправить/i }));
  expect(await screen.findByText(/Обязательное поле/i)).toBeVisible();

  userEvent.clear(screen.getByTestId('new-channel'));
  userEvent.type(screen.getByTestId('new-channel'), ' ');
  userEvent.click(screen.getByRole('button', { name: /Отправить/i }));
  expect(await screen.findByText(/Обязательное поле/i)).toBeVisible();

  userEvent.clear(screen.getByTestId('new-channel'));
  userEvent.type(screen.getByTestId('new-channel'), 'aa');
  userEvent.click(screen.getByRole('button', { name: /Отправить/i }));
  expect(await screen.findByText(/От 3 до 20 символов/i)).toBeVisible();

  userEvent.clear(screen.getByTestId('new-channel'));
  userEvent.type(screen.getByTestId('new-channel'), _.repeat('a', 21));
  userEvent.click(screen.getByRole('button', { name: /Отправить/i }));
  expect(await screen.findByText(/От 3 до 20 символов/i)).toBeVisible();

  userEvent.clear(screen.getByTestId('new-channel'));
  userEvent.type(screen.getByTestId('new-channel'), 'CustomNewChannel');
  userEvent.click(screen.getByRole('button', { name: /Отправить/i }));
  expect(screen.getByRole('button', { name: /Отправить/i })).toBeDisabled();
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

  expect(window.location.pathname).toBe('/login');
  userEvent.type(screen.getByLabelText(/Ваш ник/i), 'Vasya2');
  userEvent.type(screen.getByLabelText(/Пароль/i), 'CorrectPassword');
  userEvent.click(screen.getByRole('button', { name: /Войти/i }));
  expect(await screen.findByTestId(dropdownTestId)).toBeInTheDocument();

  userEvent.click(screen.getByTestId(dropdownTestId));
  expect(await screen.findByText(/Переименовать/i)).toBeInTheDocument();

  userEvent.click(screen.getByText(/Переименовать/i));
  expect(await screen.findByTestId('rename-channel')).toBeInTheDocument();
  expect(screen.getByTestId('rename-channel')).toHaveDisplayValue(removableChannel.name);
  expect(screen.getByText(/Переименовать канал/i)).toBeVisible();

  userEvent.clear(screen.getByTestId('rename-channel'));
  userEvent.click(screen.getByRole('button', { name: /Отправить/i }));
  expect(await screen.findByText(/Обязательное поле/i)).toBeVisible();

  userEvent.clear(screen.getByTestId('rename-channel'));
  userEvent.type(screen.getByTestId('rename-channel'), 'aa');
  userEvent.click(screen.getByRole('button', { name: /Отправить/i }));
  expect(await screen.findByText(/От 3 до 20 символов/i)).toBeVisible();

  userEvent.clear(screen.getByTestId('rename-channel'));
  userEvent.type(screen.getByTestId('rename-channel'), _.repeat('a', 21));
  userEvent.click(screen.getByRole('button', { name: /Отправить/i }));
  expect(await screen.findByText(/От 3 до 20 символов/i)).toBeVisible();

  userEvent.clear(screen.getByTestId('rename-channel'));
  userEvent.type(screen.getByTestId('rename-channel'), 'NewName');
  userEvent.click(screen.getByRole('button', { name: /Отправить/i }));
  expect(screen.getByRole('button', { name: /Отправить/i })).toBeDisabled();
  expect(await screen.findByText('NewName')).toBeInTheDocument();
});

test('User should remove channel', async () => {
  const { state } = testData;

  const removableChannel = { id: getNextId(), name: 'removableChannel', removable: true };
  const dropdownTestId = `dropdown-channelId-${removableChannel.id}`;

  state.channels.push(removableChannel);
  state.messages.push(
    {
      id: getNextId(),
      channelId: state.currentChannelId,
      sender: 'admin',
      body: 'messageInGeneralChannel',
    },
  );

  state.messages.push(
    {
      id: getNextId(),
      channelId: removableChannel.id,
      sender: 'admin',
      body: 'messageInRemovableChannel',
    },
  );

  nock(host)
    .post('/api/v1/login')
    .reply(200, { token: 'JWT', username: 'Vasya3' })
    .get('/api/v1/data')
    .reply(200, state);

  expect(window.location.pathname).toBe('/login');
  userEvent.type(screen.getByLabelText(/Ваш ник/i), 'Vasya3');
  userEvent.type(screen.getByLabelText(/Пароль/i), 'CorrectPassword');
  userEvent.click(screen.getByRole('button', { name: /Войти/i }));
  expect(await screen.findByTestId(dropdownTestId)).toBeInTheDocument();

  userEvent.click(await screen.findByRole('button', { name: /removableChannel/i }));
  expect(await screen.findByText(searchMessage('admin', 'messageInRemovableChannel'))).toBeInTheDocument();

  userEvent.click(screen.getByTestId(dropdownTestId));
  expect(await screen.findByText(/Удалить/i)).toBeInTheDocument();

  userEvent.click(screen.getByText(/Удалить/i));
  expect(await screen.findByRole('button', { name: /Удалить/i })).toBeInTheDocument();
  expect(screen.getByText(/Удалить канал/i)).toBeVisible();

  userEvent.click(screen.getByRole('button', { name: /Удалить/i }));
  await waitFor(() => {
    expect(screen.queryByText(/removableChannel/i)).not.toBeInTheDocument();
    expect(screen.queryByText(searchMessage('admin', 'messageInRemovableChannel'))).not.toBeInTheDocument();
    expect(screen.getByText(searchMessage('admin', 'messageInGeneralChannel'))).toBeInTheDocument();
  });
});
