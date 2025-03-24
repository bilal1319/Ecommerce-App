import React, { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { createProduct, resetSuccess } from "../app/features/products/productSlice";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { resetError } from '../app/features/products/productSlice'

export const CreateProduct = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState(null);

  const { loading, success, error } = useSelector((state) => state.product);
  const { categories } = useSelector((state) => state.categories)
  console.log(categories);
  
  const dispatch = useDispatch();
  const navigate = useNavigate()

  useEffect(() => {
    if (success) {
      toast.success("Product created successfully"); 
      dispatch(resetSuccess()); 
    }
    if (error) {
      toast.error("Product not created");
    }
  }, [success, error, dispatch]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  const removeImage = () => setImage(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("image", image);
    const productData = { name, description, price, category, stock };
  
    dispatch(createProduct({ formData, productData }))
      .unwrap()
      .then(() => {
        navigate("/allProducts"); 
      })
      .catch(() => {
        toast.error("Product not created");
        dispatch(resetError())
      });
  };
  

  return (
    <div className="min-h-screen pb-3">
      <div className="h-full max-w-2xl bg-gray-700 text-gray-200 p-6 rounded-lg shadow-md ">
        <h2 className="text-2xl font-semibold mb-4">Create Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Product Name" className="w-full p-2 bg-gray-600 rounded focus:outline-none focus:ring focus:ring-purple-600"
            value={name} onChange={(e) => setName(e.target.value)} />

          <textarea placeholder="Product Description" className="w-full p-2 bg-gray-600 rounded focus:outline-none focus:ring focus:ring-purple-600"
            value={description} onChange={(e) => setDescription(e.target.value)}></textarea>

          <input type="number" placeholder="Price" className="w-full p-2 bg-gray-600 rounded focus:outline-none focus:ring focus:ring-purple-600"
            value={price} onChange={(e) => setPrice(e.target.value)} />

          <select className="w-full p-2 bg-gray-600 rounded focus:outline-none focus:ring focus:ring-purple-600" value={category}
            onChange={(e) => setCategory(e.target.value)}>
            <option className="w-full " value="">Select Category</option>
            {categories.map((cat) => (
              <option className="w-full" key={cat._id} value={cat.name}>{cat.name}</option>
            ))}
          </select>

          <input type="number" placeholder="Stock" className="w-full p-2 bg-gray-600 rounded focus:outline-none focus:ring focus:ring-purple-600"
            value={stock} onChange={(e) => {
              const value = e.target.value;
              if (value === "" || Number(value) >= 0) setStock(value);
            }} />

          <div className="flex flex-col gap-3 items-center">
            <h1 className="text-xl font-semibold">Add Image</h1>
            {image ? (
              <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                <img src={URL.createObjectURL(image)} alt="Selected"
                  className="w-full h-full object-fit" />
                <button type="button" className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                  onClick={removeImage}>
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label htmlFor="imageUpload"
                className="w-32 h-32 border border-gray-400 border-dashed flex items-center justify-center rounded-lg cursor-pointer">
                <Plus size={32} className="text-gray-500" />
              </label>
            )}
            <input type="file" id="imageUpload" className="hidden"
              onChange={handleImageChange} accept="image/png, image/jpeg, image/jpg, image/webp" />
          </div>

          <button type="submit" className="w-full bg-[#9333EA] transition-all duration-300 rounded-md text-white p-2 hover:bg-[#7930bd] "
            disabled={loading}>
            {loading ? "Creating Product..." : "Create Product"}
          </button>
        </form>
      </div>
    </div>
  );
};
