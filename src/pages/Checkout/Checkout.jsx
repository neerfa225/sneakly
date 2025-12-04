import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import axios from "axios";
import Gpay from "../../images/google-pay-logo.png";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { SERVER_URL } from "../../Services/serverURL";
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
  const [errors, setErrors] = useState({});
  const [recipient, setRecipient] = useState({
    name: "",
    mobile: "",
  });

  const [recipientErrors, setRecipientErrors] = useState({});

  const nav = useNavigate();
  
  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    let key = "cart_guest";
    let tokenValue = null;

    if (storedUser) {
      const parsed = JSON.parse(storedUser);

      tokenValue =
        parsed.access ||
        parsed.access_token ||
        parsed.token ||
        parsed.accessToken ||
        parsed.key ||
        null;

      let email = parsed.email || parsed.user?.email || null;

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
        `${SERVER_URL}/api/cartList/`,
        { headers: { Authorization: `Bearer ${tokenValue}` } }
      );

      const backendCart = response.data?.cart || [];
      setCart(backendCart);

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

  const getAddressList = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/AddressList/`, {
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      await axios.post(`${SERVER_URL}/api/addAddress/`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Address added!");

      setFormData({
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

      setErrors({});
      setShowAddForm(false);
      getAddressList();
    } catch (err) {
      toast.error("Failed to add address");
    }
  };

  const deleteAddress = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this address?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `${SERVER_URL}/api/deleteAddress/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          toast.success("Address deleted");
          getAddressList();
        } catch (err) {
          alert("Error", "Failed to delete the address.", "error");
        }
      }
    });
  };

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

  const discount = cart.reduce((sum, item) => {
    const price = item.product?.sku?.price || item.product?.price;
    const salesRate = item.product?.sku?.sales_rate || item.product?.sales_rate;
    const qty = item.qty || item.quantity || 1;

    return sum + (price - salesRate) * qty;
  }, 0);

  const updateAddress = async (id) => {
    const form = new FormData();

    form.append("address_id", id);
    form.append("first_name", formData.first_name);
    form.append("last_name", formData.last_name);
    form.append("email", formData.email);
    form.append("phone_number", formData.phone_number);
    form.append("address_line1", formData.address_line1);
    form.append("address_line2", formData.address_line2);
    form.append("landmark", formData.landmark);
    form.append("district", formData.district);
    form.append("state", formData.state);
    form.append("country", formData.country);
    form.append("pincode", formData.pincode);
    form.append("address_type", formData.address_type);

    try {
      await axios.post(`${SERVER_URL}/api/UpdateAddress/`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Address Updated");
      setIsEditOpen(false);
      setEditId(null);
      getAddressList();
    } catch (err) {
      alert("Update failed: " + JSON.stringify(err.response?.data));
    }
  };

  const backendPrice = cart.reduce((sum, item) => {
    const sellingPrice =
      item.product?.sku?.sales_rate ||
      item.sales_rate ||
      item.product?.sku?.price ||
      item.price;

    const qty = item.qty || item.quantity || 1;

    return sum + sellingPrice * qty;
  }, 0);

  const handlePlaceOrder = async () => {
    if (addresses.length === 0) {
      toast.error("Add address First");
      return;
    }
  if (!validateRecipient()) {
    toast.error("Please fill the fields");
    return;
  }
    if (!selectedAddress) {
      toast.error("Please select address");
      return;
    }

    if (!paymentMethod) {
      toast.error("Please select payment method");
      return;
    }

    const selected = addresses.find((a) => a.id === selectedAddress);

    const orderData = {
      payment_type: paymentMethod,
      coupon_code: null,
      price: backendPrice,
      total_price: backendPrice,
      coupon_amount: 0,
      coupon_applied: false,
      delivery_charge: 0,
      ...selected,
    };

    Swal.fire({
      title: "Placing your order...",
      text: "Please wait",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const res = await axios.post(
        `${SERVER_URL}/api/create-order/`,
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        title: "Order Placed!",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(() => {
        nav("/");
      }, 2000);
    } catch (err) {
      Swal.fire({
        title: "Order Failed",
        text: "Something went wrong",
        icon: "error",
      });
    }
  };
  const validateForm = () => {
    let newErrors = {};

    if (!formData.first_name.trim()) {
  newErrors.first_name = "First name is required";
} 
else if (formData.first_name.length < 2) {
  newErrors.first_name = "Should be more than 1 character";
} 
else if (/\s/.test(formData.first_name)) {
  newErrors.first_name = "Name cannot contain whitespace";
} 
else if (!/^[A-Za-z]+$/.test(formData.first_name)) {
  newErrors.first_name = "Name can only contain letters";
}

    if (!formData.last_name.trim())
      newErrors.last_name = "Last name is required";
    else if (!/^[A-Za-z\s]+$/.test(formData.last_name)) {
      newErrors.last_name = "Name can only contain letters and spaces";
    }

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (
      !/^[a-zA-Z0-9._%+-]+@([a-zA-Z-]+\.)+[a-zA-Z]{2,}$/.test(formData.email)
    )
      newErrors.email = "Invalid email format";

    if (!formData.phone_number.trim())
      newErrors.phone_number = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(formData.phone_number))
      newErrors.phone_number = "Enter valid 10-digit phone number";

    if (!formData.address_line1.trim())
      newErrors.address_line1 = "Address line is required";
    else if (formData.address_line1.length > 30)
      newErrors.address_line1 =
        "Address line is should not be more than 30 charectors";

    if (!formData.address_line2.trim())
      newErrors.address_line2 = "Address line is required";

    if (!formData.district.trim()) newErrors.district = "District is required";
    else if (!/^[A-Za-z\s]+$/.test(formData.district)) {
      newErrors.district = "enter valid district";
    }
    if (!formData.state.trim()) newErrors.state = "State is required";
    else if (!/^[A-Za-z\s]+$/.test(formData.state)) {
      newErrors.state = "enter valid state";
    }
    if (!formData.country.trim()) newErrors.country = "Country is required";
    else if (!/^[A-Za-z\s]+$/.test(formData.country)) {
      newErrors.country = "enter a valid country";
    }
    if (!formData.landmark.trim()) newErrors.landmark = "landmark is required";
    else if (!/^[A-Za-z\s]+$/.test(formData.landmark)) {
      newErrors.landmark = "enter a valid landmark";
    }
    if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required";
    else if (!/^[0-9]+$/.test(formData.pincode))
      newErrors.pincode = "Pincode must contain only numbers";
    else if (!/^\d{6}$/.test(formData.pincode))
      newErrors.pincode = "Pincode must be exactly 6 digits";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };
  const validateEditForm = () => {
    let newErrors = {};
if (!formData.first_name.trim()) {
  newErrors.first_name = "First name is required";
} 
else if (formData.first_name.length < 2) {
  newErrors.first_name = "Should be more than 1 character";
} 
else if (/\s/.test(formData.first_name)) {
  newErrors.first_name = "Name cannot contain whitespace";
} 
else if (!/^[A-Za-z]+$/.test(formData.first_name)) {
  newErrors.first_name = "Name can only contain letters";
}

    if (!formData.last_name.trim())
      newErrors.last_name = "Last name is required";
    else if (!/^[A-Za-z\s]+$/.test(formData.last_name)) {
      newErrors.last_name = "Name can only contain letters and spaces";
    }

    if (!formData.address_line1.trim())
      newErrors.address_line1 = "Address Line 1 is required";
    else if (formData.address_line1.length > 30)
      newErrors.address_line1 = "Max 30 characters allowed";

    if (!formData.address_line2.trim())
      newErrors.address_line2 = "Address Line 2 is required";

    if (!formData.landmark.trim()) newErrors.landmark = "Landmark is required";

    if (!formData.district.trim()) newErrors.district = "District is required";
    else if (!/^[A-Za-z\s]+$/.test(formData.district))
      newErrors.district = "Enter a valid district";

    if (!formData.state.trim()) newErrors.state = "State is required";
    else if (!/^[A-Za-z\s]+$/.test(formData.state))
      newErrors.state = "Enter a valid state";

    if (!formData.country.trim()) newErrors.country = "Country is required";
    else if (!/^[A-Za-z\s]+$/.test(formData.country))
      newErrors.country = "Enter a valid country";

    if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required";
    else if (!/^[0-9]+$/.test(formData.pincode))
      newErrors.pincode = "Pincode must contain only numbers";
    else if (!/^\d{6}$/.test(formData.pincode))
      newErrors.pincode = "Pincode must be exactly 6 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setErrors({});
  };
  const closeAddressModal = () => {
    setShowAddForm(false);
    setErrors({});
  };
  const handleRecipientChange = (e) => {
  setRecipient({ ...recipient, [e.target.name]: e.target.value });
};
const validateRecipient = () => {
  let newErrors = {};


  if (!recipient.name.trim()) {
    newErrors.name = "Name is required";
  } else if (!/^[A-Za-z\s]+$/.test(recipient.name)) {
    newErrors.name = "Name can only contain letters and spaces";
  }

  if (!recipient.mobile.trim()) {
    newErrors.mobile = "Mobile number is required";
  } else if (!/^[6-9]\d{9}$/.test(recipient.mobile)) {
    newErrors.mobile = "Enter valid 10-digit mobile number";
  }

  setRecipientErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};


  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <>
      <Navbar />

      <div className="w-full sm:w-[92%] mx-auto p-4 lg:p-6 flex flex-col lg:flex-row gap-10 mt-20">
        <div className="w-full lg:w-2/3 space-y-6">
          <h2 className="text-xl font-bold mb-4 text-[#112444]">
            Choose Delivery Address
          </h2>

          {addresses.length === 0 && !showAddForm && (
            <div
              className="border-2 border-dashed p-6 rounded-lg text-center cursor-pointer hover:bg-gray-50"
              onClick={() => setShowAddForm(true)}
            >
              <div className="text-3xl">+</div>
              <p>Add New Address</p>
            </div>
          )}
          {addresses.length === 0 && showAddForm && (
            <div className="bg-white shadow-[0_0_15px_0_rgba(0,0,0,0.1)] rounded-2xl p-7 pt-10 pb-10 mt-5">
              <form onSubmit={handleAddAddress} className="space-y-3">
                <div className="">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        name="first_name"
                        placeholder="First Name"
                        onChange={handleChange}
                        className="border border-gray-300 shadow-xs p-2 rounded w-full"
                      />
                      {errors.first_name && (
                        <p className="text-red-600 text-xs ml-1 mt-1">
                          {errors.first_name}
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        name="last_name"
                        placeholder="Last Name"
                        onChange={handleChange}
                        className="border border-gray-300 shadow-xs p-2 rounded w-full"
                      />
                      {errors.last_name && (
                        <p className="text-red-600 text-xs ml-1 mt-1">
                          {errors.last_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <input
                        name="email"
                        placeholder="Email"
                        onChange={handleChange}
                        className="border border-gray-300 shadow-xs p-2 rounded w-full"
                      />
                      {errors.email && (
                        <p className="text-red-600 text-xs ml-1 mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      {" "}
                      <input
                        name="phone_number"
                        placeholder="Phone Number"
                        onChange={handleChange}
                        className="border border-gray-300 shadow-xs p-2 rounded w-full"
                      />
                      {errors.phone_number && (
                        <p className="text-red-600 text-xs ml-1 mt-1">
                          {errors.phone_number}
                        </p>
                      )}
                    </div>
                  </div>

                  <input
                    name="address_line1"
                    placeholder="Address Line 1"
                    onChange={handleChange}
                    className="border border-gray-300 shadow-xs p-2 rounded w-full mt-3"
                  />
                  {errors.address_line1 && (
                    <p className="text-red-600 text-xs ml-1 mt-1">
                      {errors.address_line1}
                    </p>
                  )}

                  <input
                    name="address_line2"
                    placeholder="Address Line 2"
                    onChange={handleChange}
                    className="border border-gray-300 shadow-xs p-2 rounded w-full mt-3"
                  />
                  {errors.address_line2 && (
                    <p className="text-red-500 text-xs ml-1 mt-1">
                      {errors.address_line2}
                    </p>
                  )}

                  <input
                    name="landmark"
                    placeholder="Landmark"
                    onChange={handleChange}
                    className="border border-gray-300 shadow-xs p-2 rounded w-full mt-3"
                  />
                  {errors.landmark && (
                    <p className="text-red-500 text-xs ml-1 mt-1">
                      {errors.landmark}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <input
                        name="district"
                        placeholder="District"
                        onChange={handleChange}
                        className="border border-gray-300 shadow-xs p-2 rounded w-full"
                      />
                      {errors.district && (
                        <p className="text-red-600 text-xs ml-1 mt-1">
                          {errors.district}
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        name="state"
                        placeholder="State"
                        onChange={handleChange}
                        className="border border-gray-300 shadow-xs p-2 rounded w-full"
                      />
                      {errors.state && (
                        <p className="text-red-600 text-xs ml-1 mt-1">
                          {errors.state}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      {" "}
                      <input
                        name="country"
                        placeholder="Country"
                        onChange={handleChange}
                        className="border border-gray-300 shadow-xs p-2 rounded w-full"
                      />
                      {errors.country && (
                        <p className="text-red-600 text-xs ml-1 mt-1">
                          {errors.country}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        name="pincode"
                        placeholder="Pincode"
                        onChange={handleChange}
                        className="border border-gray-300 shadow-xs p-2 rounded w-full"
                      />
                      {errors.pincode && (
                        <p className="text-red-600 text-xs ml-1 mt-1">
                          {errors.pincode}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-[#112444] text-white py-2 w-full rounded cursor-pointer mt-4"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          )}

          {addresses.length > 0 && (
            <>
              <div className="space-y-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className=" flex  flex-wrap md:flex justify-between items-start gap-2 p-4 rounded-lg shadow-[0_0_15px_0_rgba(0,0,0,0.2)]  bg-white"
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

                    <div className="mt-2 ml-6">
                      <button
                        className="text-white bg-blue-950 px-5 py-1 rounded-sm  mr-3 cursor-pointer"
                        onClick={() => {
                          loadAddressIntoForm(addr);
                          setEditId(addr.id);
                          setIsEditOpen(true);
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="text-white bg-red-700 px-5 py-1 rounded-sm  mr-3 cursor-pointer"
                        onClick={() => deleteAddress(addr.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}

                {!showAddForm && (
                  <div
                    className="border-2 border-dashed p-6 rounded-lg text-center cursor-pointer hover:bg-gray-50"
                    onClick={() => setShowAddForm(true)}
                  >
                    <div className="text-3xl">+</div>
                    <p
                      onClick={() => {
                        setShowAddForm(true);
                        setFormData({
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
                      }}
                    >
                      Add New Address
                    </p>
                  </div>
                )}

                {showAddForm && (
                  <div className=" p-7 mt-9.5 bg-white rounded-lg shadow-[0_0_15px_0_rgba(0,0,0,0.1)] ">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-[#112444]  mb-3">
                        Add New Address
                      </h3>

                      <button
                        onClick={closeAddressModal}
                        className="text-gray-500  hover:text-black text-2xl"
                      >
                        ×
                      </button>
                    </div>

                    <form onSubmit={handleAddAddress} className="space-y-3">
                      <div className=" ">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <input
                              name="first_name"
                              placeholder="First Name"
                              onChange={handleChange}
                              className="border border-gray-300 shadow-xs p-2 rounded w-full"
                            />
                            {errors.first_name && (
                              <p className="text-red-500 text-xs ml-1 mt-1">
                                {errors.first_name}
                              </p>
                            )}
                          </div>

                          <div>
                            <input
                              name="last_name"
                              placeholder="Last Name"
                              onChange={handleChange}
                              className="border border-gray-300 shadow-xs p-2 rounded w-full"
                            />
                            {errors.last_name && (
                              <p className="text-red-500 text-xs ml-1 mt-1">
                                {errors.last_name}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <div>
                            <input
                              name="email"
                              placeholder="Email"
                              onChange={handleChange}
                              className="border border-gray-300 shadow-xs p-2 rounded w-full"
                            />
                            {errors.email && (
                              <p className="text-red-500 text-xs ml-1 mt-1">
                                {errors.email}
                              </p>
                            )}
                          </div>

                          <div>
                            {" "}
                            <input
                              name="phone_number"
                              placeholder="Phone Number"
                              onChange={handleChange}
                              className="border border-gray-300 shadow-xs p-2 rounded w-full"
                            />
                            {errors.phone_number && (
                              <p className="text-red-500 text-xs ml-1 mt-1">
                                {errors.phone_number}
                              </p>
                            )}
                          </div>
                        </div>

                        <input
                          name="address_line1"
                          placeholder="Address Line 1"
                          onChange={handleChange}
                          className="border border-gray-300 shadow-xs p-2 rounded w-full mt-3"
                        />
                        {errors.address_line1 && (
                          <p className="text-red-500 text-xs ml-1 mt-1">
                            {errors.address_line1}
                          </p>
                        )}

                        <input
                          name="address_line2"
                          placeholder="Address Line 2"
                          onChange={handleChange}
                          className="border border-gray-300 shadow-xs p-2 rounded w-full mt-3"
                        />
                        {errors.address_line1 && (
                          <p className="text-red-500 text-xs ml-1 mt-1">
                            {errors.address_line1}
                          </p>
                        )}

                        <input
                          name="landmark"
                          placeholder="Landmark"
                          onChange={handleChange}
                          className="border border-gray-300 shadow-xs p-2 rounded w-full mt-3"
                        />
                        {errors.landmark && (
                          <p className="text-red-500 text-xs ml-1 mt-1">
                            {errors.landmark}
                          </p>
                        )}

                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <div>
                            <input
                              name="district"
                              placeholder="District"
                              onChange={handleChange}
                              className="border border-gray-300 shadow-xs p-2 rounded w-full"
                            />
                            {errors.district && (
                              <p className="text-red-500 text-xs ml-1 mt-1">
                                {errors.district}
                              </p>
                            )}
                          </div>

                          <div>
                            <input
                              name="state"
                              placeholder="State"
                              onChange={handleChange}
                              className="border border-gray-300 shadow-xs p-2 rounded w-full"
                            />
                            {errors.state && (
                              <p className="text-red-500 text-xs ml-1 mt-1">
                                {errors.state}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <div>
                            {" "}
                            <input
                              name="country"
                              placeholder="Country"
                              onChange={handleChange}
                              className="border border-gray-300 shadow-xs p-2 rounded w-full"
                            />
                            {errors.country && (
                              <p className="text-red-500 text-xs ml-1 mt-1">
                                {errors.country}
                              </p>
                            )}
                          </div>
                          <div>
                            <input
                              name="pincode"
                              placeholder="Pincode"
                              onChange={handleChange}
                              className="border border-gray-300 shadow-xs p-2 rounded w-full"
                            />
                            {errors.pincode && (
                              <p className="text-red-500 text-xs ml-1 mt-1">
                                {errors.pincode}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="bg-[#112444] text-white py-2 w-full rounded cursor-pointer mt-4"
                        >
                          Save Address
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </>
          )}

          <div>
            <h5 className="text-lg font-semibold mb-2 mt-5">Add Recipient</h5>
            <form
              action=""
              className="flex gap-6 w-[90%]  md:w-full justify-between"
            >
             <div className="flex flex-col w-1/2 space-y-2.5">
  <label>Name</label>
  <input
    name="name"
    value={recipient.name}
    onChange={handleRecipientChange}
    className="border-gray-400 shadow-[0_0_15px_0_rgba(0,0,0,0.1)] p-2 rounded-lg"
    type="text"
  />
  {recipientErrors.name && (
    <p className="text-red-500 text-xs mt-1">{recipientErrors.name}</p>
  )}
</div>

<div className="flex flex-col w-1/2 space-y-2.5">
  <label>Mobile number</label>
  <input
    name="mobile"
    value={recipient.mobile}
    onChange={handleRecipientChange}
    className="border-gray-400 shadow-[0_0_15px_0_rgba(0,0,0,0.1)] p-2 rounded-lg"
    type="text"
  />
  {recipientErrors.mobile && (
    <p className="text-red-500 text-xs mt-1">{recipientErrors.mobile}</p>
  )}
</div>
            </form>
            <h2 className="text-xl mb-3 font-bold text-[#112444] mt-6">
              Payment Method
            </h2>
            <div className="flex flex-col space-y-7">
              <div className="flex flex-wrap shadow-[0_0_15px_0_rgba(0,0,0,0.2)] px-7 rounded-lg gap-4 items-center">
                <input
                  type="radio"
                  name="payment_method"
                  id="gpay"
                  onChange={() => setPaymentMethod("gpay")}
                />
                <img src={Gpay} alt="" className="w-[50px]" />
                <h4>Google Pay UPI </h4>
                <span className="pb-6 md:pb-0">xxxxxx@okhdfcbank</span>
              </div>
              <div className="shadow-[0_0_15px_0_rgba(0,0,0,0.2)] px-7 py-5 rounded-lg w-full ">
                <div className="flex items-center gap-4 mb-3">
                  <input
                    type="radio"
                    name="payment_method"
                    id="upi_main"
                    onChange={() => setPaymentMethod("upi")}
                  />

                  <img src={Gpay} alt="Gpay" className="w-[50px]" />

                  <h4 className="font-semibold">UPI</h4>
                  <p className="text-sm text-gray-600">Pay By Any UPI App</p>
                </div>

                <p className="ml-7 mt-2 mb-2 font-medium text-gray-700">
                  Choose an Option
                </p>

                <div className="flex flex-col gap-3 ml-7">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="upi_option" id="phonepe" />
                    <span>PhonePe</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input type="radio" name="upi_option" id="upi_id" />
                    <span>Your UPI ID</span>
                  </label>

                  <div className="flex items-center flex-wrap gap-4 w-full">
                    <div className="relative w-1/2">
                      <input
                        type="text"
                        placeholder="yourname@upi"
                        className="border border-gray-400 rounded-lg p-2 w-full pr-20"
                      />

                      <button className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-950 font-semibold text-sm hover:underline cursor-pointer">
                        Verify
                      </button>
                    </div>

                    <button className="bg-blue-950 font-semibold text-white px-4 py-2 rounded-lg text-sm cursor-pointer ">
                      Pay 2066
                    </button>
                  </div>
                </div>
              </div>
              <div className="shadow-[0_0_15px_0_rgba(0,0,0,0.2)] px-7 py-5 rounded-lg w-full ">
                <div className="flex items-center gap-4 mb-3">
                  <input
                    type="radio"
                    name="payment_method"
                    id="card"
                    onChange={() => setPaymentMethod("card")}
                  />

                  <p className="text-sm text-gray-600">
                    Credit card / Debit Card
                  </p>
                </div>

                <div className="flex flex-col gap-4 ml-7">
                  <div className="flex flex-col">
                    <input
                      type="text"
                      placeholder="Enter Card Number"
                      className="border border-gray-400 rounded-lg p-2 w-[400px] max-w-full"
                    />
                  </div>

                  <div className="flex flex-wrap md:flex gap-3">
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

                    <input
                      type="text"
                      placeholder="CVV"
                      className="border border-gray-400 rounded-lg p-2 w-1/2 md:w-1/4"
                    />
                  </div>

                  <button className="bg-blue-950 font-semibold text-white px-4 py-2 rounded-lg text-sm w-1/2 md:w-1/4 cursor-pointer">
                    Pay ₹2066
                  </button>
                </div>
              </div>

              <div className="shadow-[0_0_15px_0_rgba(0,0,0,0.2)] px-7 py-5 rounded-lg w-full ">
                <div className="flex items-center gap-4 mb-3">
                  <input
                    type="radio"
                    name="payment_method"
                    id="netbanking"
                    onChange={() => setPaymentMethod("netbanking")}
                  />

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
                  <button className="bg-blue-950 font-semibold text-white px-13 py-2 rounded-lg text-sm cursor-pointer ">
                    Pay 2066
                  </button>
                </div>
              </div>

              <div className="flex py-3 shadow-[0_0_15px_0_rgba(0,0,0,0.2)] px-7 rounded-lg gap-4 items-center">
                <input
                  type="radio"
                  name="payment_method"
                  id="cod"
                  onChange={() => setPaymentMethod("cod")}
                />

                <h4>Cash on Delivery</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-6 h-fit md:mt-10  w-full lg:w-1/3">
          <h2 className="text-xl font-semibold text-[#112444] mb-4">
            Order Summary
          </h2>
          <div className=" mb-4">
            {cart.map((item) => (
              <div
                className="flex justify-between items-center "
                key={item.id || item.productId}
              >
                <div className="flex items-center ">
                  <img
                    src={item.product?.mainimage || item.mainimage}
                    alt=""
                    className="w-[50px] h-[50px] mr-2 mb-2"
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
            className="mt-6 w-full bg-[#112444] text-white py-3 rounded font-semibold cursor-pointer"
          >
            Place Order
          </button>
        </div>
      </div>

      {isEditOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="fixed inset-0  items-center justify-center bg-black/60 backdrop-opacity-[100px]  "
            onClick={closeEditModal}
          ></div>

          <div
            className="relative bg-white w-[500px] rounded-lg shadow-2xl animate-[zoomIn_0.25s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 ">
              <h2 className="text-xl font-semibold">Edit Address</h2>
              <button
                onClick={closeEditModal}
                className="text-gray-500 hover:text-black text-xl cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex gap-4">
                <div>
                  <input
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="border border-gray-300 shadow-xs p-2 rounded w-full"
                    placeholder="First Name"
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-xs ml-1 mt-1">
                      {errors.first_name}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="border border-gray-300 shadow-xs p-2 rounded w-full"
                    placeholder="Last Name"
                  />{" "}
                  {errors.last_name && (
                    <p className="text-red-500 text-xs ml-1 mt-1">
                      {errors.last_name}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <input
                  name="address_line1"
                  value={formData.address_line1}
                  onChange={handleChange}
                  className="border border-gray-300 shadow-xs p-2 rounded w-full"
                  placeholder="Address Line 1"
                />
                {errors.address_line1 && (
                  <p className="text-red-500 text-xs ml-1 mt-1">
                    {errors.address_line1}
                  </p>
                )}
              </div>

              <div>
                <input
                  name="address_line2"
                  value={formData.address_line2}
                  onChange={handleChange}
                  className="border border-gray-300 shadow-xs p-2 rounded w-full"
                  placeholder="Address Line 2"
                />
                {errors.address_line2 && (
                  <p className="text-red-500 text-xs ml-1 mt-1">
                    {errors.address_line2}
                  </p>
                )}
              </div>
              <div>
                <input
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                  className="border border-gray-300 shadow-xs p-2 rounded w-full"
                  placeholder="Landmark"
                />
                {errors.landmark && (
                  <p className="text-red-500 text-xs ml-1 mt-1">
                    {errors.landmark}
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <div>
                  <input
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="border border-gray-300 shadow-xs p-2 rounded w-full"
                    placeholder="District"
                  />
                  {errors.district && (
                    <p className="text-red-500 text-xs ml-1 mt-1">
                      {errors.district}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="border border-gray-300 shadow-xs p-2 rounded w-full"
                    placeholder="State"
                  />
                  {errors.state && (
                    <p className="text-red-500 text-xs ml-1 mt-1">
                      {errors.state}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-4">
                <div>
                  {" "}
                  <input
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="border border-gray-300 shadow-xs p-2 rounded w-full"
                    placeholder="Country"
                  />
                  {errors.country && (
                    <p className="text-red-500 text-xs ml-1 mt-1">
                      {errors.country}
                    </p>
                  )}
                </div>

                <div>
                  {" "}
                  <input
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="border border-gray-300 shadow-xs p-2 rounded w-full"
                    placeholder="Pincode"
                  />
                  {errors.pincode && (
                    <p className="text-red-500 text-xs ml-1 mt-1">
                      {errors.pincode}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4  bg-gray-50">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (validateEditForm()) {
                    updateAddress(editId);
                  }
                }}
                className="px-4 py-2 bg-[#112444] text-white rounded cursor-pointer"
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
