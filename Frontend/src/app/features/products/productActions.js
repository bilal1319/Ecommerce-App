import { axiosInstance } from "../../../lib/axios";
import { startLoading, stopLoading } from "../auth/authSlice";
import { setProducts } from "./productSlice";

export const getAllProducts = () => async (dispatch) => {
  
    try {
      const { data } = await axiosInstance.get("/product/getAll");
      console.log("Full response:", data); // ✅ Log received data
      dispatch(setProducts(data));
    } catch (error) {
      console.error(error.response?.data?.message || "Failed to fetch products");
    } finally {
      dispatch(stopLoading())
    }
  };
  
  // ✅ Delete product with dispatch
  export const deleteProduct = (productId) => async (dispatch) => {
    try {
      dispatch(startLoading());
      await axiosInstance.delete(`/product/delete/${productId}`);
      dispatch(getAllProducts()); // ✅ Re-fetch products after deletion
    } catch (error) {
      console.error(error.response?.data?.message || "Failed to delete product");
    } finally {
      dispatch(stopLoading());
    }
  };


export const createProduct = async (formData, productData) => {
    try {
        // Upload image first
        const uploadRes = await axiosInstance.post("/product/upload", formData);
        const imageUrl = uploadRes.data.imageUrl;

        if (!imageUrl) {
            throw new Error("Image upload failed, missing imageUrl");
        }

        // Prepare final product data
        const finalProductData = {
            ...productData,
            images: [{ url: imageUrl, public_id: "default_public_id" }],
        };

        // Create product
        const productRes = await axiosInstance.post("/product/create", finalProductData);

        return productRes.data; // ✅ Return created product data

    } catch (error) {
        throw new Error(error.response?.data?.message || "Product creation failed");
    }
};

