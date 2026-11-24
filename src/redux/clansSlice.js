import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/client';
import { getSocket } from '../api/socket';
import { logout } from './authSlice';
import { fetchProfile } from './usersSlice';

// incoming: klan sahibinə gələn gözləyən istəklər, sent: mənim göndərdiyim istəklər
const initialState = { list: [], loading: false, incoming: [], sent: [] };

export const fetchClans = createAsyncThunk('clans/list', () => api('/clans?limit=50'));
export const fetchIncoming = createAsyncThunk('clans/incoming', () => api('/clans/requests/incoming'));
export const fetchMyRequests = createAsyncThunk('clans/myRequests', () => api('/clans/requests/mine'));

const mutate = (name, call) => createAsyncThunk(`clans/${name}`, async (arg, { dispatch, rejectWithValue }) => {
  try {
    const r = await call(arg);
    await Promise.all([dispatch(fetchClans()), dispatch(fetchProfile()), dispatch(fetchMyRequests())]); // siyahı, profil və istəklər təzələnsin
    getSocket()?.emit('clan:join'); // YENİ: socket klan otağı yenilənsin (klan çatı üçün)
    return r;
  } catch (e) { return rejectWithValue(e.message); }
});

export const createClan = mutate('create', (name) => api('/clans', { method: 'POST', body: { name } }));
export const joinClan = mutate('join', (id) => api(`/clans/${id}/join`, { method: 'POST' })); // İSTƏK göndərir
export const leaveClan = mutate('leave', () => api('/clans/leave', { method: 'POST' }));

// Klan sahibi: istəyi qəbul et / rədd et (id = istəyin ID-si)
export const acceptRequest = createAsyncThunk('clans/accept', async (id, { dispatch, rejectWithValue }) => {
  try {
    const r = await api(`/clans/requests/${id}/accept`, { method: 'POST' });
    dispatch(fetchClans()); dispatch(fetchProfile());
    return r;
  } catch (e) { dispatch(fetchIncoming()); return rejectWithValue(e.message); }
});

export const rejectRequest = createAsyncThunk('clans/reject', async (id, { dispatch, rejectWithValue }) => {
  try { return await api(`/clans/requests/${id}/reject`, { method: 'POST' }); }
  catch (e) { dispatch(fetchIncoming()); return rejectWithValue(e.message); }
});

const slice = createSlice({
  name: 'clans',
  initialState,
  reducers: {
    addIncoming: (s, a) => { if (!s.incoming.some((x) => x.id === a.payload.id)) s.incoming.unshift(a.payload); }, // socket: clan:request
  },
  extraReducers: (b) => {
    b.addCase(logout, () => initialState)
      .addCase(fetchClans.pending, (s) => { s.loading = true; })
      .addCase(fetchClans.fulfilled, (s, a) => { s.loading = false; s.list = a.payload; })
      .addCase(fetchClans.rejected, (s) => { s.loading = false; })
      .addCase(fetchIncoming.fulfilled, (s, a) => { s.incoming = a.payload; })
      .addCase(fetchMyRequests.fulfilled, (s, a) => { s.sent = a.payload; })
      .addCase(acceptRequest.fulfilled, (s, a) => { s.incoming = s.incoming.filter((x) => x.id !== a.meta.arg); })
      .addCase(rejectRequest.fulfilled, (s, a) => { s.incoming = s.incoming.filter((x) => x.id !== a.meta.arg); });
  },
});

export const { addIncoming } = slice.actions;
export default slice.reducer;