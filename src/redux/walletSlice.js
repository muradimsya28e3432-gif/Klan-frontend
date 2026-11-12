import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/client';
import { authenticate, fetchMe, logout } from './authSlice';
import { toQepik } from '../utils/money';

const initialState = { balance: 0, totalGifted: 0, order: null, busy: false, history: [], payouts: [], payoutBusy: false };

export const fetchBalance = createAsyncThunk('wallet/balance', () => api('/wallet/balance'));
export const fetchHistory = createAsyncThunk('wallet/history', () => api('/wallet/history?limit=30'));
export const fetchPayouts = createAsyncThunk('wallet/payouts', () => api('/wallet/payouts'));

export const createTopUp = createAsyncThunk('wallet/topup', async (aznAmount, { rejectWithValue }) => {
  try { return await api('/payments/orders', { method: 'POST', body: { amount: toQepik(aznAmount) } }); }
  catch (e) { return rejectWithValue(e.message); }
});

// Yalnız backend-də ALLOW_DEV_PAYMENTS=true olanda işləyir
export const devConfirm = createAsyncThunk('wallet/devConfirm', async (orderId, { dispatch, rejectWithValue }) => {
  try { const r = await api(`/payments/orders/${orderId}/dev-confirm`, { method: 'POST' }); dispatch(fetchBalance()); return r; }
  catch (e) { return rejectWithValue(e.message); }
});

// Pul çıxarma sorğusu: amount AZN-lə, cardNumber boşluqlu ola bilər
export const requestPayout = createAsyncThunk('wallet/requestPayout', async ({ amount, cardNumber }, { dispatch, rejectWithValue }) => {
  try {
    const r = await api('/wallet/payouts', { method: 'POST', body: { amount: toQepik(amount), cardNumber } });
    dispatch(fetchBalance()); dispatch(fetchPayouts()); dispatch(fetchHistory());
    return r;
  } catch (e) { return rejectWithValue(e.message); }
});

const slice = createSlice({
  name: 'wallet',
  initialState,
  reducers: { clearOrder: (s) => { s.order = null; } },
  extraReducers: (b) => {
    b.addCase(logout, () => initialState)
      .addCase(authenticate.fulfilled, (s, a) => { s.balance = a.payload.user.balance; })
      .addCase(fetchMe.fulfilled, (s, a) => { s.balance = a.payload.balance; })
      .addCase(fetchBalance.fulfilled, (s, a) => { s.balance = a.payload.balance; s.totalGifted = a.payload.totalGifted; })
      .addCase(fetchHistory.fulfilled, (s, a) => { s.history = a.payload; })
      .addCase(fetchPayouts.fulfilled, (s, a) => { s.payouts = a.payload; })
      .addCase(createTopUp.pending, (s) => { s.busy = true; })
      .addCase(createTopUp.fulfilled, (s, a) => { s.busy = false; s.order = a.payload; })
      .addCase(createTopUp.rejected, (s) => { s.busy = false; })
      .addCase(devConfirm.fulfilled, (s) => { s.order = null; })
      .addCase(requestPayout.pending, (s) => { s.payoutBusy = true; })
      .addCase(requestPayout.fulfilled, (s) => { s.payoutBusy = false; })
      .addCase(requestPayout.rejected, (s) => { s.payoutBusy = false; });
  },
});

export const { clearOrder } = slice.actions;
export default slice.reducer;