/* eslint-disable no-param-reassign, */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

import routes from '../routes.js';

export const getChatData = createAsyncThunk(
  'data/getChatData',
  async (token) => {
    const response = await axios.get(routes.chatDataPath(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  },
);

const chatDataSlice = createSlice(
  {
    name: 'chatData',
    initialState: { loading: 'idle', error: null },
    reducers: {
      setLoading: (state, action) => {
        state.loading = action.payload;
      },
    },
    extraReducers: {
      [getChatData.pending]: (state) => ({ ...state, loading: 'pending' }),
      [getChatData.fulfilled]: (state) => ({ ...state, loading: 'fulfilled' }),
      [getChatData.rejected]: (state) => ({ ...state, loading: 'rejected' }),
    },
  },
);

export const { setLoading } = chatDataSlice.actions;

export default chatDataSlice.reducer;
