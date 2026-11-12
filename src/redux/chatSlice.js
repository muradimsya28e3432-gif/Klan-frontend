import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/client';
import { logout } from './authSlice';

const MAX = 200;
const initialState = { mode: 'global', target: null, global: [], priv: {} };

export const loadGlobal = createAsyncThunk('chat/global', () => api('/chat/global?limit=50'));
export const loadPrivate = createAsyncThunk('chat/private', async (userId) => ({ userId, items: await api(`/chat/private/${userId}?limit=50`) }));

const push = (arr, m) => {
  if (arr.some((x) => x.id === m.id)) return arr; // təkrarın qarşısı
  const next = [...arr, m];
  return next.length > MAX ? next.slice(-MAX) : next;
};

const slice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChatMode: (s, a) => { s.mode = a.payload; },
    openPrivate: (s, a) => { s.target = a.payload; s.mode = 'private'; }, // { id, username }
    addMessage: (s, a) => {
      const { message: m, meId } = a.payload;
      if (m.type === 'global') { s.global = push(s.global, m); return; }
      const partner = String(m.sender) === String(meId) ? m.recipient : m.sender;
      s.priv[partner] = push(s.priv[partner] || [], m);
    },
  },
  extraReducers: (b) => {
    b.addCase(logout, () => initialState)
      .addCase(loadGlobal.fulfilled, (s, a) => { s.global = a.payload; })
      .addCase(loadPrivate.fulfilled, (s, a) => { s.priv[a.payload.userId] = a.payload.items; });
  },
});

export const { setChatMode, openPrivate, addMessage } = slice.actions;
export default slice.reducer;