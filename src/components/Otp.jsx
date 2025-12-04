import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { SERVER_URL } from '../Services/serverURL';

const VerifyOtp = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");

  const handleVerify = async () => {
    const formData = JSON.parse(localStorage.getItem("registerData"));

    if (!otp) {
      toast.error("Please enter OTP");
      return;
    }

    try {

         await axios.post(`${SERVER_URL}/user/verify-token/`, {
        email: formData.email,
        otp: otp,
      });

      await axios.post(`${SERVER_URL}/user/register/`, {
        first_name: formData.firstname,
        last_name: formData.lastname,
        email: formData.email,
        password: formData.password,
        otp: otp,
      });

      toast.success("Registration successful!");
      localStorage.removeItem("registerData");
      setTimeout(() => navigate("/login"), 1500);

    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP or registration failed!");
    }
  };

  return (
    <div className="flex justify-center items-center w-full min-h-screen bg-gray-100 relative">
      <div className='w-[90%] mt-[5px] mx-auto md:w-[40%]  lg:w-[30%] shadow-[0_7px_29px_0px_rgba(100,100,111,0.2)] rounded-xl flex flex-col justify-center z-10 relative bg-white p-6'>
        <h2 className="text-2xl font-bold text-center text-[#112444] mb-4">Verify OTP</h2>
        <p className="text-gray-500 text-center mb-4">Enter the OTP sent to your email to complete registration</p>

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="border p-2 rounded-md w-full mb-4 text-center"
        />

        <button
          onClick={handleVerify}
          className="p-2 bg-[#112444] text-white rounded-md w-full"
        >
          Verify & Register
        </button>
      </div>

      <ToastContainer position="top-right" autoClose={2000} theme="colored" />
    </div>
  );
};

export default VerifyOtp;
