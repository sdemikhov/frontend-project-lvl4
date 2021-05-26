/* eslint-disable no-param-reassign, */
import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

import { setInitialState, removeChannel } from './channels-slice.js';

const messagesAdapter = createEntityAdapter({
  sortComparer: (message1, message2) => message1.id - message2.id,
});

const messagesSlice = createSlice({
  name: 'messages',
  initialState: messagesAdapter.getInitialState(),
  reducers: {
    newMessage: messagesAdapter.addOne,
  },
  extraReducers: (builder) => {
    builder
      .addCase(setInitialState, (state, action) => {
        const { messages } = action.payload;

        messagesAdapter.setAll(state, messages);
      })
      .addCase(removeChannel, (state, action) => {
        const { id: removedChannelId } = action.payload;
        const { ids, entities } = state;
        const messageIdsInRemovedChannel = ids
          .filter((id) => entities[id].channelId === removedChannelId);

        messagesAdapter.removeMany(state, messageIdsInRemovedChannel);
      });
  },
});

export const { newMessage } = messagesSlice.actions;

export const {
  selectIds,
  selectEntities,
} = messagesAdapter.getSelectors((state) => state.messages);

export default messagesSlice.reducer;
