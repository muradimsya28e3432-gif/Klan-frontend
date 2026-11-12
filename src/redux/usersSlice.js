import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/client';
import { logout } from './authSlice';

const initialState = { me: null, results: null, searching: false };

export const fetchProfile = createAsyncThunk('users/me', () => api('/users/me'));

export const searchAll = createAsyncThunk('users/search', async (q, { rejectWithValue }) => {
  try { return await api(`/users/search?q=${encodeURIComponent(q)}`); }
  catch (e) { return rejectWithValue(e.message); }
});

export const toggleFollow = createAsyncThunk('users/follow', async (id, { rejectWithValue }) => {
  try { const r = await api(`/users/${id}/follow`, { method: 'POST' }); return { id, followed: r.followed }; }
  catch (e) { return rejectWithValue(e.message); }
});

const slice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(logout, () => initialState)
      .addCase(fetchProfile.fulfilled, (s, a) => { s.me = a.payload; })
      .addCase(searchAll.pending, (s) => { s.searching = true; })
      .addCase(searchAll.fulfilled, (s, a) => { s.searching = false; s.results = a.payload; })
      .addCase(searchAll.rejected, (s) => { s.searching = false; })
      .addCase(toggleFollow.fulfilled, (s, a) => {
        const u = s.results && s.results.users.find((x) => x.id === a.payload.id);
        if (u) u.followed = a.payload.followed;
        if (s.me) s.me.followingCount = Math.max(0, s.me.followingCount + (a.payload.followed ? 1 : -1));
      });
  },
});

export default slice.reducer;