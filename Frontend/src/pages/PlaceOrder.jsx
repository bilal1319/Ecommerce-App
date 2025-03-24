import { XCircle } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import { cartItemsHandler } from "../app/features/cart/CartSlice";
import { useNavigate } from "react-router-dom";
import { startLoading, stopLoading } from "../app/features/cart/CartSlice";

const PlaceOrder = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    addressLine1: "",
    email: "", // Changed from addressLine2 to email
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formValid, setFormValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalAnimation, setModalAnimation] = useState("");

  useEffect(() => {
    // Add email to required fields
    const requiredFields = [
      "fullName",
      "addressLine1",
      "email",
      "city",
      "state",
      "zipCode",
      "phone",
    ];
    const allFieldsFilled = requiredFields.every(
      (field) => addressForm[field].trim() !== ""
    );

    // Basic email validation
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addressForm.email);

    setFormValid(allFieldsFilled && emailValid);
  }, [addressForm]);

  useEffect(() => {
    if (showConfirmation) {
      setModalAnimation("animate-fadeIn");
    } else {
      setModalAnimation("");
    }
  }, [showConfirmation]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (formValid) {
      setLoading(true);
      setError(null);
      let orderResponseData = null; // Define the variable outside both try blocks
  
      try {
        dispatch(startLoading());
        // Format cart items for API
        const items = cartItems.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
        }));
  
        // Calculate total price
        const subtotal = cartItems.reduce(
          (acc, item) => acc + item.product.price * item.quantity,
          0
        );
        const discount = subtotal * 0.1;
        const shipping = 5.99;
        const totalPrice = subtotal - discount + shipping;
  
        // Create order API call with email for shipping address
        const orderResponse = await axiosInstance.post("/order/create", {
          items,
          totalPrice,
          shippingAddress: {
            fullName: addressForm.fullName,
            addressLine1: addressForm.addressLine1,
            city: addressForm.city,
            state: addressForm.state,
            zipCode: addressForm.zipCode,
            phone: addressForm.phone,
          },
        });
  
        orderResponseData = orderResponse.data; // Save the response data to use later
  
        // Clear cart API call
        await axiosInstance.delete("/cart/clear");
        dispatch(cartItemsHandler([])); // Update Redux store
  
        // Clear form
        setAddressForm({
          fullName: "",
          addressLine1: "",
          email: "",
          city: "",
          state: "",
          zipCode: "",
          phone: "",
        });
  
        // Complete the loading state before navigation
        dispatch(stopLoading());
        setLoading(false);
  
        // Navigate after order is complete
        navigate("/products", {
          state: {
            showOrderConfirmation: true,
          },
        });
      } catch (err) {
        console.error("Error placing order:", err);
        setError(
          err.response?.data?.message ||
          "Failed to place order. Please try again."
        );
        dispatch(stopLoading());
        setLoading(false);
        return; // Exit the function early to prevent email attempt
      }
  
      // Only attempt to send email if we have order data
      if (orderResponseData) {
        try {
          const res = await axiosInstance.post("/order/send-confirmation-email", {
            userEmail: addressForm.email,
            order: orderResponseData,
          });
          console.log("Email sending response:", res.data);
        } catch (error) {
          console.log("Error sending order confirmation email:", error);
        }
      }
    }
  };

  const closeConfirmation = () => {
    setShowConfirmation(false);
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const discount = subtotal * 0.1;
  const shipping = 5.99;
  const total = subtotal - discount + shipping;

  const RequiredIndicator = () => <span className="text-red-500 ml-1">*</span>;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="container mx-auto p-4">
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-all duration-300 ease-in-out">
            <div
              className={`bg-gray-800 p-6 rounded-lg max-w-md w-full border border-gray-700 transform transition-all duration-300 ${
                modalAnimation ? "scale-100 opacity-100" : "scale-95 opacity-0"
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-purple-400">
                  Order Confirmation
                </h3>
                <button
                  onClick={closeConfirmation}
                  className="text-gray-400 hover:text-white"
                >
                  <XCircle size={24} />
                </button>
              </div>
              <p className="mb-4">
                Your order has been placed successfully! A confirmation email
                has been sent to your email address.
              </p>
              <Link
                to="/orders"
                className="block w-full text-center bg-purple-600 hover:bg-purple-700 py-2 rounded-lg font-semibold transition"
              >
                View Orders
              </Link>
            </div>
          </div>
        )}

        {cartItems?.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-400 mb-4">Your cart is empty</p>
            <Link
              to={"/products"}
              className="bg-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 pb-24 lg:pb-3">
            <div className="flex-1 space-y-4">
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-md">
                <h2 className="font-bold text-xl mb-4 pb-2 border-b border-gray-700 text-purple-400">
                  Shipping Address
                </h2>

                {error && (
                  <div className="bg-red-900 border border-red-800 text-white p-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="fullName"
                        className="block text-sm text-gray-300"
                      >
                        Full Name
                        <RequiredIndicator />
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={addressForm.fullName}
                        onChange={handleFormChange}
                        required
                        className="w-full bg-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="phone"
                        className="block text-sm text-gray-300"
                      >
                        Phone Number
                        <RequiredIndicator />
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={addressForm.phone}
                        onChange={handleFormChange}
                        required
                        className="w-full bg-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="addressLine1"
                      className="block text-sm text-gray-300"
                    >
                      Address Line 1<RequiredIndicator />
                    </label>
                    <input
                      type="text"
                      id="addressLine1"
                      name="addressLine1"
                      value={addressForm.addressLine1}
                      onChange={handleFormChange}
                      required
                      className="w-full bg-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="block text-sm text-gray-300"
                    >
                      Email Address
                      <RequiredIndicator />
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={addressForm.email}
                      onChange={handleFormChange}
                      required
                      className="w-full bg-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="example@email.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="city"
                        className="block text-sm text-gray-300"
                      >
                        City
                        <RequiredIndicator />
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={addressForm.city}
                        onChange={handleFormChange}
                        required
                        className="w-full bg-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="state"
                        className="block text-sm text-gray-300"
                      >
                        State
                        <RequiredIndicator />
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={addressForm.state}
                        onChange={handleFormChange}
                        required
                        className="w-full bg-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="zipCode"
                        className="block text-sm text-gray-300"
                      >
                        Zip Code
                        <RequiredIndicator />
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={addressForm.zipCode}
                        onChange={handleFormChange}
                        required
                        className="w-full bg-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="pt-4 lg:hidden">
                    <button
                      type="submit"
                      className={`w-full py-3 rounded-lg text-white font-semibold transition ${
                        formValid
                          ? "bg-purple-600 hover:bg-purple-700"
                          : "bg-gray-600 cursor-not-allowed"
                      }`}
                      disabled={!formValid || loading}
                    >
                      {loading ? "Processing..." : "Place Order"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="lg:w-1/3 w-full lg:block hidden">
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 sticky top-20">
                <h2 className="font-bold text-xl mb-4 pb-2 border-b border-gray-700 text-purple-400">
                  Order Summary
                </h2>
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
                <button
                  onClick={handleSubmit}
                  className={`w-full py-3 rounded-lg text-white font-semibold transition ${
                    formValid
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "bg-gray-600 cursor-not-allowed"
                  }`}
                  disabled={!formValid || loading}
                >
                  {loading ? "Processing..." : "Place Order"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceOrder;
