/* eslint-disable no-param-reassign, */
import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

import { getChatData } from './chat-data-slice.js';

const channelsAdapter = createEntityAdapter();

const channelsSlice = createSlice({
  name: 'channels',
  initialState: channelsAdapter.getInitialState({ currentChannelId: null }),
  reducers: {
    setCurrentChannelId(state, action) {
      state.currentChannelId = action.payload;
    },
  },
  extraReducers: {
    [getChatData.fulfilled]: (state, action) => {
      const { channels, currentChannelId } = action.payload;

      channelsAdapter.setAll(state, channels);
      state.currentChannelId = currentChannelId;
    },
  },
});

export const { setCurrentChannelId } = channelsSlice.actions;
export default channelsSlice.reducer;
