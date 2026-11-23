import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/client';
import { logout } from './authSlice';

const initialState = { me: null, results: null, searching: false, searchReqId: null };

export const fetchProfile = createAsyncThunk('users/me', () => api('/users/me'));

// q: axtarış sözü, type: 'all' | 'users' | 'clans' (backend users və clans kolleksiyalarından canlı çəkir)
export const searchAll = createAsyncThunk('users/search', async ({ q, type = 'all' }, { rejectWithValue }) => {
  try { return await api(`/users/search?q=${encodeURIComponent(q)}&type=${type}&limit=20`); }
  catch (e) { return rejectWithValue(e.message); }
});

export const toggleFollow = createAsyncThunk('users/follow', async (id, { rejectWithValue }) => {
  try { const r = await api(`/users/${id}/follow`, { method: 'POST' }); return { id, followed: r.followed }; }
  catch (e) { return rejectWithValue(e.message); }
});

const slice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearResults: (s) => { s.results = null; s.searching = false; s.searchReqId = null; }, // axtarış sahəsi boşalanda
  },
  extraReducers: (b) => {
    b.addCase(logout, () => initialState)
      .addCase(fetchProfile.fulfilled, (s, a) => { s.me = a.payload; })
      .addCase(searchAll.pending, (s, a) => { s.searching = true; s.searchReqId = a.meta.requestId; })
      .addCase(searchAll.fulfilled, (s, a) => {
        if (s.searchReqId !== a.meta.requestId) return; // köhnə sorğunun gec gələn cavabı nəticəni əzməsin
        s.searching = false; s.results = a.payload;
      })
      .addCase(searchAll.rejected, (s, a) => {
        if (s.searchReqId === a.meta.requestId) s.searching = false;
      })
      .addCase(toggleFollow.fulfilled, (s, a) => {
        const u = s.results && s.results.users.find((x) => x.id === a.payload.id);
        if (u) {
          u.followed = a.payload.followed;
          u.followersCount = Math.max(0, u.followersCount + (a.payload.followed ? 1 : -1)); // izləyici sayı dərhal yenilənir
        }
        if (s.me) s.me.followingCount = Math.max(0, s.me.followingCount + (a.payload.followed ? 1 : -1));
      });
  },
});

export const { clearResults } = slice.actions;
export default slice.reducer;