import { XCircle, ShoppingCart, Loader } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateCartItem, deleteCartItem, cartItemsHandler } from "../app/features/cart/CartSlice";
import { axiosInstance } from "../lib/axios";


const CartPage = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const [updatingItems, setUpdatingItems] = useState({});
  const [loading, setLoading] = useState(true); // Start with loading state true
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const dispatch = useDispatch();
  
  // Add client-side caching for cart data
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const CACHE_DURATION = 60000; // 1 minute in milliseconds

  useEffect(() => {
    const fetchCart = async () => {
      // Check if cached data is still valid
      const now = Date.now();
      if (now - lastFetchTime < CACHE_DURATION && initialLoadComplete) {
        return; // Use cached data instead of fetching
      }
      
      setLoading(true);
      try {
        const { data } = await axiosInstance.get("/cart/get-cart");
        console.log("cart", data);
        
        dispatch(cartItemsHandler(data?.cartItems || []));
        setLastFetchTime(now);
        setInitialLoadComplete(true);
      } catch (error) {
        console.error("Error fetching cart:", error);
        setInitialLoadComplete(true); 
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [dispatch, lastFetchTime, initialLoadComplete]);

  const handleQuantityChange = (id, quantityChange) => {

    const currentItem = cartItems.find(item => item._id === id);
    if (!currentItem) return;
    
    const originalQuantity = currentItem.quantity;
    const newQuantity = originalQuantity + quantityChange;
    
    if (newQuantity < 1) return;
    
    const updatedCartItems = cartItems.map(item => 
      item._id === id ? {...item, quantity: newQuantity} : item
    );
    
    dispatch(cartItemsHandler(updatedCartItems));
    
    setUpdatingItems((prev) => ({ ...prev, [id]: true }));
    
    dispatch(updateCartItem({ productId: id, quantity: quantityChange }))
      .unwrap()
      .catch((error) => {
        console.error("Error updating cart:", error);

        const rollbackItems = cartItems.map(item => 
          item._id === id ? {...item, quantity: originalQuantity} : item
        );
        dispatch(cartItemsHandler(rollbackItems));
      })
      .finally(() => setUpdatingItems((prev) => ({ ...prev, [id]: false })));
  };
  
  const removeItem = useCallback(
    (id) => {

      const itemToRemove = cartItems.find(item => item._id === id);
      if (!itemToRemove) return;
      

      const updatedCartItems = cartItems.filter(item => item._id !== id);
      
      dispatch(cartItemsHandler(updatedCartItems));
      
      let updateTimeout = setTimeout(() => {
        setUpdatingItems((prev) => ({ ...prev, [id]: true }));
      }, 200);
      
      dispatch(deleteCartItem({ productId: id }))
        .unwrap()
        .catch((error) => {
          console.error("Error removing cart item:", error);

          dispatch(cartItemsHandler([...updatedCartItems, itemToRemove]));
        })
        .finally(() => {
          clearTimeout(updateTimeout);
          setUpdatingItems((prev) => ({ ...prev, [id]: false }));
        });
    },
    [dispatch, cartItems]
  );


  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + (item.product?.price || 0) * (item.quantity || 0), 0),
    [cartItems]
  );
  const discount = subtotal * 0.1;
  const shipping = 5.99;
  const total = subtotal - discount + shipping;

  const toggleMobileSummary = () => {
    setShowMobileSummary(!showMobileSummary);
  };

  // Loading state UI
  if (loading && !initialLoadComplete) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar />
        <div className="container mx-auto p-4 flex flex-col items-center justify-center h-[70vh]">
          <Loader size={40} className="animate-spin text-purple-500 mb-4" />
          <p className="text-gray-400">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="container mx-auto p-4 pb-24 lg:pb-4">
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-400 mb-6">Your cart is empty</p>
            <Link to="/home" className="bg-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-4">
              {loading ? (
                <div className="flex justify-center p-8">
                  <Loader size={30} className="animate-spin text-purple-500" />
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item._id} className="flex items-center justify-between bg-gray-800 p-4 rounded-lg hover:bg-gray-700 border border-gray-700 shadow-md">
                    <div className="flex items-center gap-4">
                      <img 
                        src={item?.product?.images?.[0]?.url} 
                        alt={item?.product?.name || 'Cart Item'} 
                        className="w-16 h-16 rounded object-contain bg-gray-700 p-1" 
                      />
                      <div>
                        <p className="text-lg font-semibold">{item?.product?.name || 'Unnamed Product'}</p>
                        <p className="text-purple-400">Rs {item?.product?.price}/-</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gray-600 rounded-lg overflow-hidden">
                        <button 
                          onClick={() => handleQuantityChange(item._id, -1)} 
                          className="px-3 py-1 bg-gray-700 hover:bg-purple-600 transition flex items-center justify-center" 
                          disabled={updatingItems[item._id]}
                        >
                          {updatingItems[item._id] ? (
                            <Loader size={16} className="animate-spin text-purple-300" />
                          ) : (
                            "-"
                          )}
                        </button>
                        <span className="w-8 text-center">{item?.quantity || 0}</span>
                        <button 
                          onClick={() => handleQuantityChange(item._id, 1)} 
                          className="px-3 py-1 bg-gray-700 hover:bg-purple-600 transition flex items-center justify-center" 
                          disabled={updatingItems[item._id]}
                        >
                          {updatingItems[item._id] ? (
                            <Loader size={16} className="animate-spin text-purple-300" />
                          ) : (
                            "+"
                          )}
                        </button>
                      </div>
                      <button 
                        onClick={() => removeItem(item._id)} 
                        className="text-red-500 hover:text-red-400 transition p-1" 
                        aria-label="Remove item" 
                        disabled={updatingItems[item._id]}
                      >
                        {updatingItems[item._id] ? (
                          <Loader size={20} className="animate-spin text-red-300" />
                        ) : (
                          <XCircle size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Desktop Order Summary - Only show if cart has items */}
            <div className="lg:w-1/3 w-full lg:block hidden">
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 sticky top-20">
                <h2 className="font-bold text-xl mb-4 pb-2 border-b border-gray-700 text-purple-400">Order Summary</h2>
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Subtotal:</span>
                    <span>Rs {subtotal.toFixed(2)}/-</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Discount (10%):</span>
                    <span>-Rs {discount.toFixed(2)}/-</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Shipping:</span>
                    <span>Rs {shipping.toFixed(2)}/-</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-2 mt-2 border-t border-gray-700">
                    <span>Total:</span>
                    <span>Rs {total.toFixed(2)}/-</span>
                  </div>
                </div>
                <Link to="/place-order">
                  <button className="bg-purple-600 w-full py-3 rounded-lg text-white font-semibold hover:bg-purple-700 transition">
                    Confirm Order
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Fixed Footer - Only show if cart has items */}
      {cartItems.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 shadow-lg">
          <div className={`overflow-hidden transition-all duration-300 ${showMobileSummary ? "max-h-60" : "max-h-0"}`}>
            <div className="p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Subtotal:</span>
                <span>Rs {subtotal.toFixed(2)}/-</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Discount (10%):</span>
                <span>-Rs {discount.toFixed(2)}/-</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Shipping:</span>
                <span>Rs {shipping.toFixed(2)}/-</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 mt-1 border-t border-gray-700">
                <span>Total:</span>
                <span>Rs {total.toFixed(2)}/-</span>
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
              <p className="font-bold">Rs {total.toFixed(2)}/-</p>
            </div>
            <Link to="/place-order" className="w-1/2">
              <button className="bg-purple-600 w-full py-3 rounded-lg text-white font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2">
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