import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteProduct,
  getAllProducts,
} from "../app/features/products/productSlice";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { setProducts } from "../app/features/products/productSlice";
import { stopLoading } from "../app/features/cart/CartSlice";
import { useNavigate } from "react-router-dom";

export const AdminProducts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, productLoading } = useSelector((state) => state.product);
  const [searchText, setSearchText] = useState("");
  const [allProducts, setAllProducts] = useState([]); // Store all products
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    dispatch(getAllProducts()).then((res) => {
      if (res.payload) setAllProducts(res.payload); // Save original products
      dispatch(stopLoading());
    });
  }, [dispatch]);

  const handleSearch = (e) => {
    const text = e.target.value.toLowerCase();
    setSearchText(text);

    const filteredProducts = allProducts.filter((product) =>
      product?.name?.toLowerCase().includes(text)
    );

    dispatch(setProducts(filteredProducts)); // Update displayed products
  };

  const confirmDelete = (productId) => {
    setProductToDelete(productId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmed = () => {
    dispatch(deleteProduct(productToDelete));
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

    // Truncate description to 5-6 words
    const truncateDescription = (description) => {
      const words = description.split(' ');
      return words.length > 9 
        ? words.slice(0, 9).join(' ') + '...'
        : description;
    };

  return (
    <div className="relative pb-5">
      

      <div className="fixed top-16  lg:top-0 py-4  w-full ">
      <div className="relative w-[250px] text-white">
        <input
          type="text"
          placeholder="Search products..."
          className="w-full z-[10] pl-12 pr-4 border-none py-3 rounded-full bg-gray-900 border focus:outline-none focus:ring focus:ring-purple-600 shadow-sm transition-all"
          value={searchText}
          onChange={handleSearch}
        />
        <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-100 w-5 h-5" />
      </div>
      </div>

      <main className="mt-32 ">
      {productLoading ? (
        <p className="text-center text-gray-400">Loading products...</p>
      ) : (
        <div className="grid   grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 max-w-[1500px] gap-6 ">
          {products?.map((product) => (
            <div
              key={product?._id}
              onClick={() => navigate(`/adminProduct/${product._id}`)}
              className="p-4 cursor-pointer rounded-lg bg-gray-800 shadow-md text-white"
            >
              <img
                src={product?.images?.[0]?.url || "/placeholder.jpg"}
                alt={product?.name}
                className="w-full h-40 object-contain mb-2 border border-gray-500 p-1 rounded-md"
              />
              <h2 className="text-lg font-semibold">{product?.name}</h2>
              <p className="text-gray-400 mt-2 mb-4 flex-grow">
                  {truncateDescription(product.description)}
                </p>
              <p className="text-green-500 font-bold">Rs. {product?.price}/-</p>

              <div className="flex gap-2 mt-2">
                <Link
                  to={`/edit-product/${product?._id}`}
                  state={{ product }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1 rounded"
                >
                  Edit
                </Link>
                <button
                  onClick={() => confirmDelete(product?._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </main>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black z-[1000] transition-opacity duration-300 ease-in-out"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            animation: 'fadeIn 0.3s ease-in-out'
          }}
        >
          <div
            className="bg-gray-800 p-6 rounded-lg shadow-xl text-center relative w-[350px] border border-purple-500"
            style={{ 
              animation: 'scaleIn 0.3s ease-in-out',
              willChange: 'opacity, transform'
            }}
          >
            <p className="text-lg font-semibold mb-5 text-white">
              Are you sure you want to delete this product?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDeleteConfirmed}
                className="bg-red-600 text-white px-5 py-2 rounded-md hover:bg-red-700 transition"
              >
                Yes, Delete
              </button>
              <button
                onClick={cancelDelete}
                className="bg-gray-600 text-white px-5 py-2 rounded-md hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};