import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, User } from "@/types";
import { authApi } from "@/lib/services";
import { getCookie, removeCookie } from "@/lib/cookies";

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

// Async thunks
export const initAuth = createAsyncThunk("auth/init", async (_, {}) => {
  try {
    const token = getCookie("token");
    const userStr = getCookie("user");

    if (token && userStr) {
      const user = JSON.parse(decodeURIComponent(userStr)) as User;

      // Verify token is still valid
      try {
        await authApi.getMe();
      } catch (e) {
        // if getMe fails, token might be invalid
        throw new Error("Invalid token");
      }
      return { token, user };
    }
    return null;
  } catch (error) {
    removeCookie("token");
    removeCookie("user");
    return null;
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      if (typeof window !== "undefined") {
        removeCookie("token");
        removeCookie("user");
      }
    },
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Init Auth
      .addCase(initAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.token = action.payload.token;
        } else {
          state.isAuthenticated = false;
        }
      })
      .addCase(initAuth.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, setCredentials, setUser } = authSlice.actions;
export default authSlice.reducer;
