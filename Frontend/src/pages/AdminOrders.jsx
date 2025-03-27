import { useState, useEffect, useRef } from "react";
import { axiosInstance } from "../lib/axios";
import { format } from "date-fns";
import toast from "react-hot-toast";
import {
  Package,
  ChevronDown,
  ChevronUp,
  Truck,
  CheckCircle,
  Clock,
  User,
  Search,
  Filter,
} from "lucide-react";
import { setOrders } from "../app/features/cart/CartSlice";
import { useDispatch, useSelector } from "react-redux";
import { updateOrderStatusThunk, deleteOrderThunk } from "../app/features/cart/CartSlice";
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

const AdminOrders = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date-desc");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  const detailsRefs = useRef({});
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.cart.userOrders);

  useEffect(() => {
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

    socket.on('orderCreated', (data) => {
      dispatch(setOrders(data?.orders));
      console.log('New order received via Socket:', data?.orders);
    });

    // Handle connection status
    socket.on("connect", () => dispatch(setSocketConnected(true)));
    socket.on("disconnect", () => dispatch(setSocketConnected(false)));

    // Cleanup on unmount
    return () => {
      socket.off("order:deleted");
      socket.off("order:status-updated");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [dispatch]);;
  

  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/order/all-orders");

        dispatch(setOrders(response.data));
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllOrders();
  }, [dispatch]);


  const confirmDeleteOrder = async () => {
    dispatch(deleteOrderThunk(orderToDelete));
    setShowConfirmModal(false);
    setOrderToDelete(null);
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    dispatch(updateOrderStatusThunk({ orderId, newStatus }));
  };

  const toggleOrderDetails = (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return "N/A";
    }
  };



  const handleDeleteClick = (orderId, e) => {
    // Prevent event propagation to parent elements
    if (e) {
      e.stopPropagation();
    }

    setOrderToDelete(orderId);
    setShowConfirmModal(true);
  };



  const filteredOrders = orders
    .filter((order) => {
      // Search filter
      const searchMatch =
        order._id?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
        (order.user?.email &&
          order.user.email?.toLowerCase().includes(searchTerm?.toLowerCase())) ||
        (order.shippingAddress?.fullName &&
          order.shippingAddress?.fullName
            .toLowerCase()
            .includes(searchTerm?.toLowerCase()));

      // Status filter
      const statusMatch =
        statusFilter === "All" || order.status === statusFilter;

      return searchMatch && statusMatch;
    })
    .sort((a, b) => {
      // Sorting
      switch (sortBy) {
        case "date-asc":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "date-desc":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "amount-asc":
          return a.totalPrice - b.totalPrice;
        case "amount-desc":
          return b.totalPrice - a.totalPrice;
        default:
          return 0;
      }
    });

  return (
    <div className="bg-[--background-color] text-white pb-5">
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-purple-400">All Orders</h1>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-6">
          <div className="flex flex-col space-y-4">
            {/* Search Input - Full Width on Mobile */}
            <div className="relative w-full">
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by order ID, email or customer name..."
                className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-md border border-gray-600 focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Filters and Sort - Stacked on Mobile, Flex on Desktop */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Status Filter - Full Width on Mobile */}
              <div className="relative w-full md:w-auto">
                <Filter
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full md:w-auto bg-gray-700 text-white pl-10 pr-8 py-2 rounded-md border border-gray-600 focus:border-purple-500 focus:outline-none appearance-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              {/* Sort Select - Full Width on Mobile */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full md:w-auto bg-gray-700 text-white px-4 py-2 rounded-md border border-gray-600 focus:border-purple-500 focus:outline-none"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="amount-desc">Highest Amount</option>
                <option value="amount-asc">Lowest Amount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16 bg-gray-800 rounded-lg border border-gray-700">
                <Package size={48} className="mx-auto text-gray-500 mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Orders Found</h2>
                <p className="text-gray-400 mb-6">
                  There are no orders matching your filters.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const isExpanded = expandedOrderId === order._id;

                  return (
                    <div
                      key={order._id}
                      className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
                    >
                      {/* Order Header */}
                      <div
                        className="bg-gray-800 p-4 cursor-pointer transition-colors hover:bg-gray-750"
                        onClick={() => toggleOrderDetails(order._id)}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="bg-purple-900/50 p-2 rounded-full">
                              <Package size={20} className="text-purple-400" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">
                                Order #{order._id.slice(-8)}
                              </p>
                              <div className="flex items-center text-sm">
                                <User
                                  size={14}
                                  className="mr-1 text-gray-500"
                                />
                                {order.userId?.email }
                              </div>
                              <p className="text-sm">
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 mt-2 md:mt-0">
                            <OrderStatusBadge status={order.status} />
                            <span className="font-bold">
                              ${order.totalPrice?.toFixed(2)}
                            </span>
                            <span className="transition-transform duration-300 ease-in-out">
                              {isExpanded ? (
                                <ChevronUp
                                  size={20}
                                  className="text-gray-400"
                                />
                              ) : (
                                <ChevronDown
                                  size={20}
                                  className="text-gray-400"
                                />
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
                        ref={(el) => (detailsRefs.current[order._id] = el)}
                      >
                        <div className="p-4">
                          {/* Customer Info */}
                          <div className="mb-4">
                            <h3 className="text-sm font-semibold text-purple-400 mb-2">
                              Customer Information
                            </h3>
                            <div className="bg-gray-700/50 p-3 rounded-md text-sm">
                              <p>
                                Name: {order.shippingAddress?.fullName || "N/A"}
                              </p>
                              <p>Email: {order.userId?.email || "N/A"}</p>
                              <p>
                                Phone: {order.shippingAddress?.phone || "N/A"}
                              </p>
                              <p>User ID: {order.userId?._id || "N/A"}</p>
                            </div>
                          </div>

                          {/* Shipping Info */}
                          <div className="mb-4">
                            <h3 className="text-sm font-semibold text-purple-400 mb-2">
                              Shipping Address
                            </h3>
                            <div className="bg-gray-700/50 p-3 rounded-md text-sm">
                              <p>
                                {order.shippingAddress?.addressLine1 || "N/A"}
                              </p>
                              {order.shippingAddress?.addressLine2 && (
                                <p>{order.shippingAddress.addressLine2}</p>
                              )}
                              <p>{order.shippingAddress?.city || "N/A"}</p>
                              <p>
                                State : {order.shippingAddress?.state || "N/A"}{" "}
                              </p>
                              <p>
                                Zip Code :{" "}
                                {order.shippingAddress?.zipCode || "N/A"}
                              </p>
                            </div>
                          </div>

                          {/* Order Items */}
                          <h3 className="text-sm font-semibold text-purple-400 mb-2">
                            Order Items
                          </h3>
                          <div className="space-y-2 mb-4">
                            {order.items.map((item, index) => (
                              <div
                                key={index}
                                className="bg-gray-700/50 p-3 rounded-md flex justify-between"
                              >
                                <div className="flex items-center">
                                  <div className="w-12 h-12 bg-gray-600 rounded-md flex items-center justify-center mr-3">
                                    {item.productId.image ? (
                                      <img
                                        src={item.productId.image}
                                        alt={item.productId.name}
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
                                      {item.productId.name}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      Qty: {item.quantity}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      Product ID: {item.productId._id}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p>
                                    $
                                    {(
                                      item.productId.price * item.quantity
                                    )?.toFixed(2)}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    ${item.productId.price?.toFixed(2)} each
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Order Summary */}
                          <div className="bg-gray-700/30 rounded-md p-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-400">Subtotal:</span>
                              <span>
                                ${(order.totalPrice - 5.99)?.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-400">Shipping:</span>
                              <span>$5.99</span>
                            </div>
                            <div className="flex justify-between font-bold pt-2 mt-2 border-t border-gray-600">
                              <span>Total:</span>
                              <span>${order.totalPrice?.toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Admin actions */}
                          <div className="mt-4">
                            <h3 className="text-sm font-semibold text-purple-400 mb-2">
                              Update Order Status
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={(e) =>
                                  handleUpdateOrderStatus(order._id, "Pending", e)
                                }
                                className={`px-3 py-1 text-xs rounded-md flex items-center ${
                                  order.status === "Pending"
                                    ? "bg-yellow-500/20 text-yellow-300 border border-yellow-600"
                                    : "bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600"
                                }`}
                              >
                                <Clock size={14} className="mr-1" /> Pending
                              </button>

                              <button
                                onClick={(e) =>
                                  handleUpdateOrderStatus(order._id, "Shipped", e)
                                }
                                className={`px-3 py-1 text-xs rounded-md flex items-center ${
                                  order.status === "Shipped"
                                    ? "bg-blue-500/20 text-blue-300 border border-blue-600"
                                    : "bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600"
                                }`}
                              >
                                <Truck size={14} className="mr-1" /> Shipped
                              </button>

                              <button
                                onClick={(e) =>
                                  handleUpdateOrderStatus(order._id, "Delivered", e)
                                }
                                className={`px-3 py-1 text-xs rounded-md flex items-center ${
                                  order.status === "Delivered"
                                    ? "bg-green-500/20 text-green-300 border border-green-600"
                                    : "bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600"
                                }`}
                              >
                                <CheckCircle size={14} className="mr-1" />{" "}
                                Delivered
                              </button>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex justify-end mt-4">
                            <button
                              onClick={(e) => handleDeleteClick(order._id, e)}
                              className="px-3 py-2 text-xs bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                              Delete Order
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div
            className="fixed inset-0 w-full flex items-center justify-center z-[1000] bg-black bg-opacity-70"
            style={{
              animation: "fadeIn 0.3s ease-in-out",
            }}
          >
            <div
              className="bg-gray-800 p-6 rounded-lg shadow-xl text-center relative w-[350px] border border-purple-500"
              style={{
                animation: "scaleIn 0.3s ease-in-out",
                willChange: "opacity, transform",
              }}
            >
              <h2 className="text-lg font-semibold mb-4 text-white">
                Confirm Deletion
              </h2>
              <p className="text-sm text-gray-300 mb-5">
                Are you sure you want to delete this order?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={confirmDeleteOrder}
                  className="bg-red-600 text-white px-5 py-2 rounded-md hover:bg-red-700 transition"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="bg-gray-600 text-white px-5 py-2 rounded-md hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
