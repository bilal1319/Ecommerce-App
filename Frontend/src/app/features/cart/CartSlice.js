import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../lib/axios";

const initialState = {
  cartItems: [],
  status: "idle",
  error: null,
  cartLoading: false
};

export const updateCartItem = createAsyncThunk("cart/updateCartItem", async ({ productId, quantity }, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.put(`/cart/update/${productId}`, {quantity});
    
    return data.cartItems;
  } catch (error) {
    console.log("Update", error);
    
    return rejectWithValue(error.response?.data?.message || "Failed to update cart item");
  }
});

export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async ({ productId }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete(`/cart/remove/${productId}`); // ✅ Fixed
      console.log(data);
      
      return data.cartItems;
    } catch (error) {
      console.log(error);
      
      return rejectWithValue(error.response?.data?.message || "Failed to remove cart item");
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    cartItemsHandler: (state, action) => {
      state.cartItems = action.payload
      state.cartLoading = false
    },
    startLoading:(state) => {
      state.cartLoading = true
    },
    stopLoading:(state) => {
      state.cartLoading = false
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.cartItems = action.payload;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.cartItems = action.payload;
      });
  },
  
});

export const { cartItemsHandler,startLoading, stopLoading } = cartSlice.actions;
export default cartSlice.reducer;