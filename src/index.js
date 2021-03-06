import { render } from 'react-dom';
import { io } from 'socket.io-client';
import Rollbar from 'rollbar';

import '../assets/application.scss';

import init from './init.jsx';

if (process.env.NODE_ENV !== 'production') {
  localStorage.debug = 'chat:*';
}

if (process.env.NODE_ENV === 'production') {
  const rollbar = new Rollbar({
    accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true,
    environment: 'production',
  });

  rollbar.log('Start production.');
}

const socketInstance = io();
const root = document.getElementById('root');

init(socketInstance).then((vdom) => {
  render(vdom, root);
});
