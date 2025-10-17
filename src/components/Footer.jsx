import React from 'react';

const Footer = () => {
    
    
    return (
      
        <footer className="bg-slate-800 text-gray-300 border-t mt-12 ">
            <div className="w-[90%] mx-auto pt-12 pb-5 px-4 ">
                
           
                <div className="flex justify-start gap-6.5 flex-wrap sm:grid grid-cols-4 sm:gap-1   ">
                    
                    
                    <div className=" flex flex-col sm:w-[100px] md:w-[100px]">
                        <h3 className="text-2xl font-bold text-white mb-3 overflow-y-hidden">Sneakly</h3>
                        <p className="text-gray-400 text-sm max-w-xs">
                            Step up your style with the latest and greatest in sneaker fashion. New arrivals every week!
                        </p>
                    </div>
                    
                    <div>
                        <h4 className="text-md font-semibold text-white mb-4 uppercase ">
                            Company
                        </h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-sm">About Us</a></li>
                            <li><a href="#" className="text-sm">Careers</a></li>
                            <li><a href="#" className="text-sm">News & Blog</a></li>
                            <li><a href="#" className="text-sm ">Partnerships</a></li>
                        </ul>
                    </div>

                    
                    <div>
                        <h4 className="text-md font-semibold text-white mb-4 uppercase ">
                            Support
                        </h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-sm">Contact Us</a></li>
                            <li><a href="#" className="text-sm">FAQs</a></li>
                            <li><a href="#" className="text-sm">Shipping</a></li>
                            <li><a href="#" className="text-sm">Returns</a></li>
                        </ul>
                    </div>

                    
                    <div >
                        <h4 className="text-md font-semibold text-white mb-4 uppercase ">
                            Stay Updated
                        </h4>
                        <p className="text-sm mb-3 text-gray-400">
                            Get 10% off your first order!
                        </p>
                        
                    </div>
                </div>

                
                
                <div className="mt-6  border-t border-gray-700">
                    
                    
                    <p className="text-sm text-gray-400 text-center mt-4">
                        &copy; 2025 **Sneakly**. All rights reserved.
                    </p>

                    
                    
                </div>
            </div>
        </footer>
    );
};

export default Footer;