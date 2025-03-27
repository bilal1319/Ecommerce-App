import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllProducts } from "../app/features/products/productSlice";

export const AdminProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.product);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const findProductOrFetch = async () => {
      // First, check if product exists in Redux store
      const foundProduct = products.find(p => p._id === id);
      
      if (foundProduct) {
        // Product found in Redux store
        setProduct(foundProduct);
        setLoading(false);
      } else {
        // Product not in Redux store, fetch from API
        try {
          // First, try to fetch all products if Redux store is empty
          if (products.length === 0) {
             dispatch(getAllProducts());
          }
        } catch (error) {
          console.error("Error fetching product details:", error);
          setLoading(false);
        }
      }
    };

    findProductOrFetch();
  }, [id, products, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-2xl">Product not found</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-2 grid md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="flex flex-col">
          <div className="mb-4 border border-gray-700 rounded-lg p-6 bg-gray-800">
            <img 
              src={product.images[0]?.url || "/placeholder.jpg"} 
              alt={product.name} 
              className="w-full h-72 object-contain"
            />
          </div>
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-bold text-purple-400 mb-4">
            {product.name}
          </h1>

          <p className="text-2xl font-bold text-emerald-500 mb-4">
            Rs. {product.price}/-
          </p>

          {/* Additional Product Info */}
          <div className="mb-6 rounded-lg">
            <ul className="space-y-2 text-gray-300">
              <li>
                <strong>Category:</strong> {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
              </li>
              <li>
                <strong>Stock:</strong> {product.stock > 0 ? `In Stock ( ${product.stock} )` : 'Out of Stock'}
              </li>
            </ul>
          </div>

          {/* Product Details Section */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-purple-400 mb-4">
              Product Description
            </h3>
            <p className="text-gray-300">
              {product.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductDetail;