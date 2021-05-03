const host = '';
const prefix = 'api/v1';

export default {
  channelsPath: () => [host, prefix, 'channels'].join('/'),
  channelPath: (id) => [host, prefix, 'channels', id].join('/'),
  channelMessagesPath: (id) => [host, prefix, 'channels', id, 'messages'].join('/'),
  loginFormPath: () => [host, 'login'].join('/'),
  mainPagePath: () => [host, ''].join('/'),
  pageNotFound: () => [host, 'page-not-found'].join('/'),
  loginPath: () => [host, prefix, 'login'].join('/'),
  chatDataPath: () => [host, prefix, 'data'].join('/'),
};
