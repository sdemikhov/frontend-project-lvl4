const host = '';
const prefix = 'api/v1';

export default {
  channelsPath: (): string => [host, prefix, 'channels'].join('/'),
  channelPath: (id: number): string => [host, prefix, 'channels', id].join('/'),
  channelMessagesPath: (id: number): string => [host, prefix, 'channels', id, 'messages'].join('/'),
  loginFormPath: (): string => [host, 'login'].join('/'),
  registerFormPath: (): string => [host, 'signup'].join('/'),
  mainPagePath: (): string => [host, ''].join('/'),
  pageNotFound: (): string => [host, 'page-not-found'].join('/'),
  loginPath: (): string => [host, prefix, 'login'].join('/'),
  registerPath: (): string => [host, prefix, 'signup'].join('/'),
  chatDataPath: (): string => [host, prefix, 'data'].join('/'),
};
