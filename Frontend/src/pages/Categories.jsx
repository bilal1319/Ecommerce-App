import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "../app/features/categories/categorySlice";

export const Categories = () => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.categories);
  const [newCategory, setNewCategory] = useState("");
  const [editCategory, setEditCategory] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      dispatch(createCategory({ name: newCategory.toLowerCase().trim() }))
        .unwrap()
        .then(() => {
          toast.success("Category added successfully");
          setNewCategory("");
          setShowPopup(false);
        })
        .catch((err) => toast.error(err || "Failed to add category"));
    } else {
      toast.error("Category name cannot be empty");
    }
  };

  const handleDeleteCategory = (id) => {
    dispatch(deleteCategory(id))
      .unwrap()
      .then(() => toast.success("Category deleted successfully"))
      .catch((err) => toast.error(err || "Failed to delete category"));
  };

  const handleUpdateCategory = (id) => {
    if (updatedName.trim()) {
      dispatch(updateCategory({ id, name: updatedName.toLowerCase().trim() }))
        .unwrap()
        .then(() => {
          toast.success("Category updated successfully");
          setEditCategory(null);
          setUpdatedName("");
        })
        .catch((err) => toast.error(err || "Failed to update category"));
    } else {
      toast.error("Updated category name cannot be empty");
    }
  };

  return (
    <div className=" pb-3">
      <h1 className="text-3xl font-semibold text-start mb-6 text-gray-200">
        <u>Manage Categories</u>
      </h1>
      <div className=" max-w-3xl ">
        <button
          onClick={() => setShowPopup(true)}
          className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-2 rounded-lg block shadow-md"
        >
          Add Category
        </button>

        <ul className="mt-6 space-y-3 ">
          {categories.map((category) => (
            <li
              key={category._id}
              className="flex justify-between gap-2 items-center p-3 bg-[#ffffffa2] shadow-lg rounded-lg"
            >
              {editCategory === category._id ? (
                <input
                  type="text"
                  value={updatedName}
                  onChange={(e) => setUpdatedName(e.target.value)}
                  className="border p-2 rounded-md w-full"
                />
              ) : (
                <span className="text-gray-800 font-medium">
                  {category.name}
                </span>
              )}
              <div className="flex space-x-3">
                {editCategory === category._id ? (
                  <button
                    onClick={() => handleUpdateCategory(category._id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md shadow-md"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditCategory(category._id);
                      setUpdatedName(category.name);
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md shadow-md"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => handleDeleteCategory(category._id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md shadow-md"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>

        {showPopup && (
          <div
            className="fixed px-2 inset-0 flex items-center justify-center z-[1000] transition-opacity duration-300 ease-in-out"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              animation: "fadeIn 0.3s ease-in-out",
            }}
          >
            <div
              className="bg-gray-800 p-6 rounded-lg shadow-xl relative w-full max-w-md border border-purple-500"
              style={{
                animation: "scaleIn 0.3s ease-in-out",
                willChange: "opacity, transform",
              }}
            >
              <h2 className="text-xl font-bold mb-3 text-white">
                Add Category
              </h2>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value.toLowerCase())}
                className="border p-2 w-full rounded-md bg-gray-700 text-white border-gray-600"
                placeholder="Enter category name"
              />
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={() => (setShowPopup(false), setNewCategory(""))}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
