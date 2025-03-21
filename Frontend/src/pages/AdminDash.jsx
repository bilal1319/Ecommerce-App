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

export const AdminDash = () => {
  const dispatch = useDispatch();
  const { products, productLoading } = useSelector((state) => state.product);
  const [searchText, setSearchText] = useState("");
  const [allProducts, setAllProducts] = useState([]); // Store all products

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
      product.name.toLowerCase().includes(text)
    );

    dispatch(setProducts(filteredProducts)); // Update displayed products
  };

  const removeProduct = (id) => {
    dispatch(deleteProduct(id));
  };

  return (
    <div className="relative">
      <div className="w-full flex justify-between items-center"></div>

      <div className="relative w-[170px] md:w-[250px] text-white">
        <input
          type="text"
          placeholder="Search products..."
          className="w-full pl-12 pr-4 border-none py-3 rounded-full bg-gray-900 border  focus:outline-none focus:ring focus:ring-purple-600 shadow-sm transition-all"
          value={searchText}
          onChange={handleSearch}
        />
        <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-100 w-5 h-5" />
      </div>

      {productLoading ? (
        <p className="text-center text-gray-400">Loading products...</p>
      ) : (
        <div className="grid grid-cols-1 pt-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 max-w-[1500px] gap-6 ">
          {products.map((product) => (
            <div
              key={product._id}
              className=" p-4 rounded-lg  bg-gray-700 shadow-md text-white"
            >
              <img
                src={product.images[0]?.url || "/placeholder.jpg"}
                alt={product.name}
                className="w-full h-40 object-contain mb-2 border border-gray-500 p-1 rounded-md"
              />
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <p className="">{product.description}</p>
              <p className="text-green-500 font-bold">${product.price}</p>

              <div className="flex gap-2 mt-2">
                <Link
                  to={`/edit-product/${product._id}`}
                  state={{ product }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1 rounded"
                >
                  Edit
                </Link>
                <button
                  onClick={() => removeProduct(product._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
