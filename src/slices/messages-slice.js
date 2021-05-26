/* eslint-disable no-param-reassign, */
import { createSlice } from '@reduxjs/toolkit';

import { setInitialState, removeChannel } from './channels-slice.js';

const messagesSlice = createSlice({
  name: 'messagesInfo',
  initialState: { messages: [] },
  reducers: {
    newMessage: (state, actions) => {
      state.messages.push(actions.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setInitialState, (state, action) => {
        const { messages } = action.payload;

        state.messages = messages;
      })
      .addCase(removeChannel, (state, action) => {
        const { id: removedChannelId } = action.payload;

        const newMessages = state.messages
          .filter(({ channelId }) => channelId !== removedChannelId);
        state.messages = newMessages;
      });
  },
});

export const { newMessage } = messagesSlice.actions;

export default messagesSlice.reducer;
