import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import axios from "axios";
import Gpay from "../../images/google-pay-logo.png";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
const Checkout = () => {
  const [userKey, setUserKey] = useState("cart_guest");
  const [token, setToken] = useState(null);

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [formData, setFormData] = useState({
    address_line1: "",
    address_line2: "",
    landmark: "",
    country: "",
    state: "",
    district: "",
    pincode: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    address_type: "home",
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("");
 const nav=useNavigate();
  // ⬇ Fetch token
  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    let key = "cart_guest";
    let tokenValue = null;

    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      // Fix: pick whatever token name your backend provides
tokenValue =
  parsed.access ||
  parsed.access_token ||
  parsed.token ||
  parsed.accessToken ||
  parsed.key ||
  null;

// Fix: use saved email directly
let email = parsed.email || parsed.user?.email || null;

// If no email → cart_guest
key = email ? `cart_${email}` : "cart_guest";

console.log("FINAL TOKEN:", tokenValue);
console.log("USER EMAIL:", email);

    }

    setUserKey(key);
    setToken(tokenValue);
    if (tokenValue) fetchCartFromBackend(tokenValue);
  }, []);
  const fetchCartFromBackend = async (tokenValue) => {
    try {
      const response = await axios.get(
        "http://192.168.1.94:8002/api/cartList/",
        { headers: { Authorization: `Bearer ${tokenValue}` } }
      );

      const backendCart = response.data?.cart || [];
      setCart(backendCart);

      // 🧠 OPTIONAL: also save locally for inspection
      const storedUser = JSON.parse(localStorage.getItem("userData"));
      const email = storedUser?.email;
      if (email) {
        localStorage.setItem(`cart_${email}`, JSON.stringify(backendCart));
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Error loading cart items!");
    } finally {
      setLoading(false);
    }
  };

  // ⬇ Fetch addresses
  const getAddressList = async () => {
    try {
      const res = await axios.get("http://192.168.1.94:8002/api/AddressList/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAddresses(res.data.addresses);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) getAddressList();
  }, [token]);

  // ⬇ Handle input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ⬇ Add new address
  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://192.168.1.94:8002/api/addAddress/", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Address added!");
      setShowAddForm(false);
      getAddressList();
    } catch (err) {
      console.log(err);
    }
  };

  // ⬇ Delete address
  const deleteAddress = async (id) => {
    if (!window.confirm("Delete address?")) return;

    try {
      await axios.delete(`http://192.168.1.94:8002/api/deleteAddress/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Address deleted!");
      getAddressList();
    } catch (err) {
      console.log(err);
    }
  };

  // ⬇ Load selected address into edit form
  const loadAddressIntoForm = (addr) => {
    setFormData({
      address_line1: addr.address_line1,
      address_line2: addr.address_line2,
      landmark: addr.landmark,
      country: addr.country,
      state: addr.state,
      district: addr.district,
      pincode: addr.pincode,
      first_name: addr.first_name,
      last_name: addr.last_name,
      email: addr.email,
      phone_number: addr.phone_number,
      address_type: addr.address_type,
    });
  };
   // ✅ Calculations
  const totalItems = cart.reduce(
    (sum, item) => sum + (item.qty || item.quantity || 1),
    0
  );
const totalPrice = cart.reduce((sum, item) => {
  const salesRate = item.product?.sku?.price || item.product?.price;
  const qty = item.qty || item.quantity || 1;
  return sum + salesRate * qty;
}, 0);

const Subtotal = cart.reduce((sum, item) => {
  const salesRate = item.product?.sku?.sales_rate || item.product?.sales_rate;
  const qty = item.qty || item.quantity || 1;
  return sum + salesRate * qty;
}, 0);
// DISCOUNT (sales_rate * discount% * qty)
const discount = cart.reduce((sum, item) => {
  const price = item.product?.sku?.price || item.product?.price;
  const salesRate = item.product?.sku?.sales_rate || item.product?.sales_rate;
  const qty = item.qty || item.quantity || 1;

  return sum + (price - salesRate) * qty;
}, 0);

 // seller price is final

// SUBTOTAL

  // ⬇ Update address
  const updateAddress = async (id) => {
  const form = new FormData();

  // Append ALL fields from formData
  form.append("address_id", id);
  form.append("name", formData.name);
  form.append("phone", formData.phone);
  form.append("house", formData.house);
  form.append("street", formData.street);
  form.append("city", formData.city);
  form.append("pincode", formData.pincode);
  form.append("state", formData.state);

  try {
    await axios.post(
      `http://192.168.1.94:8002/api/UpdateAddress/`,
      form,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    alert("Updated!");
    setIsEditOpen(false);
    setEditId(null);
    getAddressList();
  } catch (err) {
    alert("Update failed: " + JSON.stringify(err.response?.data));
  }
};

  const backendPrice = cart.reduce((sum, item) => {
  const sellingPrice = item.product?.sku?.sales_rate 
                    || item.sales_rate 
                    || item.product?.sku?.price 
                    || item.price;

  const qty = item.qty || item.quantity || 1;

  return sum + sellingPrice * qty;
}, 0);

const handlePlaceOrder = async () => {
  if (!selectedAddress) {
    toast.error("Please select address");
    return;
  }

  if (!paymentMethod) {
    toast.error("Please select payment method");
    return;
  }

  const selected = addresses.find(a => a.id === selectedAddress);

  const orderData = {
    payment_type: paymentMethod,
    coupon_code: null,
    price: backendPrice,
    total_price: backendPrice,
    coupon_amount: 0,
    coupon_applied: false,
    delivery_charge: 0,
    ...selected
  };

  // ⭐ Show instant loader (no lag)
  Swal.fire({
    title: "Placing your order...",
    text: "Please wait",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });

  try {
    const res = await axios.post(
      "http://192.168.1.94:8002/api/create-order/",
      orderData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // ✔ Close loader + show success
    Swal.fire({
      title: "Order Placed!",
      icon: "success",
      timer: 2000,
      showConfirmButton: false
    });

    setTimeout(() => {
      nav("/");
    }, 2000);

  } catch (err) {
    Swal.fire({
      title: "Order Failed",
      text: "Something went wrong",
      icon: "error"
    });
  }
};




  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <>
      <Navbar />

      <div className="w-full sm:w-[92%] mx-auto p-4 lg:p-6 flex flex-col lg:flex-row gap-10 mt-20">
        {/* LEFT SECTION – Addresses */}
        <div className="w-full lg:w-2/3 space-y-6">
          <h2 className="text-xl font-bold mb-4 text-[#112444]">
            Choose Delivery Address
          </h2>

          {/* 1️⃣ No address → show add form only */}
          {addresses.length === 0 && (
            <div className="bg-white shadow-xl rounded-2xl  p-6">
              <h3 className="font-bold mb-3">Add New Address</h3>

              <form onSubmit={handleAddAddress} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    name="first_name"
                    placeholder="First Name"
                    onChange={handleChange}
                    className="border border-gray-300 shadow-xs p-2 rounded w-full"
                  />
                  <input
                    name="last_name"
                    placeholder="Last Name"
                    onChange={handleChange}
                    className="border border-gray-300 shadow-xs p-2 rounded w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    name="email"
                    placeholder="Email"
                    onChange={handleChange}
                    className="border border-gray-300 shadow-xs p-2 rounded w-full"
                  />
                  <input
                    name="phone_number"
                    placeholder="Phone Number"
                    onChange={handleChange}
                    className="border border-gray-300 shadow-xs p-2 rounded w-full"
                  />
                </div>
                <input
                  name="address_line1"
                  placeholder="Address Line 1"
                  onChange={handleChange}
                  className="border border-gray-300 shadow-xs p-2 rounded w-full"
                />
                <input
                  name="address_line2"
                  placeholder="Address Line 2"
                  onChange={handleChange}
                  className="border border-gray-300 shadow-xs p-2 rounded w-full"
                />
                <input
                  name="landmark"
                  placeholder="Landmark"
                  onChange={handleChange}
                  className="border border-gray-300 shadow-xs p-2 rounded w-full"
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    name="district"
                    placeholder="District"
                    onChange={handleChange}
                    className="border border-gray-300 shadow-xs p-2 rounded w-full"
                  />
                  <input
                    name="state"
                    placeholder="State"
                    onChange={handleChange}
                    className="border border-gray-300 shadow-xs p-2 rounded w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    name="country"
                    placeholder="Country"
                    onChange={handleChange}
                    className="border border-gray-300 shadow-xs p-2 rounded w-full"
                  />
                  <input
                    name="pincode"
                    placeholder="Pincode"
                    onChange={handleChange}
                    className="border border-gray-300 shadow-xs p-2 rounded w-full"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-[#112444] text-white py-2 w-full rounded"
                >
                  Save Address
                </button>
              </form>
            </div>
          )}

          {/* 2️⃣ Address cards */}
          {addresses.length > 0 && (
            <>
              <div className="space-y-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className=" flex justify-between items-start gap-2 p-4 rounded-lg shadow-[0_0_15px_0_rgba(0,0,0,0.2)]  bg-white"
                  >
                    <div className="flex  items-start gap-2.5">
                      <input
                        className="mt-2"
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={selectedAddress === addr.id}
                        onChange={() => setSelectedAddress(addr.id)}
                      />
                      <div>
                        {" "}
                        <h4 className="font-semibold ">
                          {addr.first_name} {addr.last_name}
                        </h4>
                        <p>
                          {addr.address_line1}, {addr.address_line2}
                        </p>
                        <p>
                          {addr.district}, {addr.state}, {addr.country}
                        </p>
                        <p>Pincode: {addr.pincode}</p>
                        <p>Phone: {addr.phone_number}</p>
                      </div>
                    </div>

                    <div className="mt-2">
                      <button
                        className="text-white bg-blue-950 px-5 py-1 rounded-sm  mr-3"
                        onClick={() => {
                          loadAddressIntoForm(addr);
                          setEditId(addr.id);
                          setIsEditOpen(true);
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="text-white bg-red-700 px-5 py-1 rounded-sm  mr-3"
                        onClick={() => deleteAddress(addr.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}

                {/* + Add New Address card */}
                {!showAddForm && (
                  <div
                    className="border-2 border-dashed p-6 rounded-lg text-center cursor-pointer hover:bg-gray-50"
                    onClick={() => setShowAddForm(true)}
                  >
                    <div className="text-3xl">+</div>
                    <p c>Add New Address</p>
                  </div>
                )}

                {/* Inline Add Address */}
                {showAddForm && (
                  <div className=" p-7 mt-9.5 bg-white rounded-lg shadow-[0_0_15px_0_rgba(0,0,0,0.1)] ">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-[#112444]  mb-3">
                        Add New Address
                      </h3>

                      <button
                        onClick={() => setShowAddForm(false)}
                        className="text-gray-500  hover:text-black text-2xl"
                      >
                        ×
                      </button>
                    </div>

                    <form onSubmit={handleAddAddress} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          name="first_name"
                          placeholder="First Name"
                          onChange={handleChange}
                          className="border border-gray-300 shadow-xs p-2 rounded w-full"
                        />
                        <input
                          name="last_name"
                          placeholder="Last Name"
                          onChange={handleChange}
                          className="border border-gray-300 shadow-xs p-2 rounded w-full"
                        />
                      </div>

                      <input
                        name="email"
                        placeholder="Email"
                        onChange={handleChange}
                        className="border border-gray-300 shadow-xs p-2 rounded w-full"
                      />
                      <input
                        name="phone_number"
                        placeholder="Phone Number"
                        onChange={handleChange}
                        className="border border-gray-300 shadow-xs p-2 rounded w-full"
                      />
                      <input
                        name="address_line1"
                        placeholder="Address Line 1"
                        onChange={handleChange}
                        className="border border-gray-300 shadow-xs p-2 rounded w-full"
                      />
                      <input
                        name="address_line2"
                        placeholder="Address Line 2"
                        onChange={handleChange}
                        className="border border-gray-300 shadow-xs p-2 rounded w-full"
                      />
                      <input
                        name="landmark"
                        placeholder="Landmark"
                        onChange={handleChange}
                        className="border border-gray-300 shadow-xs p-2 rounded w-full"
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <input
                          name="district"
                          placeholder="District"
                          onChange={handleChange}
                          className="border border-gray-300 shadow-xs p-2 rounded w-full"
                        />
                        <input
                          name="state"
                          placeholder="State"
                          onChange={handleChange}
                          className="border border-gray-300 shadow-xs p-2 rounded w-full"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <input
                          name="country"
                          placeholder="Country"
                          onChange={handleChange}
                          className="border border-gray-300 shadow-xs p-2 rounded w-full"
                        />
                        <input
                          name="pincode"
                          placeholder="Pincode"
                          onChange={handleChange}
                          className="border border-gray-300 shadow-xs p-2 rounded w-full"
                        />
                      </div>

                      <button
                        type="submit"
                        className=" bg-blue-950 text-white py-2 w-full rounded mt-2.5"
                      >
                        Save Address
                      </button>
                    </form>
                  </div>
                )}

                <div>
                  <h5 className="text-lg font-semibold mb-2 mt-5">
                    Add Recipient
                  </h5>
                  <form
                    action=""
                    className="flex gap-6 w-[100%] justify-between"
                  >
                    <div className="flex flex-col w-1/2 space-y-2.5">
                      <label htmlFor="">Name</label>
                      <input
                        className=" border-gray-400  shadow-[0_0_15px_0_rgba(0,0,0,0.1)] p-2 rounded-lg"
                        type="text"
                      />
                    </div>

                    <div className="flex flex-col w-1/2 space-y-2.5">
                      <label htmlFor="">mobile number</label>
                      <input
                        className="  border-gray-400  shadow-[0_0_15px_0_rgba(0,0,0,0.1)] p-2 rounded-lg"
                        type="text"
                      />
                    </div>
                  </form>
                  <h2 className="text-xl mb-3 font-bold text-[#112444] mt-6">
                    Payment Method
                  </h2>
                  <div className="flex flex-col space-y-7">
                    <div className="flex flex-wrap shadow-[0_0_15px_0_rgba(0,0,0,0.2)] px-7 rounded-lg gap-4 items-center">
                      <input type="radio" name="payment_method" id="gpay" onChange={() => setPaymentMethod("gpay")} />
                      <img src={Gpay} alt="" className="w-[50px]" />
                      <h4>Google Pay UPI </h4>
                      <span className="pb-6 md:pb-0">xxxxxx@okhdfcbank</span>
                    </div>
                    <div className="shadow-[0_0_15px_0_rgba(0,0,0,0.2)] px-7 py-5 rounded-lg w-full ">
                      {/* HEADER */}
                      <div className="flex items-center gap-4 mb-3">
                       <input type="radio" name="payment_method" id="upi_main" onChange={() => setPaymentMethod("upi")}/>

                        <img src={Gpay} alt="Gpay" className="w-[50px]" />

                        <h4 className="font-semibold">UPI</h4>
                        <p className="text-sm text-gray-600">
                          Pay By Any UPI App
                        </p>
                      </div>

                      <p className="ml-7 mt-2 mb-2 font-medium text-gray-700">
                        Choose an Option
                      </p>

                      {/* UPI OPTIONS */}
                      <div className="flex flex-col gap-3 ml-7">
                        <label className="flex items-center gap-2">
                          <input type="radio" name="upi_option" id="phonepe" />
                          <span>PhonePe</span>
                        </label>

                        <label className="flex items-center gap-2">
                          <input type="radio" name="upi_option" id="upi_id" />
                          <span>Your UPI ID</span>
                        </label>

                        {/* ENTER UPI ID */}
                        <div className="flex items-center flex-wrap gap-4 w-full">
                          {/* Input + Verify inside */}
                          <div className="relative w-1/2">
                            <input
                              type="text"
                              placeholder="yourname@upi"
                              className="border border-gray-400 rounded-lg p-2 w-full pr-20"
                            />

                            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-950 font-semibold text-sm hover:underline">
                              Verify
                            </button>
                          </div>

                          {/* Pay Button */}
                          <button className="bg-blue-950 font-semibold text-white px-4 py-2 rounded-lg text-sm">
                            Pay 2066
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="shadow-[0_0_15px_0_rgba(0,0,0,0.2)] px-7 py-5 rounded-lg w-full ">
                      {/* HEADER */}
                      <div className="flex items-center gap-4 mb-3">
                        <input type="radio" name="payment_method" id="card" onChange={() => setPaymentMethod("card")}/>

                        <p className="text-sm text-gray-600">
                          Credit card / Debit Card
                        </p>
                      </div>

                      {/* UPI OPTIONS */}
                      <div className="flex flex-col gap-4 ml-7">
                        {/* Card Number */}
                        <div className="flex flex-col">
                          <input
                            type="text"
                            placeholder="Enter Card Number"
                            className="border border-gray-400 rounded-lg p-2 w-[400px] max-w-full"
                          />
                        </div>

                        {/* Valid Thru + CVV */}
                        <div className="flex flex-wrap md:flex gap-3">
                          {/* Valid Thru Section */}
                          <div className="border border-gray-400 w-1/2 md:w-1/4 md:flex rounded-lg p-2 flex flex-wrap items-center justify-between">
                            <span className="text-[12px] text-gray-500">
                              Valid Thru
                            </span>

                            <div className="flex items-center gap-2">
                              <select className="text-sm focus:outline-none">
                                <option>MM</option>
                                <option>01</option>
                                <option>02</option>
                                <option>03</option>
                              </select>

                              <select className="text-sm focus:outline-none">
                                <option>YY</option>
                                <option>25</option>
                                <option>26</option>
                                <option>27</option>
                              </select>
                            </div>
                          </div>

                          {/* CVV */}
                          <input
                            type="text"
                            placeholder="CVV"
                            className="border border-gray-400 rounded-lg p-2 w-1/2 md:w-1/4"
                          />
                        </div>

                        {/* Pay Button */}
                        <button className="bg-blue-950 font-semibold text-white px-4 py-2 rounded-lg text-sm w-1/2 md:w-1/4">
                          Pay ₹2066
                        </button>
                      </div>
                    </div>
                    {/* netbanking */}
                    <div className="shadow-[0_0_15px_0_rgba(0,0,0,0.2)] px-7 py-5 rounded-lg w-full ">
                      {/* HEADER */}
                      <div className="flex items-center gap-4 mb-3">
                       <input type="radio" name="payment_method" id="netbanking" onChange={() => setPaymentMethod("netbanking")}/>

                        <p className="text-sm text-gray-600">Net Banking</p>
                      </div>
                      <p className="ml-7 mt-2 mb-2 font-medium text-gray-700">
                        Popular Banking
                      </p>
                      <div className="flex flex-wrap ml-7 gap-5">
                        <div className="flex items-center gap-4 mb-3">
                          <input type="radio" name="banks" id="upi" />
                          <img
                            className="w-[90px]"
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Axis_Bank_logo.svg/2560px-Axis_Bank_logo.svg.png"
                            alt=""
                          />
                        </div>
                        <div className="flex items-center gap-4 mb-3">
                          <input type="radio" name="banks" id="upi" />
                          <img
                            className="w-[90px] h-[30px]"
                            src="https://tse2.mm.bing.net/th/id/OIP.LGB-BD_YyUKtwQp91epr-AHaB4?rs=1&pid=ImgDetMain&o=7&rm=3"
                            alt=""
                          />
                        </div>
                        <div className="flex items-center gap-4 mb-3">
                          <input type="radio" name="banks" id="upi" />
                             <img
                            className="w-[90px] h-[35px]"
                            src="https://www.pngarts.com/files/1/Yes-Bank-Logo-PNG-Transparent-Image.png"
                            alt=""
                          />
                        </div>
                        <div className="flex items-center gap-4 mb-3">
                          <input type="radio" name="banks" id="upi" />
                            <img
                            className="w-[90px] h-[50px]"
                            src="https://www.babushahi.com/upload/image/hdfc-1577453505102-174964326698.jpeg"
                            alt=""
                          />
                        </div>
                      </div>

                      <p className="ml-7 mt-2 mb-2 font-medium text-gray-700">
                        Other Banks
                      </p>
                      <select
                        name=""
                        id=""
                        className="border p-2 rounded-lg border-gray-400 ml-7 w-[170px]"
                      >
                        <option value="" className="text-gray hidden">
                          select bank
                        </option>
                        <option value="">AXIS BANK</option>
                      </select>
                      <div className="mt-4 ml-7">
                        <button className="bg-blue-950 font-semibold text-white px-13 py-2 rounded-lg text-sm ">
                          Pay 2066
                        </button>
                      </div>
                    </div>
{/* cod */}
                    <div className="flex py-3 shadow-[0_0_15px_0_rgba(0,0,0,0.2)] px-7 rounded-lg gap-4 items-center">
                      <input type="radio" name="payment_method" id="cod" onChange={() => setPaymentMethod("cod")}/>

                      <h4>Cash on Delivery</h4>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* RIGHT SECTION – Order Summary */}
        <div className="bg-white shadow-xl rounded-2xl p-6 h-fit md:mt-10  w-full lg:w-1/3">
          <h2 className="text-xl font-semibold text-[#112444] mb-4">
            Order Summary
          </h2>
          <div className=" mb-4">
            {cart.map((item) => (
              <div
                className="flex justify-between items-center"
                key={item.id || item.productId}
              >
                <div className="flex items-center ">
                  <img
                    src={item.product?.mainimage || item.mainimage}
                    alt=""
                    className="w-[50px] h-[50px] mr-2"
                  />

                  <span className="text-sm">{item.qty || item.quantity}</span>
                  <span className=" text-sm">x</span>
                  <h2 className="text-sm ml-2 md:text-[12px] md:ml-1">
                    {item.product?.title || item.title}
                  </h2>
                </div>
                <h2 className="font-semibold  ">
                  ₹{item.product?.sku?.price || item.price}
                </h2>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-gray-700">
            <div className="flex justify-between">
              <span>Total Items</span>
              <span className="font-medium">{totalItems}</span>
            </div>

            <div className="flex justify-between">
              <span>Total Price</span>
              <span className="font-medium">₹ {totalPrice.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Discount Amount</span>
              <span className="font-medium">₹ {discount}</span>
            </div>

            <hr className="my-2" />

            <div className="flex justify-between text-lg font-semibold text-[#112444]">
              <span>Subtotal</span>
              <span>₹ {Subtotal}</span>
            </div>
          </div>

       <button
  onClick={handlePlaceOrder}
  className="mt-6 w-full bg-[#112444] text-white py-3 rounded font-semibold"
>
  Place Order
</button>

        </div>
      </div>

      {/* 🟦 EDIT POPUP MODAL */}
      {/* ⭐ MODAL POPUP LIKE THE IMAGE */}
      {isEditOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* BACKGROUND OVERLAY */}
          <div
            className="fixed inset-0  items-center justify-center bg-black/60 backdrop-opacity-[100px]  "
            onClick={() => setIsEditOpen(false)}
          ></div>

          {/* MODAL BOX */}
          <div
            className="relative bg-white w-[500px] rounded-lg shadow-2xl animate-[zoomIn_0.25s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="flex justify-between items-center p-4 ">
              <h2 className="text-xl font-semibold">Edit Address</h2>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-gray-500 hover:text-black text-xl"
              >
                ×
              </button>
            </div>

            {/* BODY */}
            <div className="p-4 space-y-3">
              <div className="flex gap-4">
                <input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="border border-gray-300 shadow-xs p-2 rounded w-full"
                  placeholder="First Name"
                />
                <input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="border border-gray-300 shadow-xs p-2 rounded w-full"
                  placeholder="Last Name"
                />
              </div>
              <input
                name="address_line1"
                value={formData.address_line1}
                onChange={handleChange}
                className="border border-gray-300 shadow-xs p-2 rounded w-full"
                placeholder="Address Line 1"
              />
              <input
                name="address_line2"
                value={formData.address_line2}
                onChange={handleChange}
                className="border border-gray-300 shadow-xs p-2 rounded w-full"
                placeholder="Address Line 2"
              />
              <input
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
                className="border border-gray-300 shadow-xs p-2 rounded w-full"
                placeholder="Landmark"
              />
              <div className="flex gap-4">
                <input
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="border border-gray-300 shadow-xs p-2 rounded w-full"
                  placeholder="District"
                />
                <input
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="border border-gray-300 shadow-xs p-2 rounded w-full"
                  placeholder="State"
                />
              </div>
              <div className="flex gap-4">
                <input
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="border border-gray-300 shadow-xs p-2 rounded w-full"
                  placeholder="Country"
                />
                <input
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="border border-gray-300 shadow-xs p-2 rounded w-full"
                  placeholder="Pincode"
                />
              </div>
            </div>

            {/* FOOTER BUTTONS */}
            <div className="flex justify-end gap-3 p-4  bg-gray-50">
              <button
                onClick={() => setIsEditOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateAddress(editId);
                  setIsEditOpen(false);
                }}
                className="px-4 py-2 bg-[#112444] text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
            
        </div>
      )}
       <ToastContainer
                      position="top-right"
                      autoClose={2000}
                      theme="colored"
                      style={{ marginTop: "70px" }}
                    />
    </>
  );
};

export default Checkout;
