import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/client';
import { logout } from './authSlice';

// missing: backend-də həmin endpoint hələ yoxdursa (404) true olur və sessiya boyu təkrar sorğu göndərilmir
const initialState = {
  me: null, achievements: [], medals: [], season: null, users: [], clans: [], by: 'season',
  missing: { season: false, users: false, clans: false },
};

// xətanı mesaj kimi qaytaran fabrik; status meta-da saxlanılır (404 aşkarlamaq üçün)
// missingKey verilibsə və həmin endpoint artıq 404 veribsə, sorğu ümumiyyətlə göndərilmir
const call = (name, fn, missingKey) => createAsyncThunk(
  `progress/${name}`,
  async (arg, { rejectWithValue }) => {
    try { return await fn(arg); } catch (e) { return rejectWithValue(e.message, { status: e.status }); }
  },
  missingKey ? { condition: (_, { getState }) => !getState().progress.missing[missingKey] } : undefined,
);

export const fetchProgress = call('me', () => api('/progress/me')); // XP, səviyyə, mövsümdə yerim
export const fetchAchievements = call('achievements', () => api('/progress/achievements')); // nailiyyət + medal
export const fetchSeason = call('season', () => api('/progress/season'), 'season'); // aktiv mövsüm + keçmiş
export const fetchUserBoard = call('userBoard', (by) => api(`/progress/leaderboard/users?by=${by}&limit=50`), 'users'); // oyunçu reytinqi
export const fetchClanBoard = call('clanBoard', () => api('/progress/leaderboard/clans?limit=50'), 'clans'); // klan reytinqi

const slice = createSlice({
  name: 'progress',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(logout, () => initialState)
      .addCase(fetchProgress.fulfilled, (s, a) => { s.me = a.payload; })
      .addCase(fetchAchievements.fulfilled, (s, a) => { s.achievements = a.payload.achievements; s.medals = a.payload.medals; })
      .addCase(fetchSeason.fulfilled, (s, a) => { s.season = a.payload; })
      .addCase(fetchSeason.rejected, (s, a) => { if (a.meta.status === 404) s.missing.season = true; })
      // seçim (Mövsüm / Ümumi XP) düyməsi dərhal dəyişsin, cavabı gözləməsin
      .addCase(fetchUserBoard.pending, (s, a) => { s.by = a.meta.arg; })
      .addCase(fetchUserBoard.fulfilled, (s, a) => {
        if (a.meta.arg !== s.by) return; // köhnə sorğunun gec gələn cavabı yeni seçimi əzməsin
        s.users = a.payload;
      })
      .addCase(fetchUserBoard.rejected, (s, a) => { if (a.meta.status === 404) s.missing.users = true; })
      .addCase(fetchClanBoard.fulfilled, (s, a) => { s.clans = a.payload; })
      .addCase(fetchClanBoard.rejected, (s, a) => { if (a.meta.status === 404) s.missing.clans = true; });
  },
});

export default slice.reducer;