import { XCircle, ShoppingCart } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateCartItem, deleteCartItem, cartItemsHandler } from "../app/features/cart/CartSlice";
import { axiosInstance } from "../lib/axios";

const CartPage = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const [updatingItems, setUpdatingItems] = useState({});
  const [loading, setLoading] = useState(false);
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get("/cart/get-cart");
        dispatch(cartItemsHandler(data.cartItems));
      } catch (error) {
        console.error("Error fetching cart:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [dispatch]);

  const handleQuantityChange = useCallback(
    async (id, quantityChange) => {
      setUpdatingItems((prev) => ({ ...prev, [id]: true }));
      try {
        await dispatch(updateCartItem({ productId: id, quantity: quantityChange })).unwrap();
      } catch (error) {
        console.error("Error updating cart:", error);
      } finally {
        setUpdatingItems((prev) => ({ ...prev, [id]: false }));
      }
    },
    [dispatch]
  );

  const removeItem = useCallback(
    async (id) => {
      setUpdatingItems((prev) => ({ ...prev, [id]: true }));
      try {
        await dispatch(deleteCartItem({ productId: id })).unwrap();
      } catch (error) {
        console.error("Error removing cart item:", error);
      } finally {
        setUpdatingItems((prev) => ({ ...prev, [id]: false }));
      }
    },
    [dispatch]
  );

  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    [cartItems]
  );
  const discount = subtotal * 0.1;
  const shipping = 5.99;
  const total = subtotal - discount + shipping;

  const toggleMobileSummary = () => {
    setShowMobileSummary(!showMobileSummary);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="container mx-auto p-4 pb-24 lg:pb-4">
        {!loading && cartItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-400 mb-6">Your cart is empty</p>
            <Link to="/products" className="bg-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-4">
              {cartItems.map((item) => (
                <div key={item._id} className="flex items-center justify-between bg-gray-800 p-4 rounded-lg hover:bg-gray-700 border border-gray-700 shadow-md">
                  <div className="flex items-center gap-4">
                    <img src={item?.product?.images[0]?.url} alt={item.name} className="w-16 h-16 rounded object-contain bg-gray-700 p-1" />
                    <div>
                      <p className="text-lg font-semibold">{item.product.name}</p>
                      <p className="text-purple-400">${item.product.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-gray-600 rounded-lg overflow-hidden">
                      <button onClick={() => handleQuantityChange(item._id, -1)} className="px-3 py-1 bg-gray-700 hover:bg-purple-600 transition" disabled={updatingItems[item._id]}>
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button onClick={() => handleQuantityChange(item._id, 1)} className="px-3 py-1 bg-gray-700 hover:bg-purple-600 transition" disabled={updatingItems[item._id]}>
                        +
                      </button>
                    </div>
                    <button onClick={() => removeItem(item._id)} className="text-red-500 hover:text-red-400 transition p-1" aria-label="Remove item" disabled={updatingItems[item._id]}>
                      <XCircle size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Desktop Order Summary */}
            <div className="lg:w-1/3 w-full lg:block hidden">
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 sticky top-20">
                <h2 className="font-bold text-xl mb-4 pb-2 border-b border-gray-700 text-purple-400">Order Summary</h2>
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Discount (10%):</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Shipping:</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-2 mt-2 border-t border-gray-700">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                <Link to="/place-order">
                  <button className="bg-purple-600 w-full py-3 rounded-lg text-white font-semibold hover:bg-purple-700 transition" disabled={loading}>
                    Confirm Order
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Fixed Footer */}
      {cartItems.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 shadow-lg">
          <div className={`overflow-hidden transition-all duration-300 ${showMobileSummary ? "max-h-60" : "max-h-0"}`}>
            <div className="p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Discount (10%):</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Shipping:</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 mt-1 border-t border-gray-700">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4">
            <div className="flex flex-col">
              <button 
                onClick={toggleMobileSummary} 
                className="flex items-center text-sm text-purple-400 mb-1"
              >
                {showMobileSummary ? "Hide details" : "Show details"}
              </button>
              <p className="font-bold">${total.toFixed(2)}</p>
            </div>
            <Link to="/place-order" className="w-1/2">
              <button className="bg-purple-600 w-full py-3 rounded-lg text-white font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2" disabled={loading}>
                <ShoppingCart size={18} />
                <span>Checkout</span>
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;