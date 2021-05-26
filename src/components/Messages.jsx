import React, { useEffect } from 'react';
import { createSelector } from 'reselect';
import { useSelector } from 'react-redux';
import { scroller } from 'react-scroll';

import { selectCurrentChannelId } from '../slices/channels-slice.js';

const getMessagesInCurrentChannel = createSelector(
  (state) => state.messagesInfo.messages,
  selectCurrentChannelId,
  (messages, currentChannelId) => {
    const messagesInCurrentChannel = messages.reduce((acc, message) => {
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
  const containerId = 'messages';
  const messagesEnd = 'messagesEnd';

  useEffect(() => {
    scroller.scrollTo(messagesEnd, {
      duration: 800,
      delay: 0,
      smooth: 'easeInOutQuart',
      containerId,
    });
  }, [messages]);

  return (
    <div id={containerId} className="overflow-auto">
      {messages.map(({ id, body, sender }) => (
        <div key={id} className="text-break">
          <b>{sender}</b>
          {`: ${body}`}
        </div>
      ))}
      <div id={messagesEnd} />
    </div>
  );
};

export default Messages;
