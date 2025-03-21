import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../lib/axios";


export const getAllProducts = createAsyncThunk(
  "product/getAll",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Starting getAllProducts request");
      const { data } = await axiosInstance.get("/product/getAll");
      console.log("getAllProducts succeeded with data:", data);
      return data;
    } catch (error) {
      console.error("getAllProducts failed with error:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch products");
    }
  }
);


export const deleteProduct = createAsyncThunk(
  "product/delete",
  async (productId, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/product/delete/${productId}`);
      dispatch(getAllProducts()); 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete product");
    }
  }
);


export const createProduct = createAsyncThunk(
  "product/create",
  async ({ formData, productData, navigate }, { rejectWithValue }) => {
    try {
      const uploadRes = await axiosInstance.post("/product/upload", formData);
      const imageUrl = uploadRes.data.imageUrl;

      if (!imageUrl) {
        throw new Error("Image upload failed, missing imageUrl");
      }

      const finalProductData = {
        ...productData,
        images: [{ url: imageUrl, public_id: "default_public_id" }],
      };

      const productRes = await axiosInstance.post("/product/create", finalProductData);
      

      return productRes.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Product creation failed");
    }
  }
);

export const updateProduct = createAsyncThunk(
  "product/update",
  async ({  productId, formData }, { rejectWithValue }) => {
    try {
      let updatedProductData = {};

      if (formData.get("image")) {
        const uploadRes = await axiosInstance.post("/product/upload", formData);
        const imageUrl = uploadRes.data.imageUrl;
        if (!imageUrl) {
          throw new Error("Image upload failed, missing imageUrl");
        }
        updatedProductData.images = [{ url: imageUrl, public_id: "default_public_id" }];
      } else if (formData.get("existingImage")) {
        updatedProductData.images = [{ url: formData.get("existingImage"), public_id: "default_public_id" }];
      }

      updatedProductData.name = formData.get("name");
      updatedProductData.description = formData.get("description");
      updatedProductData.price = formData.get("price");
      updatedProductData.category = formData.get("category");
      updatedProductData.stock = formData.get("stock");

      const updateRes = await axiosInstance.put(`/product/update/${productId}`, updatedProductData);
      
      return updateRes.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Product update failed");
    }
  }
);


// Initial state
const initialState = {
  products: [],
  error: "",
  loading2: false,
  productLoading:false,
  success: null,
  
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    resetSuccess: (state) => {
      state.success = null;
    },
    setProducts: (state, action) => {
      state.products = action.payload;
    },
    resetError: (state) => { 
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllProducts.pending, (state, action) => {
      state.productLoading = true;
      })
      .addCase(getAllProducts.fulfilled, (state, action) => {
        state.products = action.payload;
        state.productLoading = false;
      })
      .addCase(getAllProducts.rejected, (state, action) => {
        state.error = action.payload;
        state.productLoading = false;
      })
      .addCase(createProduct.pending, (state) => {
        state.loading2 = true;
        state.success = null;
      })
      .addCase(createProduct.fulfilled, (state) => {
        state.loading2 = false;
        state.success = true;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading2 = false;
        state.error = action.payload;
        state.success = null;
      })
      .addCase(updateProduct.pending, (state) => {
        state.loading2 = true;
        state.success = null;
      })
      .addCase(updateProduct.fulfilled, (state) => {
        state.loading2 = false;
        state.success = true;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading2 = false;
        state.error = action.payload;
        state.success = null;
      });
  },
});

export const { resetSuccess, setProducts, resetError } = productSlice.actions;
export default productSlice.reducer;
