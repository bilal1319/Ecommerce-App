import { configureStore } from '@reduxjs/toolkit'
import authSlice from '../features/auth/authSlice'
import productSlice from '../features/products/productSlice'
import categorySlice from '../features/categories/categorySlice'
import cartSlice from '../features/cart/CartSlice'


const store = configureStore({
    reducer: {
        auth: authSlice,
        product:productSlice,
        categories:categorySlice,
        cart:cartSlice
    },
})

export default store