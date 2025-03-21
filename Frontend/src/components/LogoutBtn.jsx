import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../app/features/auth/authActions";
import { useNavigate } from "react-router-dom";
import { setAuthUser } from "../app/features/auth/authSlice";
import { X, LogOut } from "lucide-react";

export const LogoutBtn = () => {
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      dispatch(setAuthUser(null));
      navigate("/login");
    } catch (err) {
      console.error("Logout Error:", err);
      setError(err.message || "Logout failed. Please try again.");
    }
  };

  return (
    <>
      {/* Logout Button with Icon */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 bg-purple-600 text-white py-2 px-3 text-lg font-semibold rounded-md shadow-md 
                   transition-all duration-200 ease-in-out hover:bg-purple-700 active:scale-95 hover:scale-105"
      >
        <LogOut size={18} />
        Logout
      </button>

      {/* Logout Confirmation Modal */}
      {showModal && (
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
              Are you sure you want to logout?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleLogout}
                className="bg-purple-600 text-white px-5 py-2 rounded-md hover:bg-purple-700 transition"
              >
                Yes, Logout
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-600 text-white px-5 py-2 rounded-md hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {error && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[1000] transition-opacity duration-300 ease-in-out"
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
            <button
              onClick={() => setError(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
            <p className="text-lg font-semibold mb-4 text-purple-400">{error}</p>
            <button
              onClick={() => setError(null)}
              className="bg-gray-600 text-white px-5 py-2 rounded-md hover:bg-gray-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      
    </>
  );
};