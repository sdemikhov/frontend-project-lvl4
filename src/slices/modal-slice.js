import { createSlice } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';

const modalSlice = createSlice({
  name: 'modalInfo',
  initialState: {
    isOpened: false,
    type: null,
    extra: null,
  },
  reducers: {
    openModal: (state, action) => {
      const { type, extra = null } = action.payload;
      return { isOpened: true, type, extra };
    },
    closeModal: () => ({ isOpened: false, type: null, extra: null }),
  },
});

export const selectChannelIdForModal = createSelector(
  ({ modalInfo }) => modalInfo.extra,
  (extra) => {
    if (extra) {
      return extra.channelId;
    }

    return null;
  },
);

export const selectChannelNameForModal = createSelector(
  selectChannelIdForModal,
  ({ channelsInfo }) => channelsInfo.channels,
  (selectedChannelId, channels) => {
    if (selectedChannelId) {
      const [selectedChannel] = channels.filter(({ id }) => id === selectedChannelId);
      return selectedChannel.name;
    }

    return '';
  },
);

export const { openModal, closeModal } = modalSlice.actions;

export default modalSlice.reducer;
