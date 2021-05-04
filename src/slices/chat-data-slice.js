import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

import routes from '../routes.js';
import { useAuth } from '../use-auth.jsx';

export const getChatData = createAsyncThunk(
  'data/getChatData',
  async () => {
    const auth = useAuth();
    const response = await axios.get(routes.chatDataPath(), {
      headers: { Authorization: `Bearer ${auth.token}` },
    });

    return response.data;
  },
);

const chatDataSlice = createSlice(
  {
    name: 'chatData',
    initialState: { loading: 'idle', error: null },
    reducers: {},
    extraReducers: {
      [getChatData.pending]: (state) => ({ ...state, loading: 'pending' }),
      [getChatData.fulfilled]: (state) => ({ ...state, loading: 'fulfilled' }),
      [getChatData.rejected]: (state, action) => ({ ...state, loading: 'rejected', error: action.error }),
    },
  },
);

export default chatDataSlice.reducer;
