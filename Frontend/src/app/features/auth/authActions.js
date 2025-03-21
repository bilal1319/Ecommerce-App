import { axiosInstance } from "../../../lib/axios";
// import { setAuthUser, startLoading, stopLoading } from "./authSlice";

// export const checkAuth = async (dispatch) => {
//     try {
//         const { user } = await axiosInstance.get("/auth/checkAuth");
//         dispatch(setAuthUser(user?.role))
//     } catch (error) {
//         console.log(error);   
//         dispatch(setAuthUser(null))
//     }
// };

// export const login = async (formData) => {
//     try {
//         const { data } = await axiosInstance.post("/auth/login", formData);
//         return data.user; 
//     } catch (error) {
//         throw new Error(error.response?.data?.message || "Login failed");
//     }
// };

export const signup = async (formData) => {
    try {
        const { data } = await axiosInstance.post("/auth/signup", formData);
        return data.user;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Signup failed");
    }
};


export const logout = async () => {
    try {
        await axiosInstance.post("/auth/logout");
    } catch (error) {
        throw new Error(error.response?.data?.message || "Logout failed");
    }
};