/* eslint-disable no-param-reassign, */
import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

import { getChatData } from './chat-data-slice.js';

const messagesAdapter = createEntityAdapter();

const messagesSlice = createSlice({
  name: 'messages',
  initialState: messagesAdapter.getInitialState(),
  reducers: {},
  extraReducers: {
    [getChatData.fulfilled]: (state, action) => {
      const { messages } = action.payload;

      messagesAdapter.setAll(state, messages);
    },
  },
});

export default messagesSlice.reducer;
