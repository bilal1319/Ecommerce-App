import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navbar } from "../components/Navbar";
import { getAllProducts } from "../app/features/products/productSlice";
import { setProducts } from "../app/features/products/productSlice";
import { Search } from "lucide-react";
import { stopLoading } from "../app/features/cart/CartSlice";
import { useLocation } from "react-router-dom";
import { XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import  Slider  from "../components/Slider";

export const Products = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, productLoading } = useSelector((state) => state.product);
  const [searchText, setSearchText] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const location = useLocation();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [modalAnimation, setModalAnimation] = useState("");

  // Truncate description to 5-6 words
  const truncateDescription = (description) => {
    const words = description.split(' ');
    return words.length > 6 
      ? words.slice(0, 6).join(' ') + '...'
      : description;
  };

  useEffect(() => {
    // Check if we were redirected with the showOrderConfirmation flag
    if (location.state && location.state.showOrderConfirmation) {
      setShowConfirmation(true);
      // Clean up the location state to prevent showing the popup on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    if (showConfirmation) {
      setModalAnimation("animate-fadeIn");
    } else {
      setModalAnimation("");
    }
  }, [showConfirmation]);

  const closeConfirmation = () => {
    setShowConfirmation(false);
  };

  useEffect(() => {
    dispatch(getAllProducts()).then((res) => {
      if (res.payload) setAllProducts(res.payload);
      dispatch(stopLoading());
    });
  }, [dispatch]);

  const handleSearch = (e) => {
    const text = e.target.value.toLowerCase();
    setSearchText(text);

    const filteredProducts = allProducts.filter((product) =>
      product.name.toLowerCase().includes(text)
    );

    dispatch(setProducts(filteredProducts)); // Update displayed products
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      {/* Fixed Search Bar Container */}
      <div className="fixed top-14 md:top-16 left-0 right-0 z-40 flex justify-center px-4 bg-[--background-color] backdrop-blur-sm py-4">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-md transition-all"
            value={searchText}
            onChange={handleSearch}
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </div>

      {/* Main Content Container */}
      <div className="pt-16 px-6 flex flex-col items-center">
        {showConfirmation && (
          <div className="fixed px-2 inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 transition-all duration-300 ease-in-out backdrop-blur-sm">
            <div
              className={`bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-xl max-w-md w-full border border-purple-500 shadow-lg shadow-purple-500/20 transform transition-all duration-300 ${
                modalAnimation ? "scale-100 opacity-100" : "scale-95 opacity-0"
              }`}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-purple-400">
                  Order Confirmation
                </h3>
                <button
                  onClick={closeConfirmation}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <XCircle size={24} />
                </button>
              </div>
              <p className="mb-6 text-lg text-gray-100">
                Your order has been placed successfully!
              </p>
              <button
                onClick={closeConfirmation}
                className="block w-full text-center bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-purple-600/50"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}

        <div className="mb-8">
          <Slider/>
        </div>

        {products.length === 0 && !productLoading && (
          <div>
            <h1>No Products Found</h1>
            
          </div>
        )}

        {productLoading ? (
          <p className="text-center text-gray-400">Loading products....</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full gap-8 p-8 ">
            {products.map((product) => (
              <div
              key={product._id}
              onClick={() => navigate(`/product/${product._id}`)}
              className="border border-gray-700 p-6 rounded-lg bg-gray-800 shadow-xl hover:shadow-purple-900/20 transition-all flex flex-col h-full cursor-pointer"
            >
              <img
                src={product.images[0]?.url || "/placeholder.jpg"}
                alt={product.name}
                className="w-full h-48 object-contain mb-4 border border-gray-700 p-3 rounded-md bg-gray-700"
              />
              <h2 className="text-lg font-semibold text-white">{product.name}</h2>
              <p className="text-gray-400 mt-2 mb-4 flex-grow">
                {truncateDescription(product.description)}
              </p>
            
              {/* Price and Button in the Same Row */}
              <div className="flex justify-between items-center mt-auto">
                <p className="text-purple-400 font-bold text-xl">
                  Rs. {product.price}/-
                </p>
                <button
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition font-medium"
                >
                  View Detail
                </button>
              </div>
            </div>
            
            ))}
          </div>
        )}
      </div>
    </div>
  );
};