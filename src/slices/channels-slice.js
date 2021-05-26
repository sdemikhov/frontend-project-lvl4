/* eslint-disable no-param-reassign, */
import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

const channelsAdapter = createEntityAdapter({
  sortComparer: (channel1, channel2) => channel1.id - channel2.id,
});

const channelsSlice = createSlice({
  name: 'channels',
  initialState: channelsAdapter.getInitialState(
    { currentChannelId: null, defaultChannelId: null },
  ),
  reducers: {
    setInitialState: (state, action) => {
      const { channels, currentChannelId } = action.payload;

      channelsAdapter.setAll(state, channels);
      state.currentChannelId = currentChannelId;
      state.defaultChannelId = currentChannelId;
    },
    setCurrentChannelId: (state, action) => {
      state.currentChannelId = action.payload;
    },
    removeChannel: (state, action) => {
      const { currentChannelId, defaultChannelId } = state;
      const id = action.payload;

      if (currentChannelId === id) {
        state.currentChannelId = defaultChannelId;
      }

      channelsAdapter.removeOne(state, action);
    },
    renameChannel: channelsAdapter.updateOne,
    newChannel: channelsAdapter.addOne,
  },
});

export const selectCurrentChannelId = ({ channels }) => channels.currentChannelId;

export const {
  setInitialState,
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
