import { createSlice } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';

const modalSlice = createSlice({
  name: 'modal',
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

export const getChannelIdForModal = createSelector(
  ({ modal }) => modal.extra,
  (extra) => {
    if (extra) {
      return extra.channelId;
    }

    return null;
  },
);

export const getChannelNameForModal = createSelector(
  getChannelIdForModal,
  ({ channels }) => channels.entities,
  (id, entities) => {
    if (id) {
      return entities[id].name;
    }

    return '';
  },
);

export const { openModal, closeModal } = modalSlice.actions;

export default modalSlice.reducer;
