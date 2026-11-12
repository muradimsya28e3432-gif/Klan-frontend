import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/client';
import { logout } from './authSlice';
import { fetchBalance } from './walletSlice';

const initialState = { duel: null, loaded: false, gifts: [], selected: { category: 0, sub: 0 }, sending: false, history: [] };

export const fetchDuel = createAsyncThunk('duel/fetch', async (_, { rejectWithValue }) => {
  try { return await api('/duels/current'); }
  catch (e) { return e.status === 404 ? null : rejectWithValue(e.message); } // aktiv duel yoxdur
});

export const fetchGifts = createAsyncThunk('duel/gifts', () => api('/duels/gifts'));
export const fetchDuelHistory = createAsyncThunk('duel/history', () => api('/duels/history?limit=10'));

// side: 'A' | 'B'
export const sendGift = createAsyncThunk('duel/sendGift', async (side, { getState, dispatch, rejectWithValue }) => {
  const { duel, selected } = getState().duel;
  try {
    const r = await api(`/duels/${duel.id}/gift`, { method: 'POST', body: { side, category: selected.category, sub: selected.sub } });
    dispatch(fetchBalance());
    return r;
  } catch (e) { dispatch(fetchBalance()); return rejectWithValue(e.message); }
});

const slice = createSlice({
  name: 'duel',
  initialState,
  reducers: {
    // socket: duel:update / duel:finished
    duelUpdated: (s, a) => { if (!s.duel || s.duel.id === a.payload.id) s.duel = a.payload; },
    selectGift: (s, a) => { s.selected = { ...s.selected, ...a.payload }; },
  },
  extraReducers: (b) => {
    b.addCase(logout, () => initialState)
      .addCase(fetchDuel.fulfilled, (s, a) => { s.duel = a.payload; s.loaded = true; })
      .addCase(fetchDuel.rejected, (s) => { s.loaded = true; })
      .addCase(fetchGifts.fulfilled, (s, a) => { s.gifts = a.payload; })
      .addCase(fetchDuelHistory.fulfilled, (s, a) => { s.history = a.payload; })
      .addCase(sendGift.pending, (s) => { s.sending = true; })
      .addCase(sendGift.fulfilled, (s, a) => { s.sending = false; s.duel = a.payload.duel; })
      .addCase(sendGift.rejected, (s) => { s.sending = false; });
  },
});

export const { duelUpdated, selectGift } = slice.actions;
export default slice.reducer;