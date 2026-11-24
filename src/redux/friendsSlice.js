import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/client';
import { logout } from './authSlice';

// list: dostlarım, incoming: gələn istəklər, sent: bu sessiyada istək göndərdiyim ID-lər
const initialState = { list: [], incoming: [], sent: [] };

export const fetchFriends = createAsyncThunk('friends/list', () => api('/friends'));
export const fetchFriendRequests = createAsyncThunk('friends/incoming', () => api('/friends/requests'));

const act = (name, call, refresh = true) => createAsyncThunk(`friends/${name}`, async (arg, { dispatch, rejectWithValue }) => {
  try {
    const r = await call(arg);
    if (refresh) { dispatch(fetchFriends()); dispatch(fetchFriendRequests()); }
    return r;
  } catch (e) { return rejectWithValue(e.message); }
});

export const sendFriendRequest = act('send', (userId) => api(`/friends/${userId}/request`, { method: 'POST' }), false); // userId
export const acceptFriend = act('accept', (id) => api(`/friends/requests/${id}/accept`, { method: 'POST' })); // istəyin ID-si
export const rejectFriend = act('reject', (id) => api(`/friends/requests/${id}/reject`, { method: 'POST' })); // istəyin ID-si
export const removeFriend = act('remove', (userId) => api(`/friends/${userId}`, { method: 'DELETE' })); // userId

const slice = createSlice({
  name: 'friends',
  initialState,
  reducers: {
    // socket: friend:request
    addFriendIncoming: (s, a) => { if (!s.incoming.some((x) => x.id === a.payload.id)) s.incoming.unshift(a.payload); },
  },
  extraReducers: (b) => {
    b.addCase(logout, () => initialState)
      .addCase(fetchFriends.fulfilled, (s, a) => { s.list = a.payload; })
      .addCase(fetchFriendRequests.fulfilled, (s, a) => { s.incoming = a.payload; })
      .addCase(sendFriendRequest.fulfilled, (s, a) => { if (!s.sent.includes(a.meta.arg)) s.sent.push(a.meta.arg); })
      .addCase(removeFriend.fulfilled, (s, a) => { s.sent = s.sent.filter((id) => id !== a.meta.arg); });
  },
});

export const { addFriendIncoming } = slice.actions;
export default slice.reducer;