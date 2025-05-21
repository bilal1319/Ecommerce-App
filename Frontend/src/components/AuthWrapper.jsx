import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import { Loader } from "lucide-react";

export const AuthWrapper = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const publicPaths = ["/", "/forgot-password"];

      try {
        const res = await axiosInstance.get("/auth/checkAuth");
        const role = res.data.role;

        if (role === "admin") {
          navigate("/admin-dash", { replace: true });
        } else if (role === "user") {
          navigate("/home", { replace: true });
        } else {
          if (publicPaths.includes(location.pathname)) {
            setLoading(false);
            return;
          }
          navigate("/login", { replace: true });
        }
      } catch (error) {
        if (publicPaths.includes(location.pathname)) {
          setLoading(false);
          return;
        }
        navigate("/login", { replace: true });
      }

      setTimeout(() => setLoading(false), 100);
    };

    checkAuth();
  }, [navigate, location.pathname]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-200">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return children;
};
