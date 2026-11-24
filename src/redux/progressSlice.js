import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/client';
import { logout } from './authSlice';

const initialState = { me: null, achievements: [], medals: [], season: null, users: [], clans: [], by: 'season' };

// xətanı mesaj kimi qaytaran fabrik
const call = (name, fn) => createAsyncThunk(`progress/${name}`, async (arg, { rejectWithValue }) => {
  try { return await fn(arg); } catch (e) { return rejectWithValue(e.message); }
});

export const fetchProgress = call('me', () => api('/progress/me')); // XP, səviyyə, mövsümdə yerim
export const fetchAchievements = call('achievements', () => api('/progress/achievements')); // nailiyyət + medal
export const fetchSeason = call('season', () => api('/progress/season')); // aktiv mövsüm + keçmiş
export const fetchUserBoard = call('userBoard', (by) => api(`/progress/leaderboard/users?by=${by}&limit=50`)); // oyunçu reytinqi
export const fetchClanBoard = call('clanBoard', () => api('/progress/leaderboard/clans?limit=50')); // klan reytinqi

const slice = createSlice({
  name: 'progress',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(logout, () => initialState)
      .addCase(fetchProgress.fulfilled, (s, a) => { s.me = a.payload; })
      .addCase(fetchAchievements.fulfilled, (s, a) => { s.achievements = a.payload.achievements; s.medals = a.payload.medals; })
      .addCase(fetchSeason.fulfilled, (s, a) => { s.season = a.payload; })
      .addCase(fetchUserBoard.fulfilled, (s, a) => { s.users = a.payload; s.by = a.meta.arg; })
      .addCase(fetchClanBoard.fulfilled, (s, a) => { s.clans = a.payload; });
  },
});

export default slice.reducer;