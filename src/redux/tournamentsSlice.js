import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/client';
import { logout } from './authSlice';
import { fetchBalance } from './walletSlice';

// missing: backend-də /tournaments hələ yoxdursa (404) true olur
const initialState = { list: [], loading: false, missing: false };

// GET /tournaments -> [{ id, name, type: daily|weekly|monthly|seasonal, status: upcoming|active|finished,
//   prizePool, entryFee, participants, maxParticipants, startsAt, endsAt, joined }]
export const fetchTournaments = createAsyncThunk(
  'tournaments/list',
  async (_, { rejectWithValue }) => {
    try { return await api('/tournaments?limit=50'); }
    catch (e) { return rejectWithValue(e.message, { status: e.status }); }
  },
  { condition: (_, { getState }) => !getState().tournaments.missing },
);

// POST /tournaments/:id/join
export const joinTournament = createAsyncThunk('tournaments/join', async (id, { dispatch, rejectWithValue }) => {
  try {
    const r = await api(`/tournaments/${id}/join`, { method: 'POST' });
    dispatch(fetchBalance());
    dispatch(fetchTournaments());
    return r;
  } catch (e) { return rejectWithValue(e.message); }
});

const slice = createSlice({
  name: 'tournaments',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(logout, () => initialState)
      .addCase(fetchTournaments.pending, (s) => { s.loading = true; })
      .addCase(fetchTournaments.fulfilled, (s, a) => { s.loading = false; s.list = Array.isArray(a.payload) ? a.payload : []; })
      .addCase(fetchTournaments.rejected, (s, a) => {
        s.loading = false;
        if (a.meta.status === 404) s.missing = true;
      });
  },
});

export default slice.reducer;