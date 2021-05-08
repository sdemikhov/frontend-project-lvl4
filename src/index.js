import { render } from 'react-dom';
import { io } from 'socket.io-client';
import '../assets/application.scss';

import init from './init.jsx';

const socketInstance = io();
const root = document.getElementById('root');

init(socketInstance).then((vdom) => {
  render(vdom, root);
});
