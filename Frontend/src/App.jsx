import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Signup } from "./pages/Signup";
import { Login } from "./pages/Login";
import { Products } from "./pages/Products";
import { CreateProduct } from "./pages/CreateProduct";
import { Loader } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { checkAuth } from "./app/features/auth/authSlice";
import { AdminProducts } from "./pages/AdminProducts";
import { useNavigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthWrapper } from "./components/AuthWrapper";
import { EditProduct } from "./pages/EditProduct";
import { Categories } from "./pages/Categories";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";
import Unauthorized from "./components/Unauthorized";
import { fetchCategories } from "./app/features/categories/categorySlice";
import ChartsGrid from "./pages/Charts";
import CartPage from "./pages/Cart";
import Orders from "./pages/Orders";
import { ToastContainer } from "react-toastify";
import PlaceOrder from "./pages/PlaceOrder";
import AdminOrders from "./pages/AdminOrders";
import ProductDetail from "./pages/ProductDetail";
import { ToastProvider } from "./components/Toast";
import AdminProductDetail from "./pages/AdminProductDetail";


const NotFound = () => {


  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6">Page Not Found</p>
      <p className="text-gray-400 mb-8 text-center max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
    </div>
  );
};

function App() {
  return (
    <Router>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </Router>
  );
}

function AppContent() {
  const { loading, isCheckingAuth } = useSelector((state) => state.auth);
  const { loading2 } = useSelector((state) => state.product);
  const { cartLoading } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(checkAuth({ navigate }));
    dispatch(fetchCategories());
    

  }, [dispatch]); 
  
  


  if (loading || isCheckingAuth || loading2 || cartLoading ) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-200">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }



  return (
    <>
    
      <Toaster position="top-center" reverseOrder={false} />
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 10001 }}
      />
      <Routes>
  {/* Public Routes */}
  <Route path="/" element={<AuthWrapper><Signup /></AuthWrapper>} />
  <Route path="/login" element={<AuthWrapper><Login /></AuthWrapper>} />

  {/* User Protected Routes */}
  <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
    <Route path="/home" element={<Products />} />
    <Route path="/cart" element={<CartPage />} />
    <Route path="/place-order" element={<PlaceOrder />} />
    <Route path="/orders" element={<Orders />} />
    <Route path="/product/:id" element={<ProductDetail />} />
  

  </Route>

  {/* Admin Protected Routes */}
  <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
    <Route element={<Layout />}>
      <Route path="/allProducts" element={<AdminProducts />} />
      <Route path="/create-product" element={<CreateProduct />} />
      <Route path="/edit-product/:id" element={<EditProduct />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/admin-dash" element={<ChartsGrid />} />
      <Route path="/admin-orders" element={<AdminOrders />} />
    <Route path="/adminProduct/:id" element={<AdminProductDetail />} />
    </Route>
  </Route>

  {/* Unauthorized Page */}
  <Route path="/unauthorized" element={<Unauthorized />} />

   {/* 404 Fallback Route - Must be last */}
   <Route path="*" element={<NotFound />} />
</Routes>

    </>
  );
}

export default App;
