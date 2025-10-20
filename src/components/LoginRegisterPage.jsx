import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [isLogin, setIsLogin] = useState(false);
    const [formData, setFormData] = useState({
    firstname: "",
    lastname:"",
    email: "",
    password: "",
    confirmpassword: "",
  });
  const [errors, setErrors] = useState({});
  const[reg,setReg]=useState([]);
  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
    
    const validate = () => {
    const errors = {};
  if(!isLogin){
    if (!formData.firstname) {
      errors.firstname = "Name is required";
    } else if (!/^[A-Za-z\s]+$/.test(formData.firstname)) {
      errors.firstname = "Name can only contain letters and spaces";
    } else if (!/^\S(?:.*\S)?$/.test(formData.firstname)) {
      errors.firstname = "Name cannot contain whitespace";
    }
    
    if (!formData.lastname) {
      errors.lastname = "Name is required";
    } else if (!/^[A-Za-z\s]+$/.test(formData.lastname)) {
      errors.lastname = "Name can only contain letters and spaces";
    } else if (!/^\S(?:.*\S)?$/.test(formData.lastname)) {
      errors.lastname = "Name cannot contain whitespace";
    }}

    if (!formData.email) {
      errors.email = "email is required";
    } else if (
      !/^[a-zA-Z0-9._%+-]+@([a-zA-Z-]+\.)+[a-zA-Z]{2,}$/.test(formData.email)
    ) {
      errors.email = "enter a valid mail";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "password should atleast have 6 charecters";
    } 
else if (!/^\S+$/.test(formData.password)) {
  errors.password = "Password cannot contain spaces";
}

else if (
  !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/.test(formData.password)
) {
  errors.password = "Must include letter, number & special char";
}


    if(!formData.confirmpassword){
        errors.confirmpassword="Retype the password"
    }else if(!isLogin &&formData.confirmpassword !== formData.password) {
      errors.confirmpassword = "password not match";
    }

    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const valid = validate();
    if (Object.keys(valid).length > 0) {
      setErrors(valid);
    } else {
      setErrors({});
       if (isLogin) {
        const user=reg.find(e=>e.email==formData.email&&e.password==formData.password);
        if(user){
      alert('Login successful');
      console.log("Login data", formData);
    navigate('/')}
      else{
        alert('invalid user')
      }
    } else {
        setReg([...reg,{email:formData.email,password:formData.password}]);
      alert('Registration successful');
      console.log("Register data", formData);
      setIsLogin(true);
    }
      setFormData({
        firstname: "",
        lastname:"",
        email: "",
        password: "",
        confirmpassword: "",
      });
     
    }
  };

  return (
    <>
      <div className="flex justify-center items-center relative w-full min-h-screen md:h-[100vh] overflow-hidden">

        
        <div className='w-[150px] h-[150px] bg-blue-950 rounded-full absolute left-[-120px] z-0 bg-radial-[at_50%_75%] from-white to-blue-950 to-90%'></div>
        <div className='w-[150px] h-[150px] bg-blue-950 rounded-full absolute top-[-20px] left-[460px] z-0 bg-radial-[at_150%_25%] from-white to-blue-950 to-74%'></div>
        <div className='w-[200px] h-[200px] rounded-full absolute bottom-[-10pxgicd] right-[260px] bg-radial-[at_25%_25%] from-white to-blue-950 to-75% z-0'></div>

        <div className='w-[90%] mt-[5px] mx-auto md:w-[55%] sm:w-[60%] shadow-[0_7px_29px_0px_rgba(100,100,111,0.2)] rounded-xl flex flex-col-reverse  lg:flex lg:flex-row z-10 relative bg-white'>
          
       
          <div className='w-[90%] lg:w-[50%] flex flex-col gap-2 p-7'>
            <h2 className='text-3xl font-bold'>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className='font-[16px]'>
              {isLogin ? 'Login to your account' : 'Create Your Sneakly Account'}
            </p>

            <button className='border border-black p-1.5 rounded-md mt-1.5 '>
                <i className="fa-brands fa-google m-1.5 "></i>
              {isLogin ? 'Login with Google' : 'Sign up with Google'}
            </button>
            <div className='text-center text-gray-500 text-[13px] '>
              Or, {isLogin ? 'login' : 'signup'} with email
            </div>

         
            <form className='flex flex-col gap-3 mt-1' onSubmit={handleSubmit}> 
              {!isLogin && (
                <div className='flex flex-col '>
                    <div className=' grid  grid-col-1 sm:grid-cols-2 gap-5'>
                   <input type="text" placeholder='First name' name='firstname'  value={formData.firstname} className=' w-full border p-1.5 rounded-sm text-sm' onChange={handleChange} />
                 
                  <input type="text" placeholder='Last name'  name='lastname'  value={formData.lastname} className=' w-full border p-1.5  rounded-sm text-sm'  onChange={handleChange}/>
                    </div>
                  
                   <div className='flex  gap-5 justify-around'>
                     {errors.firstname ? (
                <p className="text-red-500 text-sm  mt-2 w-1/2">
                  {errors.firstname}
                </p>
              ) : <p className='w-1/2'></p>}
               {errors.lastname ? (
                <p className="text-red-500 text-sm mt-2 w-1/2">
                  {errors.lastname}
                </p>
              ) : <p className='w-1/2'></p>}
                </div>
                </div>
               
              )}
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
              {!isLogin && (<>
                <input type="password" placeholder='Confirm password'  name='confirmpassword'  value={formData.confirmpassword} className='border p-1.5 rounded-sm text-sm' onChange={handleChange} />
                 {errors.confirmpassword ? (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmpassword}
                </p>
              ) : null}
              </>
              )}
              <button type='submit' className='p-2 bg-[#112444] text-white rounded-sm cursor-pointer '>
                {isLogin ? 'Login' : 'Submit'}
              </button>
            </form>

  
            <div className='flex justify-center gap-2 text-[13px] mt-2'>
              <span>{isLogin ? "Don't have an account?" : "Have an account?"}</span>
              <span
                onClick={() => setIsLogin(!isLogin)}
                className='text-blue-700 cursor-pointer font-medium hover:underline '
              >
                {isLogin ? 'Register' : 'Login'}
              </span>
            </div>

            <div className='flex items-center justify-center text-center gap-4 font-bold text-[14px] mt-1'>
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
                {isLogin ? 'Manage your business easily' : 'Simply the business'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
