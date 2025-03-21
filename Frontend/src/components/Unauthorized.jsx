import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();
  
  const goBack = () => {
    const previousPage = sessionStorage.getItem("previousPage");
    sessionStorage.removeItem("previousPage"); // Clear after using
    navigate(-1); // This will take the user back to previous page in history
  };

  useEffect(() => {
    // Listen for popstate event (back button)
    const handlePopState = () => {
      const previousPage = sessionStorage.getItem("previousPage");
      if (previousPage) {
        sessionStorage.removeItem("previousPage");
      }
    };
    
    window.addEventListener("popstate", handlePopState);
    
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-red-600">Unauthorized Access</h1>
      <p className="text-gray-700 mt-2">You do not have permission to view this page.</p>
      <button 
        onClick={goBack} 
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        Go Back
      </button>
    </div>
  );
};

export default Unauthorized;