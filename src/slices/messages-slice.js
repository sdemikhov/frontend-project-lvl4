/* eslint-disable no-param-reassign, */
import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

import { getChatData } from './chat-data-slice.js';
import { removeChannel } from './channels-slice.js';

const messagesAdapter = createEntityAdapter({
  sortComparer: (message1, message2) => message1.id - message2.id,
});

const messagesSlice = createSlice({
  name: 'messages',
  initialState: messagesAdapter.getInitialState(),
  reducers: {
    newMessage: messagesAdapter.addOne,
  },
  extraReducers: {
    [getChatData.fulfilled]: (state, action) => {
      const { messages } = action.payload;

      messagesAdapter.upsertMany(state, messages);
    },
    [removeChannel]: (state, action) => {
      const { id: removedChannelId } = action.payload;
      const { ids, entities } = state;
      const messageIdsInRemovedChannel = ids
        .filter((id) => entities[id].channelId === removedChannelId);

      messagesAdapter.removeMany(state, messageIdsInRemovedChannel);
    },
  },
});

export const { newMessage } = messagesSlice.actions;

export default messagesSlice.reducer;
