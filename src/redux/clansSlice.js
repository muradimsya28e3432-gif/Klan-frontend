import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/client';
import { logout } from './authSlice';
import { fetchProfile } from './usersSlice';

const initialState = { list: [], loading: false };

export const fetchClans = createAsyncThunk('clans/list', () => api('/clans?limit=50'));

const mutate = (name, call) => createAsyncThunk(`clans/${name}`, async (arg, { dispatch, rejectWithValue }) => {
  try {
    const r = await call(arg);
    await Promise.all([dispatch(fetchClans()), dispatch(fetchProfile())]); // siyahı və profil təzələnsin
    return r;
  } catch (e) { return rejectWithValue(e.message); }
});

export const createClan = mutate('create', (name) => api('/clans', { method: 'POST', body: { name } }));
export const joinClan = mutate('join', (id) => api(`/clans/${id}/join`, { method: 'POST' }));
export const leaveClan = mutate('leave', () => api('/clans/leave', { method: 'POST' }));

const slice = createSlice({
  name: 'clans',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(logout, () => initialState)
      .addCase(fetchClans.pending, (s) => { s.loading = true; })
      .addCase(fetchClans.fulfilled, (s, a) => { s.loading = false; s.list = a.payload; })
      .addCase(fetchClans.rejected, (s) => { s.loading = false; });
  },
});

export default slice.reducer;