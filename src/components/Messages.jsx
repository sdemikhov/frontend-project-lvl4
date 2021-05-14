import React, { useRef, useEffect } from 'react';
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
  const messagesEnd = useRef(null);

  useEffect(() => {
    const { current } = messagesEnd;
    if (current) {
      current.scrollIntoView();
    }
  }, [messages]);

  return (
    <div className="overflow-auto">
      {messages.map(({ id, body, sender }) => (
        <div key={id} className="text-break">
          <b>{sender}</b>
          {`: ${body}`}
        </div>
      ))}
      <div ref={messagesEnd} />
    </div>
  );
};

export default Messages;
