import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/client';
import { logout } from './authSlice';

const MAX = 200; // yaddaşda saxlanan maksimum mesaj sayı
const initialState = { mode: 'global', target: null, global: [], priv: {} };

export const loadGlobal = createAsyncThunk('chat/loadGlobal', async (_, { rejectWithValue }) => {
  try { return await api('/chat/global?limit=50'); }
  catch (e) { return rejectWithValue(e.message); }
});

export const loadPrivate = createAsyncThunk('chat/loadPrivate', async (userId, { rejectWithValue }) => {
  try { return { userId: String(userId), items: await api(`/chat/private/${userId}?limit=50`) }; }
  catch (e) { return rejectWithValue(e.message); }
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
    setChatMode: (s, a) => { s.mode = a.payload; },
    // axtarışdan və ya çatdan istifadəçi seçilir: { id, username }
    openPrivate: (s, a) => { s.target = { id: String(a.payload.id), username: a.payload.username }; s.mode = 'private'; },
    // socket: chat:message -> { message, meId }
    addMessage: (s, a) => {
      const { message: m, meId } = a.payload;
      if (m.type === 'global') { s.global = pushUnique(s.global, m); return; }
      const other = String(m.sender) === String(meId) ? String(m.recipient) : String(m.sender);
      s.priv[other] = pushUnique(s.priv[other] || [], m);
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