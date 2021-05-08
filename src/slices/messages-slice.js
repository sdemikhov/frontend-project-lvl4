/* eslint-disable no-param-reassign, */
import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

import { getChatData } from './chat-data-slice.js';

const messagesAdapter = createEntityAdapter({
  sortComparer: (message1, message2) => message1.id - message2.id,
});

const messagesSlice = createSlice({
  name: 'messages',
  initialState: messagesAdapter.getInitialState(),
  reducers: {
    addMessage: messagesAdapter.addOne,
  },
  extraReducers: {
    [getChatData.fulfilled]: (state, action) => {
      const { messages } = action.payload;

      messagesAdapter.upsertMany(state, messages);
    },
  },
});

export const { addMessage } = messagesSlice.actions;

export default messagesSlice.reducer;
