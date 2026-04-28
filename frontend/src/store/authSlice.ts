import { type PayloadAction, createSlice } from '@reduxjs/toolkit';

interface IAuthState {
  username: string | null;
  isAuthenticated: boolean;
}

const initialState: IAuthState = {
  username: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ username: string }>) {
      state.username = action.payload.username;
      state.isAuthenticated = true;
    },
    logout(state) {
      state.username = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
