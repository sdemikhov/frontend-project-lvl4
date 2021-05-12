import React from 'react';
import { createSelector } from 'reselect';
import { useSelector } from 'react-redux';

const getCurrentChannelId = ({ channels }) => channels.currentChannelId;

const getMessagesInCurrentChannel = createSelector(
  (state) => state.messages,
  getCurrentChannelId,
  ({ ids, entities }, currentChannelId) => {
    const messagesInCurrentChannel = ids.reduce((acc, id) => {
      const message = entities[id];

      if (message.channelId === currentChannelId) {
        return [...acc, message];
      }

      return acc;
    }, []);

    return messagesInCurrentChannel;
  },
);

const Messages = () => {
  const messages = useSelector(getMessagesInCurrentChannel);

  return (
    <>
      {messages.map(({ id, body, sender }) => (
        <div key={id} className="text-break">
          <b>{sender}</b>
          {`: ${body}`}
        </div>
      ))}
    </>
  );
};

export default Messages;
