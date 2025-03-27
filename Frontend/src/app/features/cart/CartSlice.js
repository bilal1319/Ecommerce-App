import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../lib/axios";
import { socket } from "../../../lib/socket"; // Import the global socket instance

const initialState = {
  cartItems: [],
  userOrders: [],
  adminOrders: [],
  status: "idle",
  error: null,
  cartLoading: false,
  refetch: false,
  socketConnected: false
};

// Update Cart Item Thunk
export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/cart/update/${productId}`, { quantity });
      return data.cartItems;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update cart item");
    }
  }
);

// Delete Cart Item Thunk
export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async ({ productId }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete(`/cart/remove/${productId}`);
      return data.cartItems;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to remove cart item");
    }
  }
);

// Delete Order Thunk
export const deleteOrderThunk = createAsyncThunk(
  "order/deleteOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/order/delete/${orderId}`);
      socket.emit('order:deleted', { 
        orderId, 
        deletedBy: localStorage.getItem('userRole') || 'user' 
      });
      return orderId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete order");
    }
  }
);

// Update Order Status Thunk
export const updateOrderStatusThunk = createAsyncThunk(
  "order/updateStatus",
  async ({ orderId, newStatus }, { rejectWithValue }) => {
    try {
      await axiosInstance.put(`/order/update-status/${orderId}`, { 
        status: newStatus 
      });
      socket.emit('orderStatusUpdated', { orderId, newStatus });
      return { orderId, newStatus };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update order status");
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    cartItemsHandler: (state, action) => {
      state.cartItems = action.payload;
      state.cartLoading = false;
    },
    startLoading: (state) => { state.cartLoading = true; },
    stopLoading: (state) => { state.cartLoading = false; },
    setOrders: (state, action) => {
      state.userOrders = action.payload;
      state.refetch = true;
    },
    setAdminOrders: (state, action) => {
      state.adminOrders = action.payload;
    },
    deleteOrder: (state, action) => {
      state.userOrders = state.userOrders.filter(order => order._id !== action.payload);
      state.adminOrders = state.adminOrders.filter(order => order._id !== action.payload);
    },
    setRefectch: (state) => { state.refetch = false; },
    setSocketConnected: (state, action) => {
      state.socketConnected = action.payload;
    },
    setOrderStatus: (state, action) => {
      const { orderId, newStatus } = action.payload;
      const order = state.adminOrders.find(order => order._id === orderId) 
                  || state.userOrders.find(order => order._id === orderId);
      if (order) {
        order.status = newStatus;
      }
    },
    clearCart: (state) => {
      state.cartItems = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateCartItem.fulfilled, (state, action) => { state.cartItems = action.payload; })
      .addCase(deleteCartItem.fulfilled, (state, action) => { state.cartItems = action.payload; })
      .addCase(deleteOrderThunk.fulfilled, (state, action) => {
        state.userOrders = state.userOrders.filter(order => order._id !== action.payload);
        state.adminOrders = state.adminOrders.filter(order => order._id !== action.payload);
      })
      .addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
        const { orderId, newStatus } = action.payload;
        const order = state.adminOrders.find(order => order._id === orderId) 
                    || state.userOrders.find(order => order._id === orderId);
        if (order) {
          order.status = newStatus;
        }
      });
  }
});

// Listen for real-time order updates
socket.on("orderPlaced", (order) => {
  console.log("New order received via Socket.IO:", order);
  cartSlice.caseReducers.setOrders(initialState, { payload: [...initialState.userOrders, order] });
});

export const {
  cartItemsHandler,
  startLoading,
  stopLoading,
  deleteOrder,
  setOrders,
  setAdminOrders,
  setRefectch,
  setSocketConnected,
  setOrderStatus,
  clearCart
} = cartSlice.actions;

export default cartSlice.reducer;
