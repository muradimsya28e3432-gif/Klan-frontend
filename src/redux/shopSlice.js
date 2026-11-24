import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/client';
import { logout } from './authSlice';
import { fetchBalance } from './walletSlice';

const initialState = { items: [], loading: false, missing: false };

// GET /shop/items -> [{ id, name, category: avatar|frame|badge|other, price, icon, description, owned, equipped }]
export const fetchShopItems = createAsyncThunk(
  'shop/list',
  async (_, { rejectWithValue }) => {
    try { return await api('/shop/items'); }
    catch (e) { return rejectWithValue(e.message, { status: e.status }); }
  },
  { condition: (_, { getState }) => !getState().shop.missing },
);

// POST /shop/items/:id/buy
export const buyItem = createAsyncThunk('shop/buy', async (id, { dispatch, rejectWithValue }) => {
  try {
    const r = await api(`/shop/items/${id}/buy`, { method: 'POST' });
    dispatch(fetchBalance());
    dispatch(fetchShopItems());
    return r;
  } catch (e) { dispatch(fetchBalance()); return rejectWithValue(e.message); }
});

// POST /shop/items/:id/equip
export const equipItem = createAsyncThunk('shop/equip', async (id, { dispatch, rejectWithValue }) => {
  try {
    const r = await api(`/shop/items/${id}/equip`, { method: 'POST' });
    dispatch(fetchShopItems());
    return r;
  } catch (e) { return rejectWithValue(e.message); }
});

const slice = createSlice({
  name: 'shop',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(logout, () => initialState)
      .addCase(fetchShopItems.pending, (s) => { s.loading = true; })
      .addCase(fetchShopItems.fulfilled, (s, a) => { s.loading = false; s.items = Array.isArray(a.payload) ? a.payload : []; })
      .addCase(fetchShopItems.rejected, (s, a) => {
        s.loading = false;
        if (a.meta.status === 404) s.missing = true;
      });
  },
});

export default slice.reducer;