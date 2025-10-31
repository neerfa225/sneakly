import React, { useState ,useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
const Login = () => {

  const [formData, setFormData] = useState({
   
    email: "",
    password: "",
   
  });
  const [errors, setErrors] = useState({});

  

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const errors = {};
    

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/^[a-zA-Z0-9._%+-]+@([a-zA-Z-]+\.)+[a-zA-Z]{2,}$/.test(formData.email)) {
      errors.email = "Enter a valid email";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password should have at least 6 characters";
    } else if (!/^\S+$/.test(formData.password)) {
      errors.password = "Password cannot contain spaces";
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/.test(formData.password)) {
      errors.password = "Must include letter, number & special char";
    }

  

    return errors;
  };

  const handleSubmit =async (e) => {
    e.preventDefault();
    const valid = validate();

    if (Object.keys(valid).length > 0) {
      setErrors(valid);
      return;
    }

    setErrors({});

 
    
     try {
      const response = await axios.post("http://192.168.1.94:8002/user/login/", {
        username: formData.email,
        password: formData.password,
      });

      toast.success("Login Successful!");
      
    
      localStorage.setItem("userData", JSON.stringify(response.data));

   
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid credentials!");
    } 
  }
 

  return (
    <> 
      <div className="flex justify-center items-center relative w-full min-h-screen md:h-[100vh] overflow-hidden">

       
        <div className='w-[150px] h-[150px] bg-blue-950 rounded-full absolute left-[-120px] z-0 bg-radial-[at_50%_75%] from-white to-blue-950 to-90%'></div>
        <div className='w-[150px] h-[150px] bg-blue-950 rounded-full absolute top-[-20px] left-[460px] z-0 bg-radial-[at_150%_25%] from-white to-blue-950 to-74%'></div>
        <div className='w-[200px] h-[200px] rounded-full absolute bottom-[-10px] right-[260px] bg-radial-[at_25%_25%] from-white to-blue-950 to-75% z-0'></div>

        <div className='w-[90%] mt-[5px] mx-auto md:w-[55%] sm:w-[60%] shadow-[0_7px_29px_0px_rgba(100,100,111,0.2)] rounded-xl flex flex-col-reverse justify-center lg:flex lg:flex-row z-10 relative bg-white'>
          
       
          <div className='w-[90%] lg:w-[50%] flex flex-col  gap-2 p-7 ml-[20px] md:ml-0'>
            <h2 className='text-3xl font-bold'>
             Welcome Back
            </h2>
            <p className='font-[16px]'>
          Login to your account
            </p>

            <button className='border border-black p-1.5 rounded-md mt-1.5 '>
                <i className="fa-brands fa-google m-1.5 "></i>
             Login with Google
            </button>
            <div className='text-center text-gray-500 text-[13px] '>
              Or,login with email
            </div>

         
            <form className='flex flex-col gap-3 mt-1' onSubmit={handleSubmit}> 
             
               
              <input type="email" placeholder='Email' name='email'  value={formData.email} className='border p-1.5 rounded-sm text-sm'onChange={handleChange} />
              {errors.email ? (
                <p className="text-red-500 text-sm ">
                  {errors.email}
                </p>
              ) : null} 
              <input type="password" placeholder='Password' name='password'  value={formData.password} className='border p-1.5 rounded-sm text-sm'onChange={handleChange} />
              {errors.password ? (
                <p className="text-red-500 text-sm ">
                  {errors.password}
                </p>
              ) : null}
             
              
              <button type='submit' className='p-2 bg-[#112444] text-white rounded-sm cursor-pointer '>
                Login 
              </button>
            </form>

  
            <div className='flex justify-center gap-2 text-[13px] mt-2'>
              <span>Don't have an account?</span>
              <span
                onClick={() => navigate('/reg')}
                className='text-blue-700 cursor-pointer font-medium hover:underline '
              >
              Register
              </span>
            </div>

            <div className='flex items-center justify-center text-center gap-4 font-bold text-[11px] sm:text-[14px] mt-1'>
              <span>Customer Support</span>
              <span>Terms and conditions</span>
            </div>
          </div>

      
          <div className='w-[100%] lg:w-[50%] rounded-xl bg-[#112444] text-white flex justify-start items-end h-auto p-7'>
            <div className='flex flex-col gap-3.5 mb-2'>
              <div className='text-3xl'>
                 Welcome  to your <br />
                Sneakly Account
              </div>
              <div>
               Manage your business easily
              </div>
            </div>
          </div>
        </div>
      </div>
       <ToastContainer
              position="top-right"
              autoClose={2000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              pauseOnHover
              draggable
              theme="colored"
              
            />
    </>
  );
};

export default Login;
