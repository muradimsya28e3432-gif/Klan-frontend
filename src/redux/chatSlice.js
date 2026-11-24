import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/client';
import { logout } from './authSlice';

const MAX = 200; // yaddaşda saxlanan maksimum mesaj sayı
const initialState = { mode: 'global', target: null, global: [], priv: {}, clan: [] };

export const loadGlobal = createAsyncThunk('chat/loadGlobal', async (_, { rejectWithValue }) => {
  try { return await api('/chat/global?limit=50'); }
  catch (e) { return rejectWithValue(e.message); }
});

export const loadPrivate = createAsyncThunk('chat/loadPrivate', async (userId, { rejectWithValue }) => {
  try { return { userId: String(userId), items: await api(`/chat/private/${userId}?limit=50`) }; }
  catch (e) { return rejectWithValue(e.message); }
});

// klan çatı tarixçəsi; backend-də endpoint hələ yoxdursa (404) xəta bildirişi göstərmir, boş siyahı qaytarır
export const loadClan = createAsyncThunk('chat/loadClan', async (_, { rejectWithValue }) => {
  try { return await api('/clan-hub/chat?limit=50'); }
  catch (e) { return e.status === 404 ? [] : rejectWithValue(e.message); }
});

// eyni mesaj təkrar əlavə olunmasın, siyahı MAX-dan böyüməsin
const pushUnique = (list, m) => {
  if (list.some((x) => x.id === m.id)) return list;
  const next = [...list, m];
  return next.length > MAX ? next.slice(-MAX) : next;
};

const slice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChatMode: (s, a) => { s.mode = a.payload; }, // 'global' | 'private' | 'clan'
    openPrivate: (s, a) => { s.target = { id: String(a.payload.id), username: a.payload.username }; s.mode = 'private'; },
    // socket: chat:message -> { message, meId }
    addMessage: (s, a) => {
      const { message: m, meId } = a.payload;
      if (m.type === 'global') { s.global = pushUnique(s.global, m); return; }
      if (m.type === 'clan') { s.clan = pushUnique(s.clan, m); return; }
      const other = String(m.sender) === String(meId) ? String(m.recipient) : String(m.sender);
      s.priv[other] = pushUnique(s.priv[other] || [], m);
    },
  },
  extraReducers: (b) => {
    b.addCase(logout, () => initialState)
      .addCase(loadGlobal.fulfilled, (s, a) => { s.global = a.payload; })
      .addCase(loadPrivate.fulfilled, (s, a) => { s.priv[a.payload.userId] = a.payload.items; })
      .addCase(loadClan.fulfilled, (s, a) => { s.clan = a.payload; });
  },
});

export const { setChatMode, openPrivate, addMessage } = slice.actions;
export default slice.reducer;