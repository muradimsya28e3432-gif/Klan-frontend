import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/client';
import { logout } from './authSlice';

const initialState = { stats: null, members: [] };

export const fetchClanStats = createAsyncThunk('clanHub/stats', async (_, { rejectWithValue }) => {
  try { return await api('/clan-hub/stats'); } catch (e) { return rejectWithValue(e.message); }
});
export const fetchClanMembers = createAsyncThunk('clanHub/members', async (_, { rejectWithValue }) => {
  try { return await api('/clan-hub/members'); } catch (e) { return rejectWithValue(e.message); }
});

const slice = createSlice({
  name: 'clanHub',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(logout, () => initialState)
      .addCase(fetchClanStats.fulfilled, (s, a) => { s.stats = a.payload; })
      .addCase(fetchClanMembers.fulfilled, (s, a) => { s.members = a.payload; });
  },
});

export default slice.reducer;