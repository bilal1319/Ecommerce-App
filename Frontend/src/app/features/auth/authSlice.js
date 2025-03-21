import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../lib/axios";

export const signup = createAsyncThunk(
  "auth/signupUser",
  async ({ formData, navigate }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/auth/signup", formData);
      console.log("signup",data);
      if (data?.user?.role === "admin"){
        navigate("/admin-dash")
      } ;
      if (data?.user?.role === "user"){
        navigate("/home")
      };

      return data?.user?.role;
    } catch (error) {
      console.log("signup error", error);
      
      return rejectWithValue(error.response?.data?.message || "Signup failed");
    }
  }
);

export const login = createAsyncThunk(
    "auth/loginUser",
    async ({ formData, navigate }, { rejectWithValue }) => {
      try {
        const { data } = await axiosInstance.post("/auth/login", formData);
        // localStorage.setItem("role", data?.user?.role); // ✅ Store role
        console.log(data?.user?.role)
        if (data?.user?.role === "admin"){
          navigate("/admin-dash")
        } ;
        if (data?.user?.role === "user"){
          navigate("/home")
        };
  
        return data?.user?.role;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Login failed");
      }
    }
  );

  export const checkAuth = createAsyncThunk(
    "auth/checkAuth",
    async ({ navigate }, { rejectWithValue }) => {
      try {
        const { data } = await axiosInstance.get("/auth/checkAuth");
        console.log(data?.role);
        return data?.role;
      } catch (error) {
        navigate("/login");
        return rejectWithValue("Not authenticated");
      }
    }
  );

const initialState = {
  loading: false,
  isCheckingAuth:false,
  authUser: null,
  error: null,
  authError: null,
  previousPage: "/"
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.authUser = null;
      state.error = null;
    },
    setAuthUser: (state, action) => {
      state.authUser = action.payload;
    },
    startLoading: (state) => {
      state.loading = true;
    },
    stopLoading: (state) => {
      state.loading = false;
    },
    setPreviousPage: (state, action) => {
      state.previousPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.authUser = action.payload;
        
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.authUser = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(checkAuth.pending, (state) => {
        state.isCheckingAuth = true;
        state.authError = null
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isCheckingAuth = false;
        state.authUser = action.payload;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isCheckingAuth = false;
        state.authUser = null;
        state.authError = action.payload;
      });
  },
});

export const { logout, setAuthUser, startLoading, stopLoading, setPreviousPage } = authSlice.actions;
export default authSlice.reducer;
