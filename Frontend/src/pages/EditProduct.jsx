import React, { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  updateProduct,
  resetSuccess,
} from "../app/features/products/productSlice";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const EditProduct = () => {
  const { id: productId } = useParams(); // ✅ Get productId from URL params
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  
  const { loading, success, error } = useSelector((state) => state.product);
  const { categories } = useSelector((state) => state.categories);

  // ✅ Fetch product from API
  useEffect(() => {
    const getProduct = async () => {
      try {
        const res = await axiosInstance.get(`/product/getOne/${productId}`);
        const fetchedProduct = res.data;
        setName(fetchedProduct.name);
        setDescription(fetchedProduct.description);
        setPrice(fetchedProduct.price);
        setCategory(fetchedProduct.category);
        setStock(fetchedProduct.stock);
        setPreviewImage(fetchedProduct.images?.[0]?.url || "");
      } catch (error) {
        toast.error('No product found')
        navigate("/admin-dash"); 
      }
    };

    if (productId) getProduct();
    else navigate("/admin-dash"); // Redirect if no product ID is provided
  }, [productId, navigate]);

  useEffect(() => {
    if (success) {
      toast.success("Product Updated Successfully");
      dispatch(resetSuccess());
      navigate("/admin-dash");
    }
    if (error) {
      toast.error("Product update failed");
    }
  }, [success, error, dispatch, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewImage(URL.createObjectURL(file)); // ✅ Show preview before upload
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreviewImage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!productId) {
      alert("Error: Product ID is missing!");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("stock", stock);

    if (image) {
      formData.append("image", image);
    } else if (previewImage) {
      formData.append("existingImage", previewImage);
    }

    dispatch(updateProduct({ productId, formData }))
      .unwrap()
      .then(() => {
        navigate("/allProducts"); // ✅ Navigate after success
      })
      .catch(() => {
        toast.error("Product update failed");
      });
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl  bg-gray-700 text-gray-200 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Edit Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Product Name"
            className="w-full p-2 rounded bg-gray-600 focus:outline-none focus:ring focus:ring-purple-600"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <textarea
            placeholder="Product Description"
            className="w-full p-2 rounded bg-gray-600 focus:outline-none focus:ring focus:ring-purple-600"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>

          <input
            type="number"
            placeholder="Price"
            className="w-full p-2 rounded bg-gray-600 focus:outline-none focus:ring focus:ring-purple-600"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <select
            className="w-full p-2 rounded bg-gray-600 focus:outline-none focus:ring focus:ring-purple-600"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Stock"
            className="w-full p-2 rounded bg-gray-600 focus:outline-none focus:ring focus:ring-purple-600"
            value={stock}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || Number(value) >= 0) setStock(value);
            }}
          />

          {/* Image Upload Section */}
          <div className="flex flex-col gap-3 items-center">
            <h1 className="text-xl font-semibold">Update Image</h1>
            {previewImage ? (
              <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                <img
                  src={previewImage}
                  alt="Selected"
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                  onClick={removeImage}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label
                htmlFor="imageUpload"
                className="w-32 h-32 border border-gray-400 border-dashed flex items-center justify-center rounded-lg cursor-pointer"
              >
                <Plus size={32} className="text-gray-500" />
              </label>
            )}
            <input
              type="file"
              id="imageUpload"
              className="hidden"
              onChange={handleImageChange}
              accept="image/png, image/jpeg, image/jpg, image/webp"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[--primary-color] text-white p-2 rounded hover:bg-[--hover-color]"
            disabled={loading}
          >
            {loading ? "Updating Product..." : "Update Product"}
          </button>
        </form>
      </div>
    </div>
  );
};
