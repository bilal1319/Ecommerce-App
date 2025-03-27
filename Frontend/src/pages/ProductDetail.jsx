import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Navbar } from "../components/Navbar";
import { axiosInstance } from "../lib/axios";
import { cartItemsHandler } from "../app/features/cart/CartSlice";
import { getAllProducts } from "../app/features/products/productSlice";
import { toast } from "react-toastify";
import { ShoppingCart } from "lucide-react";
import { useToast } from "../components/Toast";

export const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.product);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const showToast = useToast();

  useEffect(() => {
    const findProductOrFetch = async () => {
      // First, check if product exists in Redux store
      const foundProduct = products.find(p => p._id === id);
      
      if (foundProduct) {
        // Product found in Redux store
        setProduct(foundProduct);
        setSelectedImage(foundProduct.images[0]?.url || "/placeholder.jpg");
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
          toast.error("Failed to load product details", {
            position: "top-right",
            autoClose: 2000,
          });
        }
      }
    };

    findProductOrFetch();
  }, [id, products, dispatch]);

  const addCartHandler = async () => {
    try {
      const productData = {
        productId: id,
        quantity: 1,
      };
      const res = await axiosInstance.post("/cart/add-product", productData);
      dispatch(cartItemsHandler(res.data.cartItems));

      showToast('success', 'Product Added to cart!');
    } catch (error) {
        showToast('error', 'Failed to add product to cart');
    }
  };

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
      <Navbar />
      <div className="container mx-auto px-4 py-2 pb-5">
        <div className="grid md:grid-cols-2 gap-8">
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
          <div className="relative">
            <h1 className="text-3xl font-bold text-purple-400 mb-4">
              {product.name}
            </h1>

            <p className="text-2xl font-bold text-emerald-500 mb-4">
              Rs. {product.price}/-
            </p>

            {/* Additional Product Info */}
            <div className="mb-6 rounded-lg">
              <ul className="space-y-6 mt-8 text-gray-300">
                <li>
                  <strong>Category:</strong> {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                </li>
                <li>
                  <strong>Stock:</strong> {product.stock > 0 ? `In Stock ( ${product.stock} )` : 'Out of Stock'}
                </li>
              </ul>
            </div>

            {/* Add to Cart Button */}
            <button 
              onClick={addCartHandler}
              className="w-full md:absolute md:bottom-0 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition flex items-center justify-center space-x-2 mb-6"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>

        {/* Product Description Section */}
        <div className="mt-2 bg-gray-800 px-6 py-6 rounded-lg">
          <h3 className="text-xl font-semibold text-purple-400 mb-4">
            Product Description
          </h3>
          <p className="text-gray-300">
            {product.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;