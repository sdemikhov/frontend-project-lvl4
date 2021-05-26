import React, { useEffect } from 'react';
import { createSelector } from 'reselect';
import { useSelector } from 'react-redux';
import { scroller } from 'react-scroll';

import {
  selectIds,
  selectEntities,
} from '../slices/messages-slice.js';
import { selectCurrentChannelId } from '../slices/channels-slice.js';

const getMessagesInCurrentChannel = createSelector(
  selectIds,
  selectEntities,
  selectCurrentChannelId,
  (ids, entities, currentChannelId) => {
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
