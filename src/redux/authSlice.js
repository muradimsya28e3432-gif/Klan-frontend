import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/client';

// localStorage-dakı tokeni oxuyur; vaxtı bitibsə və ya pozuqdursa silir
const readToken = () => {
  const t = localStorage.getItem('token');
  if (!t) return null;
  try {
    const payload = JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && payload.exp * 1000 < Date.now()) { localStorage.removeItem('token'); return null; }
    return t;
  } catch {
    localStorage.removeItem('token');
    return null;
  }
};

// mode: 'login' | 'register'
export const authenticate = createAsyncThunk('auth/authenticate', async ({ mode, username, password }, { rejectWithValue }) => {
  try { return await api(`/auth/${mode}`, { method: 'POST', body: { username, password }, token: null }); }
  catch (e) { return rejectWithValue(e.message); }
});

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try { return (await api('/auth/me')).user; }
  catch (e) { return rejectWithValue({ status: e.status, message: e.message }); }
});

const slice = createSlice({
  name: 'auth',
  initialState: { token: readToken(), user: null, loading: false, error: null },
  reducers: {
    logout: (s) => { s.token = null; s.user = null; s.error = null; },
    clearAuthError: (s) => { s.error = null; },
  },
  extraReducers: (b) => {
    b.addCase(authenticate.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(authenticate.fulfilled, (s, a) => { s.loading = false; s.token = a.payload.token; s.user = a.payload.user; })
      .addCase(authenticate.rejected, (s, a) => { s.loading = false; s.error = a.payload || 'Xəta baş verdi'; })
      .addCase(fetchMe.fulfilled, (s, a) => { s.user = a.payload; })
      .addCase(fetchMe.rejected, (s, a) => {
        const st = a.payload && a.payload.status;
        if (st === 401 || st === 403) { s.token = null; s.user = null; } // token etibarsızdır
      });
  },
});

export const { logout, clearAuthError } = slice.actions;
export default slice.reducer;