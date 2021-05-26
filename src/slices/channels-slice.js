/* eslint-disable no-param-reassign, */
import { createSlice } from '@reduxjs/toolkit';

const channelsSlice = createSlice({
  name: 'channelsInfo',
  initialState: { defaultChannelId: null, currentChannelId: null, channels: [] },
  reducers: {
    setInitialState: (state, action) => {
      const { channels, currentChannelId } = action.payload;

      state.channels = channels;
      state.currentChannelId = currentChannelId;
      state.defaultChannelId = currentChannelId;
    },
    setCurrentChannelId: (state, action) => {
      state.currentChannelId = action.payload;
    },
    removeChannel: (state, action) => {
      const { currentChannelId, defaultChannelId } = state;
      const removedChannelId = action.payload;

      if (currentChannelId === removedChannelId) {
        state.currentChannelId = defaultChannelId;
      }

      const newChannels = state.channels.filter(({ id }) => id !== removedChannelId);
      state.channels = newChannels;
    },
    renameChannel: (state, action) => {
      const updatedChannel = action.payload;

      const newChannels = state.channels.reduce((acc, channel) => {
        if (channel.id === updatedChannel.id) {
          return [...acc, updatedChannel];
        }

        return [...acc, channel];
      }, []);

      state.channels = newChannels;
    },
    newChannel: (state, action) => {
      state.channels.push(action.payload);
    },
  },
});

export const selectCurrentChannelId = ({ channelsInfo }) => channelsInfo.currentChannelId;

export const {
  setInitialState,
  setCurrentChannelId,
  removeChannel,
  renameChannel,
  newChannel,
} = channelsSlice.actions;

export default channelsSlice.reducer;
