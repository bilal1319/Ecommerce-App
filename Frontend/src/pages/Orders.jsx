import { useState, useEffect, useRef } from "react";
import { Navbar } from "../components/Navbar";
import { axiosInstance } from "../lib/axios";
import { format } from "date-fns";
import {
  Package,
  ChevronDown,
  ChevronUp,
  Truck,
  CheckCircle,
  Clock,
  Trash2
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "../components/Toast";
import { useDispatch, useSelector } from "react-redux";
import { deleteOrderThunk } from "../app/features/cart/CartSlice";
import { setOrders } from "../app/features/cart/CartSlice";
import { socket } from "../lib/socket";
import { deleteOrder, setOrderStatus, setSocketConnected } from "../app/features/cart/CartSlice";

const OrderStatusBadge = ({ status }) => {
  const statusConfig = {
    Pending: {
      color: "bg-yellow-500/20 text-yellow-300 border-yellow-600",
      icon: <Clock size={14} className="mr-1" />,
    },
    Shipped: {
      color: "bg-blue-500/20 text-blue-300 border-blue-600",
      icon: <Truck size={14} className="mr-1" />,
    },
    Delivered: {
      color: "bg-green-500/20 text-green-300 border-green-600",
      icon: <CheckCircle size={14} className="mr-1" />,
    },
  };

  const config = statusConfig[status] || statusConfig.Pending;

  return (
    <span
      className={`px-2 py-1 rounded-md text-xs font-medium flex items-center border ${config.color}`}
    >
      {config.icon} {status}
    </span>
  );
};

const Orders = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [deleteModalOrderId, setDeleteModalOrderId] = useState(null);
  const detailsRefs = useRef({});
  const showToast = useToast();
  const dispatch = useDispatch();

  // Use Redux state for orders instead of local state
  const orders = useSelector((state) => state.cart.userOrders);

  useEffect(() => {
    console.log("Socket connected:", socket.connected);
  
    // Listen for order deletion
    socket.on("orderDeleted", (data) => {
      console.log("Received order deletion event:", data);
      dispatch(deleteOrder(data.deletedOrderId));
    });
  
    // Listen for order status updates
    socket.on("orderStatusUpdated", (data) => {
      console.log("Received order status update event:", data);
      dispatch(setOrderStatus({ orderId: data.orderId, newStatus: data.newStatus }));
    });
  
    // Handle connection status
    socket.on("connect", () => {
      console.log("Socket connected");
      dispatch(setSocketConnected(true));
    });
  
    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      dispatch(setSocketConnected(false));
    });
  
    // Cleanup on unmount
    return () => {
      console.log("Cleaning up socket listeners...");
      socket.off("order:deleted");
      socket.off("order:status-updated");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [dispatch]);
  
  

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/order/user-orders");
        
        // Use Redux action to set orders instead of local state
        dispatch(setOrders(response.data));
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load your orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [dispatch]);



  const toggleOrderDetails = (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };

  const handleDeleteOrder = async () => {
    try {
      await dispatch(deleteOrderThunk(deleteModalOrderId)).unwrap();
      showToast('Order cancelled successfully', 'success');
      setDeleteModalOrderId(null);
    } catch (error) {
      showToast('Failed to cancel order', 'error');
      console.error('Order deletion error:', error);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return "N/A";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-purple-400">My Orders</h1>
          <Link
            to="/home"
            className="bg-purple-600 hover:bg-purple-700 transition px-4 py-2 rounded-lg text-sm font-medium"
          >
            Continue Shopping
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/50 border border-red-800 text-white p-4 rounded-lg">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-gray-800 rounded-lg border border-gray-700">
            <Package size={48} className="mx-auto text-gray-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Orders Yet</h2>
            <p className="text-gray-400 mb-6">
              You haven't placed any orders yet.
            </p>
            <Link
              to="/home"
              className="bg-purple-600 hover:bg-purple-700 transition px-6 py-2 rounded-lg font-medium"
            >
              Start Shopping Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isExpanded = expandedOrderId === order?._id;

              return (
                <div
                  key={order?._id}
                  className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
                >
                  {/* Order Header */}
                  <div
                    className="bg-gray-800 p-4 cursor-pointer transition-colors hover:bg-gray-750"
                    onClick={() => toggleOrderDetails(order?._id)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-purple-900/50 p-2 rounded-full">
                          <Package size={20} className="text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">
                            Order #{order?._id?.slice(-8)}
                          </p>
                          <p className="text-sm">
                            {formatDate(order?.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 mt-2 md:mt-0">
                        <OrderStatusBadge status={order?.status} />
                        <span className="font-bold">
                          ${order?.totalPrice?.toFixed(2)}
                        </span>
                        <span className="transition-transform duration-300 ease-in-out">
                          {isExpanded ? (
                            <ChevronUp size={20} className="text-gray-400" />
                          ) : (
                            <ChevronDown size={20} className="text-gray-400" />
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Details (Expanded) with smooth transition */}
                  <div
                    className={`border-t border-gray-700 overflow-hidden transition-all duration-300 ease-in-out ${
                      isExpanded
                        ? "max-h-[9999px] opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                    ref={(el) => (detailsRefs.current[order?._id] = el)}
                  >
                    <div className="p-4">
                      {/* Shipping Info */}
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold text-purple-400 mb-2">
                          Shipping Address
                        </h3>
                        <div className="bg-gray-700 p-3 rounded-md text-sm">
                          <p className="mb-1">
                            <strong>Name:</strong>{" "}
                            {order?.shippingAddress?.fullName}
                          </p>
                          <p className="mb-1">
                            <strong>Address:</strong>{" "}
                            {order?.shippingAddress?.addressLine1}
                          </p>
                          {order?.shippingAddress?.addressLine2 && (
                            <p className="mb-1">
                              {order?.shippingAddress?.addressLine2}
                            </p>
                          )}
                          <p className="mb-1">
                            <strong>City:</strong>{" "} {order?.shippingAddress?.city}
                            </p>
                            <p>
                            <strong>State:</strong>{" "}{order?.shippingAddress?.state}
                            </p>
                            <p>
                            <strong>Zip:</strong>{" "}
                            {order?.shippingAddress?.zipCode}
                          </p>
                          
                          <p>
                            <strong>Phone:</strong>{" "}
                            {order?.shippingAddress?.phone}
                          </p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <h3 className="text-sm font-semibold text-purple-400 mb-2">
                        Order Items
                      </h3>
                      <div className="space-y-2 mb-4">
                        {order?.items?.map((item, index) => (
                          <div
                            key={index}
                            className="bg-gray-700/50 p-3 rounded-md flex justify-between"
                          >
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-gray-600 rounded-md flex items-center justify-center mr-3">
                                {item?.productId?.image ? (
                                  <img
                                    src={item?.productId?.image}
                                    alt={item?.productId?.name}
                                    className="w-full h-full object-cover rounded-md"
                                  />
                                ) : (
                                  <Package
                                    size={20}
                                    className="text-gray-400"
                                  />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">
                                  {item?.productId?.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Qty: {item?.quantity}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p>
                                $
                                {(item?.productId?.price * item?.quantity)?.toFixed(
                                  2
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Summary */}
                      <div className="bg-gray-700/30 rounded-md p-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Subtotal:</span>
                          <span>${(order?.totalPrice - 5.99)?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Shipping:</span>
                          <span>$5.99</span>
                        </div>
                        <div className="flex justify-between font-bold pt-2 mt-2 border-t border-gray-600">
                          <span>Total:</span>
                          <span>${order?.totalPrice?.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Cancel Order Button for Pending Orders */}
                      {order?.status === "Pending" && (
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => setDeleteModalOrderId(order?._id)}
                            className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition"
                          >
                            <Trash2 size={16} className="mr-2" /> Cancel Order
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Order Confirmation Modal */}
      {deleteModalOrderId && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-[1000] transition-opacity duration-300 ease-in-out"
          style={{ 
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
              Are you sure you want to cancel this order?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDeleteOrder}
                className="bg-purple-600 text-white px-5 py-2 rounded-md hover:bg-purple-700 transition"
              >
                Yes, Cancel Order
              </button>
              <button
                onClick={() => setDeleteModalOrderId(null)}
                className="bg-gray-600 text-white px-5 py-2 rounded-md hover:bg-gray-700 transition"
              >
                Keep Order
              </button>
            </div>
          </div>
        </div>
      )}

      
      
    </div>
  );
};

export default Orders;