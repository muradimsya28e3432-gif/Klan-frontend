import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/client';
import { logout } from './authSlice';
import { fetchDuel, duelUpdated } from './duelSlice';
import { toQepik } from '../utils/money';

const initialState = { stats: null, users: [], payouts: [], withdrawals: [] };

// xətanı mesaj kimi qaytaran sarğı (uiSlice onu bildiriş kimi göstərir)
const wrap = (fn) => async (arg, thunk) => {
  try { return await fn(arg, thunk); } catch (e) { return thunk.rejectWithValue(e.message); }
};

export const fetchAdminStats = createAsyncThunk('admin/stats', wrap(() => api('/admin/stats')));
export const fetchWithdrawals = createAsyncThunk('admin/withdrawals', wrap(() => api('/admin/platform/withdrawals?limit=20')));

export const fetchAdminUsers = createAsyncThunk('admin/users', wrap((q) => api(`/admin/users?limit=50${q ? `&q=${encodeURIComponent(q)}` : ''}`)));
export const setBan = createAsyncThunk('admin/ban', wrap(({ id, banned }) => api(`/admin/users/${id}/${banned ? 'ban' : 'unban'}`, { method: 'POST' })));

export const adminCreateDuel = createAsyncThunk('admin/createDuel', wrap(async (body, { dispatch }) => {
  const r = await api('/admin/duels', { method: 'POST', body });
  dispatch(fetchDuel());
  return r;
}));

export const adminFinishDuel = createAsyncThunk('admin/finishDuel', wrap(async (id, { dispatch }) => {
  const r = await api(`/admin/duels/${id}/finish`, { method: 'POST' });
  dispatch(duelUpdated(r));
  dispatch(fetchAdminStats());
  return r;
}));

export const fetchAdminPayouts = createAsyncThunk('admin/payouts', wrap((status) => api(`/admin/payouts?limit=50${status ? `&status=${status}` : ''}`)));

export const approvePayout = createAsyncThunk('admin/approve', wrap(async ({ id, providerRef }, { dispatch }) => {
  const r = await api(`/admin/payouts/${id}/approve`, { method: 'POST', body: providerRef ? { providerRef } : {} });
  dispatch(fetchAdminStats());
  return r;
}));

export const rejectPayout = createAsyncThunk('admin/reject', wrap(async ({ id, note }, { dispatch }) => {
  const r = await api(`/admin/payouts/${id}/reject`, { method: 'POST', body: note ? { note } : {} });
  dispatch(fetchAdminStats());
  return r;
}));

export const platformWithdraw = createAsyncThunk('admin/withdraw', wrap(async ({ amount, note }, { dispatch }) => {
  const r = await api('/admin/platform/withdraw', { method: 'POST', body: { amount: toQepik(amount), ...(note ? { note } : {}) } });
  dispatch(fetchAdminStats()); dispatch(fetchWithdrawals());
  return r;
}));

const slice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(logout, () => initialState)
      .addCase(fetchAdminStats.fulfilled, (s, a) => { s.stats = a.payload; })
      .addCase(fetchWithdrawals.fulfilled, (s, a) => { s.withdrawals = a.payload; })
      .addCase(fetchAdminUsers.fulfilled, (s, a) => { s.users = a.payload; })
      .addCase(setBan.fulfilled, (s, a) => {
        const u = s.users.find((x) => x._id === a.payload.id);
        if (u) u.isBanned = a.payload.isBanned;
      })
      .addCase(fetchAdminPayouts.fulfilled, (s, a) => { s.payouts = a.payload; })
      .addCase(approvePayout.fulfilled, (s, a) => {
        const p = s.payouts.find((x) => x._id === a.payload.id);
        if (p) p.status = a.payload.status;
      })
      .addCase(rejectPayout.fulfilled, (s, a) => {
        const p = s.payouts.find((x) => x._id === a.payload.id);
        if (p) p.status = a.payload.status;
      });
  },
});

export default slice.reducer;