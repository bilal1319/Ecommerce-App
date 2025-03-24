import { axiosInstance } from "../../../lib/axios";


export const logout = async () => {
    try {
        await axiosInstance.post("/auth/logout");
    } catch (error) {
        throw new Error(error.response?.data?.message || "Logout failed");
    }
};