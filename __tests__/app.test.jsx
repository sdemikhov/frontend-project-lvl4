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
  const child = element.firstElementChild;// eslint-disable-line

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
  expect(screen.getByLabelText(/?????? ??????/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/????????????/i)).toBeInTheDocument();
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
  userEvent.type(screen.getByLabelText(/?????? ??????/i), 'WrongUsername');
  userEvent.type(screen.getByLabelText(/????????????/i), 'WrongPassword');
  userEvent.click(screen.getByRole('button', { name: /??????????/i }));
  expect(screen.getByRole('button', { name: /??????????/i })).toBeDisabled();
  expect(await screen.findByText(/???????????????? ?????? ???????????????????????? ?????? ????????????/i)).toBeInTheDocument();

  userEvent.type(screen.getByLabelText(/?????? ??????/i), 'CorrectUsername');
  userEvent.type(screen.getByLabelText(/????????????/i), 'CorrectPassword');
  userEvent.click(screen.getByRole('button', { name: /??????????/i }));
  expect(screen.getByRole('button', { name: /??????????/i })).toBeDisabled();
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
  expect(await screen.findByText(/??????????????????????/i)).toBeInTheDocument();

  userEvent.click(screen.getByRole('link', { name: /??????????????????????/i }));
  await waitFor(() => {
    expect(window.location.pathname).toBe('/signup');
  });
  expect(await screen.findByText(/?????? ????????????????????????/i)).toBeInTheDocument();

  userEvent.type(screen.getByLabelText(/?????? ????????????????????????/i), 'V');
  userEvent.type(screen.getByLabelText('????????????'), 'Passw');
  userEvent.type(screen.getByLabelText('?????????????????????? ????????????'), 'Pass');
  userEvent.click(screen.getByRole('button', { name: /????????????????????????????????????/i }));
  expect(await screen.findByText(/???? 3 ???? 20 ????????????????/i)).toBeVisible();
  expect(await screen.findByText(/???? ?????????? 6 ????????????????/i)).toBeVisible();
  expect(await screen.findByText(/???????????? ???????????? ??????????????????/i)).toBeVisible();

  userEvent.clear(screen.getByLabelText(/?????? ????????????????????????/i));
  userEvent.type(screen.getByLabelText(/?????? ????????????????????????/i), 'Vasyok');
  userEvent.clear(screen.getByLabelText('????????????'));
  userEvent.type(screen.getByLabelText('????????????'), 'randomPassword');
  userEvent.clear(screen.getByLabelText('?????????????????????? ????????????'));
  userEvent.type(screen.getByLabelText('?????????????????????? ????????????'), 'randomPassword');
  userEvent.click(screen.getByRole('button', { name: /????????????????????????????????????/i }));
  expect(screen.getByRole('button', { name: /????????????????????????????????????/i })).toBeDisabled();
  expect(await screen.findByText(/???????????????????????? ?? ?????????? ???????????? ?????? ????????????????????/i)).toBeInTheDocument();

  userEvent.clear(screen.getByLabelText(/?????? ????????????????????????/i));
  userEvent.type(screen.getByLabelText(/?????? ????????????????????????/i), 'Vasiliy');
  userEvent.click(screen.getByRole('button', { name: /????????????????????????????????????/i }));
  expect(screen.getByRole('button', { name: /????????????????????????????????????/i })).toBeDisabled();
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
  userEvent.type(screen.getByLabelText(/?????? ??????/i), 'Vasyan');
  userEvent.type(screen.getByLabelText(/????????????/i), 'CorrectPassword');
  userEvent.click(screen.getByRole('button', { name: /??????????/i }));

  await screen.findByText(/general/i);
  expect(screen.getByTestId('new-message')).toHaveValue('');

  userEvent.click(screen.getByRole('button', { name: /??????????????????/i }));
  await waitFor(() => {
    expect(screen.queryByText(/Vasyan/i)).not.toBeInTheDocument();
  });

  userEvent.type(screen.getByTestId('new-message'), ' ');
  userEvent.click(screen.getByRole('button', { name: /??????????????????/i }));
  await waitFor(() => {
    expect(screen.queryByText(/Vasyan/i)).not.toBeInTheDocument();
  });

  userEvent.type(screen.getByTestId('new-message'), 'Hello');
  userEvent.click(screen.getByRole('button', { name: /??????????????????/i }));
  expect(screen.getByRole('button', { name: /??????????????????/i })).toBeDisabled();

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
  userEvent.type(screen.getByLabelText(/?????? ??????/i), 'Vasya1');
  userEvent.type(screen.getByLabelText(/????????????/i), 'CorrectPassword');
  userEvent.click(screen.getByRole('button', { name: /??????????/i }));
  expect(await screen.findByRole('button', { name: /general/i })).toBeInTheDocument();
  expect(await screen.findByRole('button', { name: /random/i })).toBeInTheDocument();

  userEvent.type(await screen.findByTestId('new-message'), 'message for general');
  userEvent.click(await screen.findByRole('button', { name: /??????????????????/i }));
  expect(await screen.findByText(/message for general/i)).toBeInTheDocument();

  userEvent.click(await screen.findByRole('button', { name: /random/i }));
  expect(await screen.findByRole('button', { name: /random/i })).toHaveClass(
    'text-light font-weight-bold btn btn-dark',
    { exact: true },
  );
  expect(screen.getByTestId('new-message')).toHaveValue('');
  expect(screen.queryByText(/message for general/i)).not.toBeInTheDocument();

  userEvent.type(screen.getByTestId('new-message'), 'Message in random chat');
  userEvent.click(screen.getByRole('button', { name: /??????????????????/i }));
  expect(screen.getByRole('button', { name: /??????????????????/i })).toBeDisabled();
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
  userEvent.type(screen.getByLabelText(/?????? ??????/i), 'Vasya');
  userEvent.type(screen.getByLabelText(/????????????/i), 'CorrectPassword');
  userEvent.click(screen.getByRole('button', { name: /??????????/i }));
  expect(await screen.findByRole('button', { name: /\+/i })).toBeInTheDocument();

  userEvent.click(screen.getByRole('button', { name: /\+/i }));
  expect(await screen.findByTestId('add-channel')).toBeInTheDocument();
  expect(screen.getByText(/?????????????? ??????????/i)).toBeVisible();
  expect(screen.getByTestId('add-channel')).toHaveValue('');

  userEvent.click(screen.getByRole('button', { name: /??????????????????/i }));
  expect(await screen.findByText(/???????????????????????? ????????/i)).toBeVisible();

  userEvent.clear(screen.getByTestId('add-channel'));
  userEvent.type(screen.getByTestId('add-channel'), ' ');
  userEvent.click(screen.getByRole('button', { name: /??????????????????/i }));
  expect(await screen.findByText(/???????????????????????? ????????/i)).toBeVisible();

  userEvent.clear(screen.getByTestId('add-channel'));
  userEvent.type(screen.getByTestId('add-channel'), 'aa');
  userEvent.click(screen.getByRole('button', { name: /??????????????????/i }));
  expect(await screen.findByText(/???? 3 ???? 20 ????????????????/i)).toBeVisible();

  userEvent.clear(screen.getByTestId('add-channel'));
  userEvent.type(screen.getByTestId('add-channel'), _.repeat('a', 21));
  userEvent.click(screen.getByRole('button', { name: /??????????????????/i }));
  expect(await screen.findByText(/???? 3 ???? 20 ????????????????/i)).toBeVisible();

  userEvent.clear(screen.getByTestId('add-channel'));
  userEvent.type(screen.getByTestId('add-channel'), 'CustomNewChannel');
  userEvent.click(screen.getByRole('button', { name: /??????????????????/i }));
  expect(screen.getByRole('button', { name: /??????????????????/i })).toBeDisabled();
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
  userEvent.type(screen.getByLabelText(/?????? ??????/i), 'Vasya2');
  userEvent.type(screen.getByLabelText(/????????????/i), 'CorrectPassword');
  userEvent.click(screen.getByRole('button', { name: /??????????/i }));
  expect(await screen.findByTestId(dropdownTestId)).toBeInTheDocument();

  userEvent.click(screen.getByTestId(dropdownTestId));
  expect(await screen.findByText(/??????????????????????????/i)).toBeInTheDocument();

  userEvent.click(screen.getByText(/??????????????????????????/i));
  expect(await screen.findByTestId('rename-channel')).toBeInTheDocument();
  expect(screen.getByTestId('rename-channel')).toHaveDisplayValue(removableChannel.name);
  expect(screen.getByText(/?????????????????????????? ??????????/i)).toBeVisible();

  userEvent.clear(screen.getByTestId('rename-channel'));
  userEvent.click(screen.getByRole('button', { name: /??????????????????/i }));
  expect(await screen.findByText(/???????????????????????? ????????/i)).toBeVisible();

  userEvent.clear(screen.getByTestId('rename-channel'));
  userEvent.type(screen.getByTestId('rename-channel'), 'aa');
  userEvent.click(screen.getByRole('button', { name: /??????????????????/i }));
  expect(await screen.findByText(/???? 3 ???? 20 ????????????????/i)).toBeVisible();

  userEvent.clear(screen.getByTestId('rename-channel'));
  userEvent.type(screen.getByTestId('rename-channel'), _.repeat('a', 21));
  userEvent.click(screen.getByRole('button', { name: /??????????????????/i }));
  expect(await screen.findByText(/???? 3 ???? 20 ????????????????/i)).toBeVisible();

  userEvent.clear(screen.getByTestId('rename-channel'));
  userEvent.type(screen.getByTestId('rename-channel'), 'NewName');
  userEvent.click(screen.getByRole('button', { name: /??????????????????/i }));
  expect(screen.getByRole('button', { name: /??????????????????/i })).toBeDisabled();
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
  userEvent.type(screen.getByLabelText(/?????? ??????/i), 'Vasya3');
  userEvent.type(screen.getByLabelText(/????????????/i), 'CorrectPassword');
  userEvent.click(screen.getByRole('button', { name: /??????????/i }));
  expect(await screen.findByTestId(dropdownTestId)).toBeInTheDocument();

  userEvent.click(await screen.findByRole('button', { name: /removableChannel/i }));
  expect(await screen.findByText(searchMessage('admin', 'messageInRemovableChannel'))).toBeInTheDocument();

  userEvent.click(screen.getByTestId(dropdownTestId));
  expect(await screen.findByText(/??????????????/i)).toBeInTheDocument();

  userEvent.click(screen.getByText(/??????????????/i));
  expect(await screen.findByRole('button', { name: /??????????????/i })).toBeInTheDocument();
  expect(screen.getByText(/?????????????? ??????????/i)).toBeVisible();

  userEvent.click(screen.getByRole('button', { name: /??????????????/i }));
  await waitFor(() => {
    expect(screen.queryByText(/removableChannel/i)).not.toBeInTheDocument();
    expect(screen.queryByText(searchMessage('admin', 'messageInRemovableChannel'))).not.toBeInTheDocument();
    expect(screen.getByText(searchMessage('admin', 'messageInGeneralChannel'))).toBeInTheDocument();
  });
});
