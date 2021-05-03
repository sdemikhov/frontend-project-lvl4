import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

import { getChatData } from './chat-data-slice.js';

const channelsAdapter = createEntityAdapter();

export const channelsSlice = createSlice({
  name: 'channels',
  initialState: channelsAdapter.getInitialState({ currentChannelId: null }),
  reducers: {},
  extraReducers: {
    [getChatData.fulfilled]: (state, action) => {
      const { channels, currentChannelId } = action.payload;

      channelsAdapter.setAll(state, channels);
      state.currentChannelId = currentChannelId;
    },
  },
});
