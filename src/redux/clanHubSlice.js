import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/client';
import { logout } from './authSlice';

// missing: endpoint backend-də yoxdursa (404) true olur, təkrar sorğu göndərilmir
const initialState = { stats: null, members: [], missing: { stats: false, members: false } };

export const fetchClanStats = createAsyncThunk(
  'clanHub/stats',
  async (_, { rejectWithValue }) => {
    try { return await api('/clan-hub/stats'); } catch (e) { return rejectWithValue(e.message, { status: e.status }); }
  },
  { condition: (_, { getState }) => !getState().clanHub.missing.stats },
);

export const fetchClanMembers = createAsyncThunk(
  'clanHub/members',
  async (_, { rejectWithValue }) => {
    try { return await api('/clan-hub/members'); } catch (e) { return rejectWithValue(e.message, { status: e.status }); }
  },
  { condition: (_, { getState }) => !getState().clanHub.missing.members },
);

const slice = createSlice({
  name: 'clanHub',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(logout, () => initialState)
      .addCase(fetchClanStats.fulfilled, (s, a) => { s.stats = a.payload; })
      .addCase(fetchClanStats.rejected, (s, a) => { if (a.meta.status === 404) s.missing.stats = true; })
      .addCase(fetchClanMembers.fulfilled, (s, a) => { s.members = a.payload; })
      .addCase(fetchClanMembers.rejected, (s, a) => { if (a.meta.status === 404) s.missing.members = true; });
  },
});

export default slice.reducer;