/* eslint-disable no-param-reassign, */
import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

import { getChatData } from './chat-data-slice.js';

const channelsAdapter = createEntityAdapter({
  sortComparer: (channel1, channel2) => channel1.id - channel2.id,
});

const channelsSlice = createSlice({
  name: 'channels',
  initialState: channelsAdapter.getInitialState({ currentChannelId: null }),
  reducers: {
    setCurrentChannelId(state, action) {
      state.currentChannelId = action.payload;
    },
    removeChannel: (state, action) => {
      const { currentChannelId, ids } = state;
      const id = action.payload;

      if (currentChannelId === id) {
        const firstChannelId = ids[0];
        state.currentChannelId = firstChannelId;
      }

      channelsAdapter.removeOne(state, action);
    },
    renameChannel: channelsAdapter.updateOne,
    newChannel: channelsAdapter.addOne,
  },
  extraReducers: {
    [getChatData.fulfilled]: (state, action) => {
      const { channels, currentChannelId } = action.payload;

      channelsAdapter.upsertMany(state, channels);
      state.currentChannelId = currentChannelId;
    },
  },
});

export const selectCurrentChannelId = ({ channels }) => channels.currentChannelId;

export const {
  setCurrentChannelId,
  removeChannel,
  renameChannel,
  newChannel,
} = channelsSlice.actions;

export const {
  selectById,
  selectIds,
} = channelsAdapter.getSelectors((state) => state.channels);

export default channelsSlice.reducer;
